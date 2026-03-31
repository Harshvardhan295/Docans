# backend/utils/qa_model.py
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY1 = os.getenv("GEMINI_API_KEY1")

if not GEMINI_API_KEY1:
    raise ValueError("CRITICAL ERROR: GEMINI_API_KEY1 is missing from your .env file.")

client = genai.Client(api_key=GEMINI_API_KEY1)
MODEL_ID = "gemini-2.5-flash-lite"


async def answer_question(query: str, retrieved_chunks: list[dict]) -> dict:
    if not retrieved_chunks:
        return {
            "answer": "I'm sorry, but this information is not present in the uploaded document.",
            "status": "no_context_found",
            "confidence": 0.0,
            "sources": [],
        }

    context_parts = [
        f"Source {chunk.get('source', '?')}: {chunk.get('text', '')}"
        for chunk in retrieved_chunks
    ]
    context_text = "\n\n---\n\n".join(context_parts)

    unique_sources = []
    for chunk in retrieved_chunks:
        source = str(chunk.get("source", "")).strip()
        if source and source not in unique_sources:
            unique_sources.append(source)

    prompt = (
        "You are a professional document analysis expert. Base your answer ONLY on the provided context.\n"
        "If the answer is not explicitly in the context, state that clearly.\n\n"
        f"CONTEXT:\n{context_text}\n\n"
        f"USER QUESTION: {query}\n\n"
        "INSTRUCTION: Return a JSON object with the following keys:\n"
        "1. 'answer': A detailed, accurate response.\n"
        "2. 'status': Either 'success' or 'not_found'.\n"
        "3. 'confidence': A numerical score from 0.0 to 1.0 based on how well the context supports the answer.\n"
        "4. 'sources': An array of source numbers that support the answer. Return [] if the answer is not found."
    )

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )

        parsed = json.loads(response.text)
        parsed_sources = parsed.get("sources") or []

        if parsed.get("status") != "success":
            parsed["sources"] = []
        else:
            parsed["sources"] = [source for source in parsed_sources if source in unique_sources] or unique_sources

        return parsed

    except Exception as e:
        print(f"CRITICAL Gemini API Error: {e}")
        return {
            "answer": "An internal error occurred while generating the response.",
            "status": "error",
            "confidence": 0.0,
            "sources": [],
        }
