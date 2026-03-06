# utils/summarizer.py
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Load the tokenizer and model directly (bypassing the pipeline registry)
print("Loading Summarization Model (this may take a minute on first run)...")
model_name = "sshleifer/distilbart-cnn-12-6"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
print("Model loaded successfully!")

def summarize_text(text: str, max_length: int = 150, min_length: int = 40) -> str:
    """Summarizes a single string of text safely."""
    word_count = len(text.split())
    
    # If the text is too short, summarization is unnecessary
    if word_count < 40:
        return text

    # Dynamically adjust max/min length to avoid out-of-bounds errors on smaller chunks
    dynamic_max = min(max_length, max(int(word_count * 0.8), min_length + 10))
    dynamic_min = min(min_length, int(word_count * 0.2))

    try:
        # Tokenize the input text, truncating it if it exceeds the model's max limit
        inputs = tokenizer(text, max_length=1024, truncation=True, return_tensors="pt")
        
        # Generate the summary tokens
        summary_ids = model.generate(
            inputs["input_ids"], 
            max_length=dynamic_max, 
            min_length=dynamic_min, 
            do_sample=False
        )
        
        # Decode the tokens back into a human-readable string
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    except Exception as e:
        print(f"Error summarizing text: {e}")
        return text

async def generate_document_summary(chunks: list[str]) -> str:
    """
    Executes the Map-Reduce summarization pipeline.
    """
    if not chunks:
        return "No content to summarize."
    
    if len(chunks) == 1:
        return summarize_text(chunks[0])

    chunk_summaries = []
    for i, chunk in enumerate(chunks):
        print(f"Summarizing chunk {i + 1} of {len(chunks)}...")
        clean_chunk = chunk.replace('\n', ' ')
        chunk_summary = summarize_text(clean_chunk, max_length=100, min_length=20)
        chunk_summaries.append(chunk_summary)

    # --- REDUCE PHASE ---
    print("Starting Reduce phase (summarizing the combined summaries)...")
    combined_summaries = " ".join(chunk_summaries)
    
    final_summary = summarize_text(combined_summaries, max_length=300, min_length=80)
    
    return final_summary