# main.py
import os
# Force Hugging Face to use the H: drive for downloading massive models
os.environ["HF_HOME"] = "H:/Docans/hf_cache"

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import uvicorn
import uuid
from fastapi.middleware.cors import CORSMiddleware # <-- Add this import
from utils.document_processor import process_file
from utils.summarizer import generate_document_summary
from utils.vector_store import store_chunks_in_db, retrieve_relevant_chunks
from utils.qa_model import answer_question
from utils.db_manager import save_chat_interaction, fetch_chat_history, save_summary_to_db, get_summary_from_db, get_chat_history_from_db, get_all_sessions_from_db

app = FastAPI(title="Docans API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str  # Added session_id so we know who is talking
    query: str

@app.post("/upload/")
async def upload_document(
    file: UploadFile = File(...),
    session_id: str = Form(...)  # Receive the session ID from frontend
):
    if not file.filename.lower().endswith(('.pdf', '.pptx')):
        raise HTTPException(status_code=400, detail="Only .pdf and .pptx files are supported.")
    try:
        file_bytes = await file.read()
        processed_data = await process_file(file.filename, file_bytes)
        chunks = processed_data["chunks"]
        
        await store_chunks_in_db(session_id, file.filename, chunks)
        master_summary = await generate_document_summary(chunks, file_name=file.filename)
        
        # Save the summary to Supabase, tied to this session
        await save_summary_to_db(session_id, file.filename, master_summary)
        
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
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Look up the original filename from Supabase so we can find the correct Qdrant collection
        summary_data = await get_summary_from_db(request.session_id)
        if not summary_data or not summary_data.get("file_name"):
            return {"answer": "No document found for this session. Please upload a file first."}
        
        filename = summary_data["file_name"]
        
        # 2. Retrieve the top 4 most relevant document snippets from the filename-based Qdrant collection
        relevant_chunks = await retrieve_relevant_chunks(request.session_id, request.query, filename)
        
        # 3. Generate the structured answer via Gemini API
        structured_data = await answer_question(request.query, relevant_chunks)
        
# 4. Save the interaction to Supabase history
        try:
            await save_chat_interaction(
                request.session_id, 
                request.query, 
                structured_data.get("answer", "")
            )
        except Exception as db_error:
            print(f"Skipping DB save: {db_error}")
            
        return {"answer": structured_data.get("answer", "Sorry, no answer generated.")}
        
    except Exception as e:
        print(f"CRITICAL ERROR in /chat/: {e}")
        return {"answer": "I'm sorry, an internal server error occurred while processing your request."}

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

@app.get("/session/{session_id}/summary")
async def fetch_session_summary(session_id: str):
    data = await get_summary_from_db(session_id)
    if data:
        return {"summary": data["summary_text"], "file_name": data["file_name"]}
    return {"summary": None}

@app.get("/session/{session_id}/history")
async def fetch_session_history(session_id: str):
    data = await get_chat_history_from_db(session_id)
    return {"history": data}

@app.get("/sessions/")
async def fetch_all_sessions():
    data = await get_all_sessions_from_db()
    return {"sessions": data}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)