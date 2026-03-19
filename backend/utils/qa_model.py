# backend/utils/qa_model.py
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Securely load the API key from .env
GEMINI_API_KEY1 = os.getenv("GEMINI_API_KEY1")

if not GEMINI_API_KEY1:
    raise ValueError("CRITICAL ERROR: GEMINI_API_KEY1 is missing from your .env file.")

# Create the Gemini Client (new SDK uses a client-based approach)
client = genai.Client(api_key=GEMINI_API_KEY1)

MODEL_ID = "gemini-2.5-flash-lite"

async def answer_question(query: str, retrieved_chunks: list[str]) -> dict:
    """
    Sends the document context and user query to Gemini and returns a 
    strictly structured JSON response.
    """
    if not retrieved_chunks:
        return {
            "answer": "I'm sorry, but this information is not present in the uploaded document.",
            "status": "no_context_found",
            "confidence": 0.0
        }

    # Prepare the document context for the prompt
    context_text = "\n\n---\n\n".join(retrieved_chunks)
    
    # System Instruction for grounded, structured output
    prompt = (
        f"You are a professional document analysis expert. Base your answer ONLY on the provided context.\n"
        f"If the answer is not explicitly in the context, state that clearly.\n\n"
        f"CONTEXT:\n{context_text}\n\n"
        f"USER QUESTION: {query}\n\n"
        f"INSTRUCTION: Return a JSON object with the following keys:\n"
        f"1. 'answer': A detailed, accurate response.\n"
        f"2. 'status': Either 'success' or 'not_found'.\n"
        f"3. 'confidence': A numerical score from 0.0 to 1.0 based on how well the context supports the answer."
    )

    try:
        # Generate content using the new client-based API
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,  # Low temperature for factual consistency
            ),
        )
        
        # Parse the JSON string from Gemini into a Python dictionary
        return json.loads(response.text)
        
    except Exception as e:
        print(f"CRITICAL Gemini API Error: {e}")
        return {
            "answer": "An internal error occurred while generating the response.",
            "status": "error",
            "confidence": 0.0
        }
