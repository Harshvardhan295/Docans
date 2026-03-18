import os
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

collection_name = "docans_collection"

# 2. Load the CPU-friendly embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
vector_size = 384  # Exact output dimension for all-MiniLM-L6-v2

# 3. Create the remote collection if it doesn't exist
if not client.collection_exists(collection_name):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )
print("Successfully connected to Qdrant Cloud!")

async def store_chunks_in_db(filename: str, chunks: list[str]):
    if not chunks:
        return

    print(f"Uploading {len(chunks)} chunks to Qdrant Cloud...")
    
    # Isolate context: Delete and recreate the remote collection to clear old document data
    client.delete_collection(collection_name=collection_name)
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
            payload={"filename": filename, "text": chunk}
        )
        for embedding, chunk in zip(embeddings, chunks)
    ]

    # Push to Qdrant Cloud
    client.upsert(
        collection_name=collection_name,
        points=points
    )
    print("Cloud upload complete.")

async def retrieve_relevant_chunks(query: str, n_results: int = 4) -> list[str]:
    # Embed the search query locally
    query_embedding = embedding_model.encode(query).tolist()

    # Query the remote Qdrant Cloud cluster using the modern query_points API
    search_result = client.query_points(
        collection_name=collection_name,
        query=query_embedding,  # Note: The parameter is now 'query', not 'query_vector'
        limit=n_results
    )

    # query_points returns a QueryResponse object containing a list of 'points'
    if not search_result.points:
        return []

    # Extract the raw text chunks from the returned payload
    return [hit.payload["text"] for hit in search_result.points]