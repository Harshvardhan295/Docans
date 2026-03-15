from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

print("Loading Summarization Model (facebook/bart-large-cnn)...")
model_name = "facebook/bart-large-cnn"

# Bypass the broken pipeline abstraction by loading the model natively
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.model_max_length = 1024
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

print("Summarizer loaded successfully!")

def chunk_text_by_tokens(text: str, max_len: int = 999) -> list[str]:
    """Chunks text strictly by token count as implemented in the reference repo."""
    tokens = tokenizer.encode(text, add_special_tokens=False)
    chunks = [tokens[i:i + max_len] for i in range(0, len(tokens), max_len)]
    return [tokenizer.decode(chunk, skip_special_tokens=True) for chunk in chunks]

async def generate_document_summary(chunks: list[str], file_name: str = "Document") -> str:
    if not chunks:
        return "No content to summarize."
    
    # Combine all extracted chunks into one string for re-chunking by token count
    output_text = " ".join(chunks)
    max_input_length = tokenizer.model_max_length

    # Check if the text exceeds the model's token limit
    if len(tokenizer.encode(output_text, add_special_tokens=False)) > max_input_length:
        print("The text is too long, chunking...")
        token_chunks = chunk_text_by_tokens(output_text, max_len=999)
        print("Text has been chunked into smaller parts for summarization.")
    else:
        token_chunks = [output_text]

    summaries = []
    
    # Process each token chunk exactly as the reference repo does
    for i, chunk in enumerate(token_chunks):
        print(f"Summarizing chunk {i + 1}/{len(token_chunks)}")
        is_last_chunk = i == len(token_chunks) - 1

        # Safely re-tokenize for length tracking
        encoded_chunk = tokenizer.encode(chunk, add_special_tokens=False)
        token_length = len(encoded_chunk)

        print(f"Chunk {i + 1} has {token_length} tokens")

        # Guardrails from the reference repo
        if not chunk.strip():
            print(f"Chunk {i + 1} is empty, skipping.")
            continue

        if token_length == 0:
            print(f"Chunk {i + 1} tokenized to 0 tokens, skipping.")
            continue

        if token_length < 10 and not is_last_chunk:
            print(f"Chunk {i + 1} too short (<10 tokens), skipping.")
            continue

        try:
            # NATIVE GENERATION (This replaces the broken summarizer pipeline)
            inputs = tokenizer(
                chunk, 
                return_tensors="pt", 
                max_length=1024, 
                truncation=True
            )
            
            summary_ids = model.generate(
                inputs["input_ids"], 
                max_length=150, 
                min_length=40, 
                length_penalty=2.0, 
                num_beams=4, 
                early_stopping=True
            )
            
            summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            summaries.append(summary)
            
        except Exception as e:
            print(f"Error summarizing chunk {i + 1}: {e}")

    # Stitch the individual summaries together
    final_summary = "\n\n".join(summaries)

    return (
        f"This document ({file_name}) primarily covers the following:\n\n"
        f"{final_summary}\n\n"
        f"You can now ask me specific questions about the contents of this file."
    )