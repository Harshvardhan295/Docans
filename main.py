# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
from utils.document_processor import process_file
from utils.summarizer import generate_document_summary

app = FastAPI(title="Docans API")

@app.post("/upload/")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.pptx')):
        raise HTTPException(status_code=400, detail="Only .pdf and .pptx files are supported.")
    
    try:
        file_bytes = await file.read()
        
        # 1. Parse and Chunk
        processed_data = await process_file(file.filename, file_bytes)
        chunks = processed_data["chunks"]
        
        # 2. Map-Reduce Summarization
        # Note: In a production app with large files, this should be sent to a background task/worker queue (like Celery).
        # We await it here directly for project simplicity.
        master_summary = await generate_document_summary(chunks)
        
        return {
            "message": "File processed and summarized successfully",
            "metadata": {
                "filename": processed_data["filename"],
                "total_characters": processed_data["total_characters"],
                "total_chunks": processed_data["total_chunks"]
            },
            "summary": master_summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)