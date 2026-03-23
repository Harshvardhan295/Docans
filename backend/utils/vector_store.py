# backend/utils/vector_store.py
import os
import re
import uuid
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not QDRANT_URL or not QDRANT_API_KEY:
    raise ValueError("CRITICAL ERROR: QDRANT_URL or QDRANT_API_KEY is missing from your .env file.")

print("Connecting to Qdrant Cloud Cluster securely...")
client = QdrantClient(
    url=QDRANT_URL, 
    api_key=QDRANT_API_KEY
)

# Load the CPU-friendly embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
vector_size = 384  # Exact output dimension for all-MiniLM-L6-v2

print("Successfully connected to Qdrant Cloud!")


def _sanitize_collection_name(filename: str) -> str:
    """
    Convert a raw filename into a valid Qdrant collection name.
    Example: "My Report (2024).pdf" -> "docans_my_report_2024"
    """
    # Strip the file extension (.pdf, .pptx, etc.)
    name = os.path.splitext(filename)[0]
    # Lowercase everything
    name = name.lower()
    # Replace any non-alphanumeric character with an underscore
    name = re.sub(r"[^a-z0-9]", "_", name)
    # Collapse multiple underscores into one and strip leading/trailing
    name = re.sub(r"_+", "_", name).strip("_")
    return f"docans_{name}"


async def store_chunks_in_db(session_id: str, filename: str, chunks: list[str]):
    if not chunks:
        return
    
    # Derive collection name from the original uploaded filename
    collection_name = _sanitize_collection_name(filename)
    print(f"Creating collection '{collection_name}' and uploading {len(chunks)} chunks...")
    
    # If the user re-uploads a file with the same name, clear the old one first
    if client.collection_exists(collection_name=collection_name):
        client.delete_collection(collection_name=collection_name)
        
    # Create the new remote collection
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    # Generate embeddings locally
    embeddings = embedding_model.encode(chunks).tolist()

    # Package into Qdrant Points (Vectors + Text Payload)
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={"filename": filename, "text": chunk, "session_id": session_id}
        )
        for embedding, chunk in zip(embeddings, chunks)
    ]

    # Push to Qdrant Cloud
    client.upsert(
        collection_name=collection_name,
        points=points
    )
    print(f"Cloud upload complete: collection='{collection_name}', session={session_id}")


async def retrieve_relevant_chunks(session_id: str, query: str, filename: str, n_results: int = 4) -> list[str]:
    """
    Retrieve relevant chunks from the Qdrant collection named after the original file.
    The filename is looked up from Supabase in main.py and passed in here.
    """
    # Derive collection name from the original filename
    collection_name = _sanitize_collection_name(filename)
    
    # Safety Check: Ensure the collection exists
    if not client.collection_exists(collection_name=collection_name):
        print(f"Warning: Qdrant collection '{collection_name}' not found.")
        return []

    # Embed the search query locally
    query_embedding = embedding_model.encode(query).tolist()

    # Query ONLY the remote collection for this specific file
    search_result = client.query_points(
        collection_name=collection_name,
        query=query_embedding,  
        limit=n_results
    )

    if not search_result.points:
        return []

    # Extract the raw text chunks
    return [hit.payload["text"] for hit in search_result.points]