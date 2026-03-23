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

async def save_summary_to_db(session_id: str, file_name: str, summary: str):
    """Saves or updates the document summary for a specific session."""
    try:
        data = {
            "session_id": session_id,
            "file_name": file_name,
            "summary_text": summary
        }
        # Upsert ensures that if the user uploads a new file, it overwrites the old summary for this session
        supabase.table("summaries").upsert(data, on_conflict="session_id").execute()
    except Exception as e:
        print(f"Skipping summary DB save: {e}")

async def get_summary_from_db(session_id: str):
    """Fetches a saved summary if the user returns to the app."""
    try:
        response = supabase.table("summaries").select("*").eq("session_id", session_id).execute()
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"DB Error fetching summary: {e}")
        return None

async def get_chat_history_from_db(session_id: str):
    """Fetches the entire chat history sorted by oldest to newest."""
    try:
        response = supabase.table("chat_history").select("*").eq("session_id", session_id).order("created_at").execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"DB Error fetching history: {e}")
        return []

async def get_all_sessions_from_db():
    """Fetches a list of all previously uploaded documents."""
    try:
        response = supabase.table("summaries").select("session_id, file_name, created_at").order("created_at", desc=True).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"DB Error fetching all sessions: {e}")
        return []