# utils/qa_model.py
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

print("Loading QA Model (this may take a minute on first run)...")
model_name = "google/flan-t5-base"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
print("QA Model loaded successfully!")

async def answer_question(query: str, retrieved_chunks: list[str]) -> str:
    """
    Takes the user query and the retrieved context chunks, 
    applies strict guardrails, and generates an answer.
    """
    if not retrieved_chunks:
        return "I'm sorry, but this information is not present in the uploaded document."

    # Combine the chunks into a single context string
    context = " ".join(retrieved_chunks)
    
    # --- PROMPT ENGINEERING & GUARDRAILING ---
    prompt = (
        "Answer the question based ONLY on the following context. "
        "If the answer is not contained in the context, reply exactly with: "
        "'I'm sorry, but this information is not present in the uploaded document.'\n\n"
        f"Context: {context}\n\n"
        f"Question: {query}\n\n"
        "Answer:"
    )

    try:
        inputs = tokenizer(prompt, return_tensors="pt", max_length=1024, truncation=True)
        # Generate the answer
        outputs = model.generate(
            **inputs, 
            max_new_tokens=150, 
            temperature=0.1, # Low temperature to prevent hallucinations
            do_sample=False
        )
        answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Sometimes small models ignore the exact negative instruction if they are confused.
        # We can add a hardcoded fallback guardrail here just in case.
        if answer.strip() == "":
             return "I'm sorry, but this information is not present in the uploaded document."
             
        return answer
    except Exception as e:
        print(f"Error generating answer: {e}")
        return "An error occurred while trying to generate the answer."