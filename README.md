<p align="center">
  <img src="frontend/public/Logo.png" alt="Docans Logo" width="80" />
</p>

<h1 align="center">Docans</h1>

<p align="center">
  <strong>AI-Powered Document Summarization & Query System</strong><br/>
  Upload a PDF or PPTX → Get an instant AI summary → Chat with your document
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" />
</p>

---

## Overview

**Docans** is a full-stack web app that uses NLP and Retrieval-Augmented Generation (RAG) to help users extract insights from documents. Upload a PDF or PowerPoint, receive a structured AI summary, then ask follow-up questions in a chat interface — with page-level source attribution.

---

## Features

- **📄 Smart Upload** — Drag-and-drop PDF/PPTX with real-time progress
- **🧠 AI Summarization** — Structured summaries via NVIDIA NIM API (Qwen 3.5)
- **🔍 RAG Pipeline** — Chunks embedded with `all-MiniLM-L6-v2` and stored in Qdrant Cloud
- **💬 Contextual Q&A** — Gemini 2.5 Flash Lite answers grounded in document context
- **🛡️ Guardrails** — Out-of-scope questions are gracefully handled
- **📚 Source Attribution** — Every response includes page-number references
- **💾 Persistent Sessions** — Chat history & summaries saved in Supabase
- **✨ Premium UI** — Framer Motion animations, Lottie graphics, dark mode

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│              Frontend (React + Vite + TS)            │
│  Hero → Upload → Chat (session managed via pub-sub)  │
└──────────────────┬───────────────────────────────────┘
                   │ REST API
                   ▼
┌──────────────────────────────────────────────────────┐
│               Backend (FastAPI + Uvicorn)            │
│                                                      │
│  Document Processor ──► Summarizer (NVIDIA NIM)       │
│  (PyMuPDF / pptx)       qwen3.5-122b-a10b             │
│                                                      │
│  Vector Store (Qdrant) ──► QA Model (Gemini API)     │
│  all-MiniLM-L6-v2         gemini-2.5-flash-lite      │
│                                                      │
│  DB Manager (Supabase) ── chat_history, summaries    │
└──────────────────────────────────────────────────────┘
```

**Flow:** Upload → extract text → chunk (500 chars) → embed & store in Qdrant → summarize via NVIDIA NIM → user asks question → retrieve top-4 chunks → Gemini generates answer with sources → persist to Supabase.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion, Lottie, React Markdown, Lucide Icons |
| **Backend** | FastAPI, PyMuPDF, python-pptx, LangChain Text Splitters, Sentence Transformers |
| **AI/ML** | NVIDIA NIM (qwen3.5-122b-a10b) for summarization, Google Gemini API for Q&A |
| **Data** | Qdrant Cloud (vector DB), Supabase (Postgres for persistence) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 &nbsp;|&nbsp; **Python** ≥ 3.11
- Accounts: [Qdrant Cloud](https://cloud.qdrant.io) · [Supabase](https://supabase.com) · [Google AI Studio](https://aistudio.google.com)

### Backend

```bash
cd backend
python -m venv venv && venv\Scripts\activate   # Windows
pip install -r requirements.txt

# Ensure NVIDIA_API_KEY is set in your .env file

python main.py   # → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # → http://localhost:8080
```

---

## Environment Variables

Create `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key
QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your-key
GEMINI_API_KEY1=your-key
NVIDIA_API_KEY=your-key
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload/` | Upload & process a PDF/PPTX (form-data: `file`, `session_id`) |
| `POST` | `/chat/` | Ask a question (JSON: `session_id`, `query`) |
| `GET` | `/session/{id}/summary` | Get saved document summary |
| `GET` | `/session/{id}/history` | Get chat history for a session |
| `GET` | `/sessions/` | List all document sessions |

> Interactive docs available at `http://localhost:8000/docs`

---

## Evaluation (ROUGE Scores)

| Metric | Precision | Recall | F1 |
|---|---|---|---|
| ROUGE-1 | 0.54 | 0.83 | 0.65 |
| ROUGE-2 | 0.26 | 0.40 | 0.31 |
| ROUGE-L | 0.36 | 0.55 | 0.43 |

```bash
cd backend && python evaluate_summary.py
```
