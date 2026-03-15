import io
import re
import fitz  # PyMuPDF
from pptx import Presentation
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. CPU-Friendly Chunking
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    length_function=len,
)

def clean_text(text: str) -> str:
    """Removes metadata that causes embeddings to hallucinate or miss context."""
    text = re.sub(r'--- Page \d+ ---', '', text, flags=re.IGNORECASE)
    text = re.sub(r'--- Slide \d+ ---', '', text, flags=re.IGNORECASE)
    # Replace multiple spaces/newlines with a single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text("text") + "\n"
    return text

def extract_text_from_pptx(file_bytes: bytes) -> str:
    text = ""
    presentation = Presentation(io.BytesIO(file_bytes))
    for slide in presentation.slides:
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text += shape.text + "\n"
    return text

async def process_file(file_name: str, file_bytes: bytes) -> dict:
    if file_name.lower().endswith('.pdf'):
        raw_text = extract_text_from_pdf(file_bytes)
    elif file_name.lower().endswith('.pptx'):
        raw_text = extract_text_from_pptx(file_bytes)
    else:
        raise ValueError("Unsupported format.")

    # 2. Clean and Chunk
    cleaned_text = clean_text(raw_text)
    chunks = text_splitter.split_text(cleaned_text)
    
    return {
        "filename": file_name,
        "total_characters": len(cleaned_text),
        "total_chunks": len(chunks),
        "chunks": chunks
    }