# utils/vector_store.py
import chromadb
from sentence_transformers import SentenceTransformer

print("Initializing ChromaDB and loading Embedding Model...")
# Initialize ChromaDB to save data to a local folder so we don't lose it when the server restarts
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Create or get a collection (think of this like a table in a relational database)
collection = chroma_client.get_or_create_collection(name="docans_collection")

# Load a fast, highly accurate, and lightweight embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Vector Store is ready!")

async def store_chunks_in_db(filename: str, chunks: list[str]):
    """
    Converts text chunks into vector embeddings and stores them in ChromaDB.
    """
    if not chunks:
        return
        
    # CLEAR the database before adding a new document so chat remains context-specific
    existing_data = collection.get()
    if existing_data and existing_data['ids']:
        collection.delete(ids=existing_data['ids'])
        print("Cleared previous document chunks from ChromaDB.")
    
    # Generate unique IDs for each chunk
    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
    
    # Store metadata so we know exactly where this chunk came from
    metadatas = [{"filename": filename, "chunk_index": i} for i in range(len(chunks))]
    
    # Convert text chunks to numerical vectors
    embeddings = embedding_model.encode(chunks).tolist()
    
    # Upsert into ChromaDB
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=chunks
    )
    print(f"Successfully stored {len(chunks)} chunks for {filename} in ChromaDB.")

async def retrieve_relevant_chunks(query: str, n_results: int = 3) -> list[str]:
    """
    Embeds the user's query and fetches the top N most relevant chunks from the database.
    """
    query_embedding = embedding_model.encode([query]).tolist()
    
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=n_results
    )
    
    if not results['documents'] or not results['documents'][0]:
        return []
        
    return results['documents'][0]