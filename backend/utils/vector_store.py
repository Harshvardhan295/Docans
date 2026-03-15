import chromadb
from sentence_transformers import SentenceTransformer

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="docans_collection")

# 3. Fast CPU Embedding Model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2') 

async def store_chunks_in_db(filename: str, chunks: list[str]):
    if not chunks: return
        
    # CRITICAL: Clear previous documents from the DB so retrieval is accurate
    existing_data = collection.get()
    if existing_data and existing_data['ids']:
        collection.delete(ids=existing_data['ids'])
    
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"filename": filename} for _ in chunks]
    embeddings = embedding_model.encode(chunks).tolist()
    
    collection.upsert(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=chunks)

async def retrieve_relevant_chunks(query: str, n_results: int = 4) -> list[str]:
    # Retrieve top 4 chunks to ensure the context window is captured
    query_embedding = embedding_model.encode([query]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=n_results)
    
    if not results['documents'] or not results['documents'][0]:
        return []
    return results['documents'][0]