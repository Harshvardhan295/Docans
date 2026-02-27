# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import uvicorn
import uuid

from utils.document_processor import process_file
from utils.summarizer import generate_document_summary
from utils.vector_store import store_chunks_in_db, retrieve_relevant_chunks
from utils.qa_model import answer_question
from utils.db_manager import save_chat_interaction, fetch_chat_history

app = FastAPI(title="Docans API")

class ChatRequest(BaseModel):
    session_id: str  # Added session_id so we know who is talking
    query: str

@app.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.pptx')):
        raise HTTPException(status_code=400, detail="Only .pdf and .pptx files are supported.")
    try:
        file_bytes = await file.read()
        processed_data = await process_file(file.filename, file_bytes)
        chunks = processed_data["chunks"]
        
        await store_chunks_in_db(file.filename, chunks)
        master_summary = await generate_document_summary(chunks)
        
        return {
            "message": "File processed, stored in database, and summarized successfully.",
            "metadata": {
                "filename": processed_data["filename"],
                "total_chunks": processed_data["total_chunks"]
            },
            "summary": master_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/chat/")
async def chat_with_document(request: ChatRequest):
    try:
        relevant_chunks = await retrieve_relevant_chunks(request.query, n_results=3)
        answer = await answer_question(request.query, relevant_chunks)
        
        # Save the interaction to Supabase asynchronously
        await save_chat_interaction(request.session_id, request.query, answer)
        
        return {
            "session_id": request.session_id,
            "query": request.query,
            "answer": answer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/history/{session_id}")
async def get_history(session_id: str):
    """
    Endpoint to retrieve previous conversations so a user can continue where they left off.
    """
    try:
        history = await fetch_chat_history(session_id)
        if not history:
            return {"message": "No history found for this session.", "history": []}
        return {"session_id": session_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)