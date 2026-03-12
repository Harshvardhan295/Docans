# utils/summarizer.py
import torch
from transformers import pipeline, BitsAndBytesConfig

print("Loading Instruction-Tuned Summarization Model (Mistral-7B-Instruct-v0.2)...")
model_name = "mistralai/Mistral-7B-Instruct-v0.2"

pipe = None # Define pipe globally first to prevent ReferenceErrors

try:
    # OPTIONAL BUT RECOMMENDED: Load in 4-bit to save VRAM (requires `pip install bitsandbytes`)
    # If you have a 16GB+ GPU, you can remove the model_kwargs line.
    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
    )

    pipe = pipeline(
        "text-generation",
        model=model_name,
        device_map="auto", # Requires 'accelerate'
        model_kwargs={"quantization_config": quantization_config} # Comment out if not using bitsandbytes
    )
    print("Mistral Model loaded successfully!")
except Exception as e:
    print(f"Failed to load Mistral model: {e}")

def generate_with_mistral(instruction: str, max_new_tokens: int = 500) -> str:
    """Helper function to format prompts and generate text using Mistral."""
    if pipe is None:
        return "Error: Summarization model failed to load during startup."
        
    messages = [
        {"role": "user", "content": instruction},
    ]
    
    try:
        # Apply Mistral's specific [INST] chat template
        prompt = pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        
        outputs = pipe(
            prompt,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.3, 
            top_p=0.9,
        )
        # Return only the generated text (stripping the input prompt)
        return outputs[0]["generated_text"][len(prompt):].strip()
    except Exception as e:
        print(f"Error during generation: {e}")
        return "Error generating summary."

def summarize_chunk(text: str) -> str:
    instruction = f"You are a highly efficient assistant. Extract the core concepts and topics from the provided text.\n\nText to analyze:\n{text}\n\nProvide the main points."
    return generate_with_mistral(instruction, max_new_tokens=250)

async def generate_document_summary(chunks: list[str], file_name: str = "Uploaded Document") -> str:
    if not chunks:
        return "No content to summarize."
    if pipe is None:
        return "Cannot generate summary because the model failed to load."
    
    combined_text = "\n".join(chunks)
    
    if len(combined_text) < 25000:
        print("Document fits in context window. Generating structured summary directly...")
        
        instruction = f"""You are an expert technical summarizer that follows strict formatting rules. Read the following document text and provide a structured summary. You must follow this exact format:
        
Explain what the file is about in one or two sentences.
{file_name}
The document includes topics such as:
- [Topic 1]
- [Topic 2]
- [Topic 3]...
Overall, [provide a brief overall conclusion].

Document Text:
{combined_text}"""
        
        return generate_with_mistral(instruction, max_new_tokens=600)

    # --- MAP PHASE (For very large documents) ---
    chunk_summaries = []
    for i, chunk in enumerate(chunks):
        print(f"Summarizing chunk {i + 1} of {len(chunks)}...")
        chunk_summary = summarize_chunk(chunk)
        chunk_summaries.append(chunk_summary)

    # --- REDUCE PHASE ---
    print("Starting Reduce phase (generating final structured summary)...")
    combined_summaries = "\n\n".join(f"--- Section {i+1} Summary ---\n{s}" for i, s in enumerate(chunk_summaries))
    
    instruction = f"""You are an expert technical summarizer that follows strict formatting rules. Based on the following summaries of document sections, provide a structured overall summary. You must follow this exact format:
    
Explain what the file is about in one or two sentences.
{file_name}
The document includes topics such as:
- [Topic 1]
- [Topic 2]
- [Topic 3]...
Overall, [provide a brief overall conclusion].

Section Summaries:
{combined_summaries}"""
    
    return generate_with_mistral(instruction, max_new_tokens=600)