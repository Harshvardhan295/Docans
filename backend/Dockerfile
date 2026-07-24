FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/hf_cache

WORKDIR /app

COPY requirements.txt ./

# Install CPU-only torch separately — the default PyPI build pulls in
# several GB of CUDA libraries that are unnecessary for CPU inference.
RUN pip install --upgrade pip \
    && pip install torch==2.10.0 --index-url https://download.pytorch.org/whl/cpu \
    && grep -v -E '^(pywin32==|torch==)' requirements.txt > requirements.docker.txt \
    && pip install -r requirements.docker.txt

COPY . ./

RUN mkdir -p "$HF_HOME" \
    && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]