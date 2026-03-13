# utils/summarizer.py
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

print("Loading Summarization Model (Flan-T5-Base)...")
model_name = "google/flan-t5-base"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
print("Summarization Model loaded successfully!")


def summarize_text(text: str, max_input_length: int = 512, max_new_tokens: int = 150) -> str:
    """Summarize a single piece of text using Flan-T5."""
    prompt = f"Summarize the following text in detail:\n\n{text}"
    
    inputs = tokenizer(prompt, return_tensors="pt", max_length=max_input_length, truncation=True)
    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        num_beams=4,
        early_stopping=True,
        do_sample=False,
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)


async def generate_document_summary(chunks: list[str], file_name: str = "Uploaded Document") -> str:
    """
    Generate a structured document summary using Map-Reduce:
    1. MAP: Summarize each chunk individually (fits within 512-token limit)
    2. REDUCE: Combine chunk summaries into a final structured summary
    """
    if not chunks:
        return "No content to summarize."

    print(f"Summarizing {len(chunks)} chunks using Map-Reduce strategy...")

    # --- MAP PHASE: Summarize each chunk individually ---
    chunk_summaries = []
    for i, chunk in enumerate(chunks):
        print(f"  Summarizing chunk {i + 1}/{len(chunks)}...")
        try:
            summary = summarize_text(chunk, max_input_length=512, max_new_tokens=120)
            if summary.strip():
                chunk_summaries.append(summary)
        except Exception as e:
            print(f"  Warning: Failed to summarize chunk {i + 1}: {e}")
            continue

    if not chunk_summaries:
        return "Failed to generate summary from the document."

    # --- REDUCE PHASE: Combine chunk summaries into a final summary ---
    print("Generating final structured summary...")
    
    # Combine all chunk summaries into one text, staying within token limits
    combined = " ".join(chunk_summaries)
    
    reduce_prompt = (
        f"Based on the following summaries of sections from a document called \"{file_name}\", "
        f"write a comprehensive overall summary that explains what the document is about "
        f"and lists its main topics:\n\n{combined}"
    )

    try:
        final_summary = summarize_text(reduce_prompt, max_input_length=512, max_new_tokens=200)
    except Exception as e:
        print(f"Reduce phase failed: {e}")
        # Fallback: just return the combined chunk summaries
        final_summary = " ".join(chunk_summaries[:3])

    # Build the structured output
    structured = f"**{file_name}**\n\n{final_summary}"
    
    # Add individual section highlights if we have enough chunks
    if len(chunk_summaries) > 1:
        structured += "\n\n**Key sections covered:**"
        for i, s in enumerate(chunk_summaries[:5]):  # Show up to 5 section summaries
            structured += f"\n- {s}"

    return structured