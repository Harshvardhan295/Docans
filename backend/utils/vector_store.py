import chromadb
from sentence_transformers import SentenceTransformer

print("Connecting to persistent ChromaDB Server...")

# 1. REMOVE PersistentClient and replace with HttpClient
# We connect to localhost on port 8001 (where our Docker container is exposed)
chroma_client = chromadb.HttpClient(host="localhost", port=8001)

# 2. Get or create the collection on the remote server
collection = chroma_client.get_or_create_collection(name="docans_collection")

# 3. Load the CPU-friendly embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2') 

print("Successfully connected to Vector Store!")

async def store_chunks_in_db(filename: str, chunks: list[str]):
    if not chunks: return
        
    # Clear previous documents from the DB so retrieval is isolated to the current file
    existing_data = collection.get()
    if existing_data and existing_data['ids']:
        collection.delete(ids=existing_data['ids'])
    
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"filename": filename} for _ in chunks]
    
    # Generate embeddings
    embeddings = embedding_model.encode(chunks).tolist()
    
    # Upsert data to the remote server
    collection.upsert(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=chunks)

async def retrieve_relevant_chunks(query: str, n_results: int = 4) -> list[str]:
    # Retrieve top 4 chunks from the remote server
    query_embedding = embedding_model.encode([query]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=n_results)
    
    if not results['documents'] or not results['documents'][0]:
        return []
    return results['documents'][0]