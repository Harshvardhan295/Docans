# utils/qa_model.py
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

print("Loading QA Model (this may take a minute on first run)...")
model_name = "google/flan-t5-base"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
print("QA Model loaded successfully!")

# The guardrail fallback message
GUARDRAIL_RESPONSE = "I'm sorry, but this information is not present in the uploaded document."

async def answer_question(query: str, retrieved_chunks: list[str]) -> str:
    """
    Takes the user query and the retrieved context chunks,
    applies strict guardrails, and generates an answer.
    """
    if not retrieved_chunks:
        return GUARDRAIL_RESPONSE

    # Use only the top 2 most relevant chunks to stay within the 512-token limit.
    # Each chunk is ~800 chars, so 2 chunks ≈ 1600 chars ≈ ~400 tokens, leaving room for the prompt.
    context = " ".join(retrieved_chunks[:2])

    # --- PROMPT ENGINEERING & GUARDRAILING ---
    # Flan-T5 responds best to direct, task-oriented instructions.
    # Put the context FIRST so truncation only clips the end of context, not the question.
    prompt = (
        f"Answer the following question using ONLY the context provided. "
        f"If the answer cannot be found in the context, say "
        f"'{GUARDRAIL_RESPONSE}'\n\n"
        f"Context: {context}\n\n"
        f"Question: {query}\n\n"
        f"Answer:"
    )

    try:
        inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)

        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            num_beams=4,
            early_stopping=True,
            do_sample=False,  # Greedy/beam search for factual answers
        )
        answer = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Fallback guardrail: if the model returns an empty string
        if not answer.strip():
            return GUARDRAIL_RESPONSE

        return answer
    except Exception as e:
        print(f"Error generating answer: {e}")
        return "An error occurred while trying to generate the answer."