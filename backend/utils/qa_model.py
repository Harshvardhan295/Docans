from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

model_name = "google/flan-t5-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

async def answer_question(query: str, retrieved_chunks: list[str]) -> str:
    if not retrieved_chunks:
        return "I'm sorry, but this information is not present in the uploaded document."

    context = " ".join(retrieved_chunks)
    
    # 4. Strict Context-Driven Prompt
    prompt = (
        f"Answer using ONLY the context below. If the answer is not in the context, say 'I'm sorry, but this information is not present in the uploaded document.'\n\n"
        f"Context:\n{context}\n\n"
        f"Question:\n{query}\n\n"
        "Answer:"
    )

    # Max length bounded to prevent CPU memory overflow
    inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
    outputs = model.generate(**inputs, max_new_tokens=150, temperature=0.1, do_sample=False)
    
    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    if not answer.strip() or answer.strip() == "Answer:":
        return "I'm sorry, but this information is not present in the uploaded document."
        
    return answer