# ClarityAI — Multilingual Audio Intelligence & Conversational RAG Platform

> An enterprise-grade, end-to-end platform that converts long-form audio/video into speaker-aware, timestamped transcripts and powers grounded conversational intelligence via Two-Stage Dense RAG (BGE-M3 + Cross-Encoder Reranking) and dynamic multi-model reasoning (Qwen 3.8 & GPT-OSS).

---

## 🌟 Key Capabilities & Highlights

- **Acoustic Speech-to-Text**: High-throughput transcription with precise word/segment timestamps powered by **Whisper Large-v3** on Groq LPUs (10x–20x real-time speedup).
- **Structured Speaker Diarization**: Multi-speaker identification and turn assignment powered by **LLaMA 3.3 (70B)** in strict JSON schema mode.
- **Two-Stage Dense Multilingual RAG**:
  - **Stage 1 (Dense Recall)**: 1,024-dimensional semantic embeddings using `BAAI/bge-m3` combined with lexical keyword scoring across sliding-window dialogue chunks (Top 20 candidates).
  - **Stage 2 (Cross-Encoder Precision)**: Full cross-attention query-passage reranking via `BAAI/bge-reranker-v2-m3` selecting the Top 10 high-precision chunks for LLM context.
- **Multilingual LLM Reasoning & Failover**: Primary multilingual reasoning with **Qwen 3.8 (27B)** across Kannada, Japanese, Russian, Hindi, Greek, Spanish, and English with automatic circuit-breaker failover to **GPT-OSS (20B/120B)** on HTTP 429 rate limits.
- **Thread-Safe Sliding-Window Rate Limiting**: In-memory, proxy-aware (`X-Forwarded-For`) rate limiter (2 req/60s/IP) with exact `Retry-After` calculation and pre-computation request interception.
- **Interactive Audio-Transcript Player**: React 18 frontend with native streaming audio playback, interactive timecode badges (`▶ mm:ss`), active-speaker glowing highlights, and strict per-chunk playback isolation.
- **100.0% Benchmark Accuracy**: Achieved a **100.0% Pass Rate (50/50 PASS)** on comprehensive multi-domain evaluation benchmarks with zero hallucinations and exact timecode citations.

---

## 🎬 Live Product Walkthrough & Demo

<p align="center">
  <a href="https://www.youtube.com/watch?v=X8bgmLo_lAI">
    <img
      src="https://img.youtube.com/vi/X8bgmLo_lAI/hqdefault.jpg"
      alt="ClarityAI — Multilingual Audio Intelligence & Conversational RAG Platform"
      width="850"
    />
  </a>
</p>

<p align="center">
  ▶️ <strong><a href="https://www.youtube.com/watch?v=X8bgmLo_lAI">Watch the full interactive walkthrough on YouTube</a></strong>
</p>

---

## 🏗️ System Architecture

```text
                                  ┌────────────────────────┐
                                  │   React 18 + Vite UI   │
                                  │ (Port 5173 / Vercel)   │
                                  └───────────┬────────────┘
                                              │  HTTPS / REST / SSE
                                              ▼
                                  ┌────────────────────────┐
                                  │   FastAPI Backend      │
                                  │ (Port 5175 / Railway)  │
                                  └───────────┬────────────┘
                                              │
          ┌───────────────────────────────────┼───────────────────────────────────┐
          │                                   │                                   │
          ▼                                   ▼                                   ▼
┌──────────────────┐               ┌───────────────────────┐           ┌──────────────────────┐
│  Audio Ingestion │               │   Two-Stage RAG Core  │           │ Rate Limiter (2 RPM) │
│ • 16 kHz Mono    │               │ • BAAI/bge-m3 (1024d) │           │ • Thread-Safe Lock   │
│ • 35-80s Slicing │               │ • BGE-Reranker-v2-m3  │           │ • X-Forwarded-For    │
│ • Whisper Large  │               │ • Top-20 -> Top-10    │           │ • Live Cooldown UI   │
└──────────────────┘               └───────────────────────┘           └──────────────────────┘
          │                                   │
          ▼                                   ▼
┌──────────────────┐               ┌───────────────────────┐
│ Speaker Diarize  │               │  Multi-Model Router   │
│ • LLaMA 3.3 70B  │               │ • Qwen 3.8 (27B Multi)│
│ • JSON Schema    │               │ • GPT-OSS (Failover)  │
└──────────────────┘               └───────────────────────┘
```

---

## 🧩 Microservices & Standalone Repositories

ClarityAI is architected as an isolated, production-grade microservices ecosystem. While this repository serves as the main monorepo, the standalone backend and background worker services are also modularly isolated into their own dedicated repositories for independent CI/CD and deployment:

| Service | Repository | Tech Stack & Core Role | Deployment Target |
| :--- | :--- | :--- | :--- |
| **REST & RAG API** | [**Kgotta-contribute/APIClarityAI**](https://github.com/Kgotta-contribute/APIClarityAI) | **FastAPI + pgvector + BGE-M3**<br/>Audio ingestion, Two-Stage Dense RAG, multi-model LLM router, and chat endpoints | [Railway](https://railway.app) |
| **Background Listener** | [**Kgotta-contribute/ListenerCLarityAI**](https://github.com/Kgotta-contribute/ListenerCLarityAI) | **Python SQS Consumer + MongoDB**<br/>Async SQS queue consumer, long-form audio chunking, decryption, and job lifecycle worker | [Railway](https://railway.app) |
| **Conversational UI** | [**Kgotta-contribute/ClarityAI**](https://github.com/Kgotta-contribute/ClarityAI) (`Clarity_AI_UI/`) | **React 18 + Vite + TypeScript**<br/>Interactive timecoded transcript player, audio streaming, rate-limit cooldown, and chat | [Vercel](https://vercel.com) |

---

## 📁 Repository Structure

```text
.
├── .gitignore
├── .dockerignore
├── docker-compose.yml
├── README.md
├── Clarity_AI_API/          # FastAPI Backend (also at Kgotta-contribute/APIClarityAI)
│   ├── app/
│   │   ├── api/             # REST Endpoints (jobs, audio, chat, health)
│   │   ├── config/          # App settings and environment configs
│   │   └── services/        # RAG, BGE-M3, Reranker, Rate Limiter, LocalStore
│   ├── data/sample_files/   # Sample test media (MP3/MP4)
│   ├── Dockerfile
│   └── requirements.txt
├── Clarity_AI_Listener/     # SQS Background Worker (also at Kgotta-contribute/ListenerCLarityAI)
│   ├── api/                 # Health check API
│   ├── app/                 # SQS consumer, audio chunking, MongoDB utils
│   ├── Dockerfile
│   └── requirements.txt
└── Clarity_AI_UI/           # React 18 + Vite SPA Frontend
    ├── src/
    │   ├── components/      # TranscriptWindow, ChatPanel, AudioPlayer, UploadPanel
    │   ├── services/        # API and Upload HTTP service clients
    │   └── styles/          # SCSS and CSS Modules
    ├── package.json
    ├── vite.config.ts
    └── Dockerfile
```

---

## ⚡ Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- FFmpeg (for local audio slicing)
- A free [Groq API Key](https://console.groq.com/)

---

### 1. Backend Setup (`Clarity_AI_API/`)

```bash
cd Clarity_AI_API
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your GROQ_API_KEY inside .env

# Run FastAPI Server
python -m uvicorn app.main:app --host 0.0.0.0 --port 5175 --reload
```

---

### 2. Background Listener Setup (`Clarity_AI_Listener/`)

```bash
cd Clarity_AI_Listener
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables (AWS SQS & MongoDB)
# On Linux/macOS:
export AWS_QUEUE_ENDPOINT_URL="your_sqs_queue_url"
export MONGO_URI="mongodb://localhost:27017"

# On Windows (PowerShell):
# $env:AWS_QUEUE_ENDPOINT_URL="your_sqs_queue_url"
# $env:MONGO_URI="mongodb://localhost:27017"

# Option A: Run Health API (Port 8080)
python run_api.py

# Option B: Run SQS Background Worker
python main.py

# Option C: Run Both (Linux/Container)
bash wrapper_script.sh
```

---

### 3. Frontend Setup (`Clarity_AI_UI/`)

```bash
cd Clarity_AI_UI
npm install

# Create .env file
cp .env.example .env

# Start Vite Development Server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

### 4. Docker Compose (All-in-One Startup)

```bash
# Set your Groq API key in environment
export GROQ_API_KEY=your_groq_api_key_here

# Build and start all 3 services
docker-compose up --build
```

---

## 🤖 AI Model Matrix

| Subsystem | Model Name | Role & Function |
| :--- | :--- | :--- |
| **Speech-to-Text** | `whisper-large-v3` | High-fidelity multilingual acoustic transcription & timestamp segmentation |
| **Speaker Diarization** | `llama-3.3-70b-versatile` | Structured speaker identification and turn assignment in JSON mode |
| **Dense Vector Embeddings** | `BAAI/bge-m3` | 1,024-dimensional multilingual embeddings for sliding-window chunks |
| **Cross-Encoder Reranker** | `BAAI/bge-reranker-v2-m3` | High-precision candidate reranking (`Top-20 → Top-10`) |
| **Multilingual RAG Reasoning** | `qwen/qwen3.8-27b` | Primary conversational comprehension across non-English & multilingual queries |
| **English RAG & Failover** | `openai/gpt-oss-20b` / `120b` | High-speed English RAG and instant automatic failover on HTTP 429 limits |

---

## 📊 Benchmark & Evaluation Results

Tested on multi-domain multilingual podcast audio (e.g., King Cobra evolutionary biology, cold-blooded thermoregulation, antivenom production):

| Evaluation Category | Single-Stage Dense Baseline | ClarityAI Two-Stage RAG | Improvement |
| :--- | :---: | :---: | :---: |
| **Factual Deep Retrieval** | 60.0% | **100.0%** | **+40.0 pp** |
| **Evolutionary & Temporal Reasoning** | 50.0% | **100.0%** | **+50.0 pp** |
| **Biological & Anatomical Inference** | 55.0% | **100.0%** | **+45.0 pp** |
| **Multilingual Entity Grounding** | 55.0% | **100.0%** | **+45.0 pp** |
| **Overall 50-Question Benchmark** | **55.0%** | **100.0% (50/50 PASS)** | **+45.0 pp** |

---
