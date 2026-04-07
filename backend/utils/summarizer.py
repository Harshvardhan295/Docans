# backend/utils/summarizer.py
import ollama

print("Summarizer initialized (using local Ollama engine)...")

async def generate_document_summary(chunks: list, file_name: str = "Document") -> str:
    if not chunks:
        return "No content to summarize."

    print(f"Generating structured summary for {file_name} via Ollama...")

    # Correctly handles both old (str) and new (dict) chunk formats
    full_text = "\n\n".join(
        chunk["text"] if isinstance(chunk, dict) else chunk
        for chunk in chunks
    )
    context_text = full_text[:10000]

    try:
        client = ollama.AsyncClient(host="http://localhost:11434")

        response = await client.chat(
            model="qwen2.5:1.5b",
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

                        "Only the above section headings should be in bold text.\n"
                        "After every section heading, there should be a new line.\n"
                    )
                },
                {
                    "role": "user",
                    "content": f"Here is the document text:\n\n{context_text}"
                }
            ],
            options={
                "temperature": 0.3,
                "num_predict": 600
            }
        )

        summary_text = response["message"]["content"]

        return (
            f"Document Analysis: {file_name}\n\n"
            f"{summary_text}\n\n"
            "You can now ask me specific questions about the contents of this file."
        )

    except Exception as e:
        print(f"CRITICAL OLLAMA ERROR: {e}")
        return "Could not connect to Ollama. Please ensure the Ollama app is running on your computer."