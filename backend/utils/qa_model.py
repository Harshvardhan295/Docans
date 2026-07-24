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
MODEL_ID = "gemini-3.1-flash-lite"


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
        "4. 'sources': An array of strings representing the source numbers that support the answer (e.g., [\"1\", \"2\"]). Return [] if the answer is not found."
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

        # 1. Clean up potential markdown formatting from Gemini
        raw_response = response.text.strip()
        if raw_response.startswith("```json"):
            raw_response = raw_response[7:-3].strip()
        elif raw_response.startswith("```"):
            raw_response = raw_response[3:-3].strip()

        parsed = json.loads(raw_response)
        
        # 2. Normalize parsed sources to strings (Fixes the integer mismatch bug)
        raw_sources = parsed.get("sources", [])
        if not isinstance(raw_sources, list):
            raw_sources = []
        parsed_sources = [str(s).strip() for s in raw_sources]

        # 3. Filter and Validate
        if parsed.get("status") != "success":
            parsed["sources"] = []
        else:
            # Match against unique_sources retrieved from Qdrant
            valid_sources = [s for s in parsed_sources if s in unique_sources]
            
            # Fallback: if Gemini fails to list them but we found a valid answer, attach the context sources
            parsed["sources"] = valid_sources if valid_sources else unique_sources

        return parsed

    except Exception as e:
        print(f"CRITICAL Gemini API Error: {e}")
        return {
            "answer": "An internal error occurred while generating the response.",
            "status": "error",
            "confidence": 0.0,
            "sources": [],
        }