# backend/utils/summarizer.py
import ollama

print("Summarizer initialized (using local Ollama engine)...")


async def generate_document_summary(chunks: list[str], file_name: str = "Document") -> str:
    if not chunks:
        return "No content to summarize."

    print(f"Generating structured summary for {file_name} via Ollama...")

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
                        "You MUST output the summary in PLAIN TEXT only. "
                        "DO NOT use any markdown formatting characters such as #, *, -, `, or >. "
                        "Use these exact sections with numbered headings:\n"
                        "1. Problem Overview\n"
                        "2. Key Challenges (use bullet points)\n"
                        "3. Strategy (step-by-step breakdown)\n"
                        "4. Key Insights\n"
                        "Do not include any external information. Base it entirely on the text provided."
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
