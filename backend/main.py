import os
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from utils.document_processor import process_file
from utils.summarizer import generate_document_summary
from utils.vector_store import store_chunks_in_db, retrieve_relevant_chunks
from utils.qa_model import answer_question
from utils.db_manager import save_chat_interaction, fetch_chat_history, save_summary_to_db, get_summary_from_db, get_chat_history_from_db, get_all_sessions_from_db

hf_cache_dir = Path(os.getenv("HF_HOME", Path(__file__).resolve().parent / "hf_cache"))
hf_cache_dir.mkdir(parents=True, exist_ok=True)
os.environ["HF_HOME"] = str(hf_cache_dir)

app = FastAPI(title="Docans API")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:8080,http://localhost:8081",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


class ChatRequest(BaseModel):
    session_id: str
    query: str


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/upload/")
async def upload_document(file: UploadFile = File(...), session_id: str = Form(...)):
    if not file.filename.lower().endswith((".pdf", ".pptx")):
        raise HTTPException(status_code=400, detail="Only .pdf and .pptx files are supported.")

    try:
        file_bytes = await file.read()
        processed_data = await process_file(file.filename, file_bytes)
        chunks = processed_data["chunks"]

        await store_chunks_in_db(session_id, file.filename, chunks)
        master_summary = await generate_document_summary(chunks, file_name=file.filename)
        await save_summary_to_db(session_id, file.filename, master_summary)

        return {
            "message": "File processed, stored in database, and summarized successfully.",
            "metadata": {
                "filename": processed_data["filename"],
                "total_chunks": processed_data["total_chunks"],
                "total_characters": processed_data["total_characters"],
            },
            "summary": master_summary,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    try:
        summary_data = await get_summary_from_db(request.session_id)
        if not summary_data or not summary_data.get("file_name"):
            return {"answer": "No document found for this session. Please upload a file first.", "sources": []}

        filename = summary_data["file_name"]
        relevant_chunks = await retrieve_relevant_chunks(request.session_id, request.query, filename)
        structured_data = await answer_question(request.query, relevant_chunks)

        try:
            # Passes sources array into the updated DB Manager function
            await save_chat_interaction(
                request.session_id,
                request.query,
                structured_data.get("answer", ""),
                structured_data.get("sources", [])
            )
        except Exception as db_error:
            print(f"Skipping DB save: {db_error}")

        return {
            "answer": structured_data.get("answer", "Sorry, no answer generated."),
            "sources": structured_data.get("sources", []),
        }

    except Exception as e:
        print(f"CRITICAL ERROR in /chat/: {e}")
        return {"answer": "I'm sorry, an internal server error occurred while processing your request.", "sources": []}


@app.get("/history/{session_id}")
async def get_history(session_id: str):
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
