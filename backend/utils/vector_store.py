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
    api_key=QDRANT_API_KEY,
)

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
vector_size = 384

print("Successfully connected to Qdrant Cloud!")


def _sanitize_collection_name(filename: str) -> str:
    name = os.path.splitext(filename)[0]
    name = name.lower()
    name = re.sub(r"[^a-z0-9]", "_", name)
    name = re.sub(r"_+", "_", name).strip("_")
    return f"docans_{name}"


async def store_chunks_in_db(session_id: str, filename: str, chunks: list[dict]):
    if not chunks:
        return

    collection_name = _sanitize_collection_name(filename)
    print(f"Creating collection '{collection_name}' and uploading {len(chunks)} chunks...")

    if client.collection_exists(collection_name=collection_name):
        client.delete_collection(collection_name=collection_name)

    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    embeddings = embedding_model.encode([chunk["text"] for chunk in chunks]).tolist()

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                "filename": filename,
                "text": chunk["text"],
                "source": chunk["source"],
                "session_id": session_id,
            },
        )
        for embedding, chunk in zip(embeddings, chunks)
    ]

    client.upsert(collection_name=collection_name, points=points)
    print(f"Cloud upload complete: collection='{collection_name}', session={session_id}")


async def retrieve_relevant_chunks(session_id: str, query: str, filename: str, n_results: int = 4) -> list[dict]:
    collection_name = _sanitize_collection_name(filename)

    if not client.collection_exists(collection_name=collection_name):
        print(f"Warning: Qdrant collection '{collection_name}' not found.")
        return []

    query_embedding = embedding_model.encode(query).tolist()

    search_result = client.query_points(
        collection_name=collection_name,
        query=query_embedding,
        limit=n_results,
    )

    if not search_result.points:
        return []

    return [
        {
            "text": hit.payload["text"],
            "source": str(hit.payload.get("source", "")),
        }
        for hit in search_result.points
    ]
