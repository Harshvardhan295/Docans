# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import uvicorn

from utils.document_processor import process_file
from utils.summarizer import generate_document_summary
from utils.vector_store import store_chunks_in_db, retrieve_relevant_chunks
from utils.qa_model import answer_question

app = FastAPI(title="Docans API")

# Define the expected JSON body for the chat endpoint
class ChatRequest(BaseModel):
    query: str

@app.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    """
    Uploads a file, chunks it, summarizes it, and stores it in the Vector DB for RAG.
    """
    if not file.filename.lower().endswith(('.pdf', '.pptx')):
        raise HTTPException(status_code=400, detail="Only .pdf and .pptx files are supported.")
    
    try:
        file_bytes = await file.read()
        
        # 1. Parse and Chunk
        processed_data = await process_file(file.filename, file_bytes)
        chunks = processed_data["chunks"]
        
        # 2. Store in ChromaDB (RAG Ingestion)
        await store_chunks_in_db(file.filename, chunks)
        
        # 3. Map-Reduce Summarization
        master_summary = await generate_document_summary(chunks)
        
        return {
            "message": "File processed, stored in database, and summarized successfully.",
            "metadata": {
                "filename": processed_data["filename"],
                "total_characters": processed_data["total_characters"],
                "total_chunks": processed_data["total_chunks"]
            },
            "summary": master_summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/chat/")
async def chat_with_document(request: ChatRequest):
    """
    Queries the Vector DB for context and uses the LLM to answer the user's question.
    """
    try:
        # 1. Retrieve the most relevant chunks from ChromaDB
        relevant_chunks = await retrieve_relevant_chunks(request.query, n_results=3)
        
        # 2. Pass the query and the context to the LLM to generate an answer
        answer = await answer_question(request.query, relevant_chunks)
        
        return {
            "query": request.query,
            "answer": answer,
            # We return the context used so you can verify it fetched the right paragraphs!
            "sources_used": len(relevant_chunks) 
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)