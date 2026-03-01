# utils/db_manager.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")

# Initialize the Supabase client
supabase: Client = create_client(url, key)

async def save_chat_interaction(session_id: str, query: str, answer: str):
    """Saves the user query and the AI's answer to Supabase."""
    try:
        data = {
            "session_id": session_id,
            "query": query,
            "answer": answer
        }
        # Insert the data into our table
        supabase.table("chat_history").insert(data).execute()
        print(f"Saved interaction to Supabase for session: {session_id}")
    except Exception as e:
        print(f"Failed to save chat to Supabase: {e}")

async def fetch_chat_history(session_id: str) -> list[dict]:
    """Retrieves the chronological chat history for a specific session."""
    try:
        response = supabase.table("chat_history").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
        return response.data
    except Exception as e:
        print(f"Failed to fetch history: {e}")
        return []