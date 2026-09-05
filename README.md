# ResumeIQ 

> Deterministic Semantic Resume Analyzer, ATS Simulator, and Career Intelligence Platform built with **Python FastAPI**, **Next.js**, and **Local Machine Learning (ML/DL) & NLP Engines** (Zero External API Keys Required).

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn%20TF--IDF-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Tests](https://img.shields.io/badge/Tests-9%20Passed-success?style=flat-square)](backend/tests/test_backend.py)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Industrial Precision Design System](#industrial-precision-design-system)
- [Key Features & Local ML/DL Pipeline](#key-features--local-mldl-pipeline)
- [Quick Start Guide](#quick-start-guide)
- [Running Automated Tests](#running-automated-tests)
- [REST API Reference & Interactive Docs](#rest-api-reference--interactive-docs)
- [Environment Configuration](#environment-configuration)
- [License](#license)

---

## Overview

**ResumeIQ** eliminates unreliable, costly third-party AI APIs and replaces them with a high-performance **Python FastAPI** service and **standalone, local Machine Learning (ML), Deep Learning (DL), and Natural Language Processing (NLP)** engines.

### Why Python FastAPI + Local ML/DL?
1. **Zero External API Keys**: 100% free, private, and fully offline-capable. No Groq, OpenAI, Gemini, or Anthropic API keys required.
2. **Instant Response Times**: Local TF-IDF vectors, regex AST, and heuristic models execute in `<45ms`.
3. **Reproducible & Explainable**: Deterministic scoring and clear diagnostic recommendations without probabilistic hallucinations or token limits.
4. **Data Privacy**: Your resume documents and candidate data never leave your server.

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client ["Frontend (Next.js 16 App Router)"]
        UI["Landing, Dashboard, Workspace, ATS Lab, Builder"]
        Radar["Recharts Radar & Visual Attention Heatmap"]
        ApiClient["Axios API Client + Cookie Auth"]
    end

    subgraph Backend ["Python FastAPI Backend (Port 8000)"]
        FastAPI["FastAPI App (ASGI / Uvicorn)"]
        AuthM["JWT & Bcrypt Cookie Middleware"]
        DocParser["Multi-Format Parser (PDF / DOCX / TXT)"]
        DB["SQLAlchemy (SQLite / PostgreSQL)"]
    end

    subgraph MLLayer ["Local ML / DL & NLP Engines (Zero API Keys)"]
        TFIDF["Scikit-Learn TF-IDF & Cosine Similarity"]
        STAREngine["STAR-Method Rewrite Synthesizer"]
        IntPredictor["Interview Question Prediction Engine"]
        CoverGen["Tailored Cover Letter Generator"]
        ATSSim["4-Platform ATS Simulator (Workday, Greenhouse, Taleo, iCIMS)"]
        VerbScorer["Action Verb Tiering & Metric Quantifier"]
        Readability["Flesch-Kincaid & Buzzword Detector"]
        HeatmapModel["Recruiter F-Pattern Attention Model"]
    end

    Client -->|HTTP / JSON Requests| Backend
    FastAPI --> AuthM
    FastAPI --> DocParser
    FastAPI --> MLLayer
    FastAPI --> DB
```

---

## Industrial Precision Design System

ResumeIQ features a custom-built, unique **Industrial Precision** light theme that strips away the generic "AI-wrapper SaaS" aesthetic in favor of a stark, brutalist diagnostic interface.
- **Typography**: Uses `Space Grotesk` and `JetBrains Mono` exclusively for a command-line/diagnostic tool look.
- **Aesthetic**: `0px` border radii, stark white (`#ffffff`) and off-white (`#f8fafc`) backgrounds, with high-contrast **Blueprint Blue** (`#0033FF`) and **Safety Orange** (`#FF5500`) accents.
- **Layout**: Architectural grid background, thick 2px solid borders, and brutalist offset shadows.

---

## Key Features & Local ML/DL Pipeline

### 1. 5-Axis Deterministic Composite Scoring
- **Content Impact (30%)**: Classified action verb strength (*Spearheaded*, *Architected* vs *Assisted*, *Helped*) and quantified metrics (%, $, volume, user counts).
- **ATS Compatibility (25%)**: Evaluates multi-column tables, images, header/footer contact traps, and standard section titles.
- **Keyword Relevance (20%)**: Target Job Description skill overlap and technical alias expansion.
- **Formatting (15%)**: Page count, word count density, bullet structure.
- **Readability (10%)**: Flesch Reading Ease and Flesch-Kincaid Grade level.

### 2. Local ML TF-IDF Semantic Matching
- Employs **Scikit-Learn's `TfidfVectorizer`** (sublinear TF, 1-2 n-grams) combined with cosine similarity.
- Expands technical domain aliases (`k8s` -> `kubernetes`, `ts` -> `typescript`).

### 3. STAR-Format Rewrite Engine
- Classifies passive or weak bullet points and automatically generates Situation-Task-Action-Result (STAR) rewrites with strong action verbs.

### 4. Multi-Platform ATS Parser Simulator
Simulates parsing across major enterprise Applicant Tracking Systems:
- **Workday**: Multi-column text scrambling, PDF header/footer traps.
- **Greenhouse**: Section header validation, date formatting.
- **Taleo**: Floating text boxes, table scrambling, font compatibility.
- **iCIMS**: Delimiter formatting, tabular alignments.

---

## Quick Start Guide

### 1. Docker Compose (Recommended)

The easiest way to start both the Python FastAPI backend and the Next.js frontend is via Docker Compose:

```bash
docker-compose up --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 2. Manual Python FastAPI Backend Setup

```bash
# Navigate to project root
cd "ResumeIQ"

# Install Python requirements
pip install -r backend/requirements.txt

# Start FastAPI development server
uvicorn backend.app.main:app --reload --port 8000
```
- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 3. Manual Next.js Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)

---

## Running Automated Tests

Run the complete test suite covering authentication, parsing, TF-IDF semantic matching, ATS simulation, and STAR rewrites:

```bash
pytest backend/tests/test_backend.py -v
```

---

## REST API Reference & Interactive Docs

Interactive API documentation with built-in "Try it out" is available at `/docs` when the backend is running.

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Sign in & set secure HTTP-only session | No |
| `POST` | `/api/auth/logout` | Sign out & clear session | No |
| `GET` | `/api/auth/me` | Fetch current authenticated user profile | Yes |
| `POST` | `/api/resumes` | Upload & parse resume (PDF, DOCX, TXT) | Yes |
| `GET` | `/api/resumes` | List user resumes with latest scores | Yes |
| `GET` | `/api/resumes/{id}` | Get structured resume data & sections | Yes |
| `POST` | `/api/resumes/{id}/analyze` | Trigger full 5-axis analysis | Yes |
| `GET` | `/api/analyses/{id}` | Fetch analysis findings, scores, rewrites | Yes |
| `GET` | `/api/resumes/{id}/heatmap` | Recruiter 6-second attention heatmap | Yes |
| `GET` | `/api/resumes/{id}/ats-simulation` | Multi-platform ATS simulation | Yes |

---

## Environment Configuration

Configuration is managed via `.env` in the root directory:

```env
# ──────────────── Database ────────────────
DATABASE_URL=sqlite:///./data_store.db

# ──────────────── Auth ────────────────
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# ──────────────── Storage ────────────────
STORAGE_BACKEND=local
UPLOAD_DIR=./uploads

# ──────────────── App ────────────────
APP_ENV=development
APP_DEBUG=true
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
