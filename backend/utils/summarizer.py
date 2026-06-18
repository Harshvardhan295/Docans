# backend/utils/summarizer.py
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

nvidia_client = AsyncOpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"]
)

print("Summarizer initialized (using NVIDIA NIM engine)...")

async def generate_document_summary(chunks: list, file_name: str = "Document") -> str:
    if not chunks:
        return "No content to summarize."

    print(f"Generating structured summary for {file_name} via NVIDIA NIM...")

    # Correctly handles both old (str) and new (dict) chunk formats
    full_text = "\n\n".join(
        chunk["text"] if isinstance(chunk, dict) else chunk
        for chunk in chunks
    )
    # No truncation — NIM's Qwen handles large contexts
    context_text = full_text

    try:
        response = await nvidia_client.chat.completions.create(
            model="qwen/qwen3.5-122b-a10b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert technical analyst. Your job is to summarize the provided document. "
                        "You MUST strictly follow this exact format and nothing else. "
                        "DO NOT add any introductory or concluding paragraphs. DO NOT add a 'Summary' section at the end.\n\n"
                        "1. Problem Overview\n"
                        "[Write 2-3 sentences here]\n\n"
                        "2. Key Challenges\n"
                        "[Use standard bullet points starting with * ]\n\n"
                        "3. Strategy\n"
                        "[Use numbered steps 1, 2, 3...]\n\n"
                        "4. Key Insights\n"
                        "[Use standard bullet points starting with * ]"
                        "Only the above section headings should be in bold text.Other than this no other text should be in bold.\n"
                        "After every section heading, there should be a new line.\n"
                    )
                },
                {
                    "role": "user",
                    "content": f"Here is the document text:\n\n{context_text}"
                }
            ],
            max_tokens=1024,
            temperature=0.3
        )

        summary_text = response.choices[0].message.content

        return (
            f"Document Analysis: {file_name}\n\n"
            f"{summary_text}\n\n"
            "You can now ask me specific questions about the contents of this file."
        )

    except Exception as e:
        print(f"CRITICAL NVIDIA NIM ERROR: {e}")
        return "Could not connect to NVIDIA NIM API. Please check your API key and network connection."