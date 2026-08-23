# 🚀 ResumeIQ — AI-Powered Semantic Resume Intelligence & Career Coach

<div align="center">

![ResumeIQ Banner](https://img.shields.io/badge/ResumeIQ-v1.0.0-6366f1?style=for-the-badge&logo=rocket&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Groq LLaMA 3.3](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F05A28?style=for-the-badge&logo=meta&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<p align="center">
  <strong>An intelligent, explainable, and multi-engine resume analyzer that bridges the gap between candidate resumes, modern Applicant Tracking Systems (ATS), and human recruiter decision-making.</strong>
</p>

[Key Features](#-key-features) • [Architecture](#-architecture--system-design) • [Scoring Model](#-5-dimensional-explainable-scoring-model) • [ATS Simulation](#-ats-simulation-matrix) • [Quickstart](#-quickstart--installation) • [API Documentation](#-api-reference) • [Configuration](#-environment-variables)

</div>

---

## 📖 Table of Contents

1. [Overview & Philosophy](#-overview--philosophy)
2. [Key Features](#-key-features)
3. [Architecture & System Design](#-architecture--system-design)
4. [5-Dimensional Explainable Scoring Model](#-5-dimensional-explainable-scoring-model)
5. [ATS Simulation Matrix](#-ats-simulation-matrix)
6. [NLP & AI Analysis Pipeline](#-nlp--ai-analysis-pipeline)
7. [Frontend Glassmorphic Design System](#-frontend-glassmorphic-design-system)
8. [Project Structure](#-project-structure)
9. [Quickstart & Installation](#-quickstart--installation)
   - [Option 1: Docker Compose (Zero Setup)](#option-1-docker-compose-recommended)
   - [Option 2: Local Development (Node.js)](#option-2-manual-local-development)
10. [Environment Variables](#-environment-variables)
11. [API Reference](#-api-reference)
12. [Verification & Sample Testing](#-verification--sample-testing)
13. [Contributing & License](#-contributing--license)

---

## 💡 Overview & Philosophy

Most commercial resume checkers suffer from two major flaws:
1. **Dumb Keyword Stuffing**: They rely on simplistic string matching (e.g., counting the occurrences of `"Python"` or `"Agile"`), rewarding candidate resumes that spam keywords while ignoring actual context and semantic competence.
2. **Opaque Black-Box Scores**: They provide an arbitrary score (e.g., *74/100*) with zero actionable breakdown or feedback on how to fix issues.

### The ResumeIQ Difference

ResumeIQ treats resume analysis as an **interactive AI career coaching loop**, combining deterministic heuristics, statistical NLP, rule-based ATS parsers, and LLM reasoning:

* **Semantic Context Understanding**: Recognizes synonyms and related concepts (*"architected high-throughput microservices"* $\approx$ *"designed scalable distributed systems"*).
* **Realistic ATS Emulation**: Simulates how legacy and modern ATS engines (Workday, Greenhouse, Taleo, iCIMS) actually parse multi-column layouts, tables, headers, footers, and special characters.
* **Recruiter 6-Second Attention Heatmap**: Computes top-to-bottom F-pattern eye-tracking attention scores based on cognitive science and recruiter scanning habits.
* **Bias & Inclusivity Safeguards**: Flags unconscious bias triggers such as graduation dates older than 20 years (age bias) and non-inclusive terminology.
* **STAR Bullet Rewriter**: Identifies weak action verbs and unquantified statements, generating concrete STAR-format (Situation, Task, Action, Result) revisions with measurable impact metrics.
* **Grounded Interview Predictor**: Anticipates the exact behavioral, technical, and situational interview questions a hiring manager will ask based on specific bullet points in your resume.

---

## 🌟 Key Features

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                 ResumeIQ                                   │
├─────────────────────┬──────────────────────┬───────────────────────────────┤
│ 🎯 Radar Scoring    │ 🛡️ ATS Simulation    │ ⚡ Action-Verb Engine         │
│ 5 Explainable Axes  │ Workday/Greenhouse   │ Weak, Moderate, Strong Tiers  │
├─────────────────────┼──────────────────────┼───────────────────────────────┤
│ 👁️ Recruiter Map    │ 🤖 STAR Rewriter     │ 🎙️ Interview Predictor       │
│ 6-Sec F-Pattern     │ Impact Quantifier    │ Behavioral + Technical Qs     │
├─────────────────────┼──────────────────────┼───────────────────────────────┤
│ 🛡️ Bias Detector    │ 💼 JD Semantic Match │ 📝 Cover Letter AI            │
│ Age & Inclusivity   │ TF-IDF + Embeddings  │ Tailored Pitch Generation     │
└─────────────────────┴──────────────────────┴───────────────────────────────┘
```

### 1. 🎯 Explainable 5-Axis Composite Score
* **Weighted Evaluation**: Content Impact (30%), ATS Compatibility (25%), Keyword Relevance (20%), Formatting Quality (15%), Readability (10%).
* **Interactive Radar Chart**: Rendered in real-time with SVG/Recharts, allowing visual identification of resume strengths and bottlenecks.
* **Detailed Narrative**: Generates an executive summary describing the candidate's profile strength and highest-priority fixes.

### 2. 🛡️ Multi-Engine ATS Compatibility Simulator
* Parses raw text, metadata, and structural layout from **PDF**, **DOCX**, and **TXT** formats.
* Tests against **4 ATS platforms**:
  * **Workday**: Multi-column text scrambling, tables, contact info inside headers/footers.
  * **Greenhouse**: Standard section headings (`Experience`, `Education`, `Skills`), non-standard date formats.
  * **Taleo**: Complex character encodings, text box encapsulation, graphics/icons.
  * **iCIMS**: Email/phone discovery in header zones, symbol parsing.

### 3. ⚡ Action-Verb & Impact Quantification Engine
* **Verb Taxonomy**: Classifies leading verbs into **Strong** (*Spearheaded, Orchestrated, Engineered, Architected*), **Moderate** (*Built, Created, Managed*), and **Weak** (*Assisted, Helped, Handled, Responsible for*).
* **Metric Extraction**: Regex and syntactic detection of percentages (`%`), financial values (`$`), multipliers (`3x`, `10x`), user volume (`1.5M MAU`), and team sizes.
* **Quantification Ratio**: Calculates the percentage of bullet points backed by measurable outcomes.

### 4. 👁️ 6-Second Recruiter Attention Heatmap
* Implements the **F-Pattern Eye-Tracking Model** utilized by professional technical screeners:
  * Top header & title: 95% attention
  * Summary/Objective: 85% attention
  * First 2 experience items: 75%–90% attention
  * Middle bullets: 40%–60% attention
  * Lower sections: 25%–35% attention
* Color-coded gradient visualization with actionable recommendations on information hierarchy.

### 5. 🔍 Semantic Keyword & Job Description Matcher
* Match against any target job description.
* Extracts core technical competencies, libraries, cloud tooling, soft skills, and domain knowledge.
* Displays **Matched Keywords** vs. **Missing Critical Keywords** with matching confidence percentages.

### 6. 🛡️ Bias & Inclusive Language Shield
* **Age Bias**: Detects graduation dates $>20$ years ago and suggests removing graduation years to prevent age-related filtering.
* **Inclusive Language**: Flags outdated or non-inclusive terminology and suggests modern alternatives.

### 7. 🤖 STAR-Method Bullet Rewriter
* Powered by **Groq LLaMA 3.3 70B** / OpenAI-compatible LLMs.
* Transforms vague statements into quantified achievements:
  * *Before*: `"Helped with database query optimization."`
  * *After*: `"Optimized 25+ high-frequency PostgreSQL queries by introducing composite indexing, reducing p99 latency by 35% across 2M daily transactions."`

### 8. 🎙️ Predictive Interview Question Generator
* Generates grounded interview questions divided into:
  * **Behavioral**: Team conflict, leadership, deadline pressure.
  * **Technical**: Deep architecture questions on systems and tools mentioned.
  * **Situational**: Problem-solving scenarios tailored to past roles.
* Includes expandable coaching tips with key talking points.

---

## 🏗️ Architecture & System Design

```mermaid
flowchart TB
    subgraph Client ["Client Layer (Browser)"]
        UI["React 19 + Vite SPA"]
        Radar["Recharts Radar & Score Wheels"]
        State["Auth Context + REST Client"]
    end

    subgraph Backend ["Backend API Layer (Node.js / Express)"]
        Router["Express Gateway (/api)"]
        AuthM["JWT & Bcrypt Auth Middleware"]
        Parser["Document Parser (pdf-parse / mammoth)"]
        SectionExt["Section & Entity Extractor"]
        
        subgraph Pipeline ["Analysis & Scoring Engine"]
            ATS["ATS Failure Simulator"]
            Verb["Action-Verb Classifier"]
            Read["Readability & Flesch-Kincaid"]
            Bias["Bias & Inclusivity Scanner"]
            Heat["F-Pattern Heatmap Modeler"]
            KW["Semantic Keyword Matcher"]
            ScoreEng["5-Axis Score Synthesizer"]
        end

        subgraph AILayer ["AI Reasoning Layer"]
            LLM["Groq LLaMA 3.3 / OpenAI Client"]
            Rewriter["STAR Bullet Rewriter"]
            Interview["Interview Question Predictor"]
            Cover["Cover Letter Generator"]
        end
    end

    subgraph Storage ["Data & Storage Layer"]
        DB["PostgreSQL (Prisma ORM)"]
        Fallback["Zero-Config Local JSON Store (Fallback)"]
        Redis["Redis 7 (BullMQ Job Queue)"]
        Files["Local File Storage / Uploads"]
    end

    UI -->|HTTP / REST| Router
    Router --> AuthM
    AuthM --> Parser
    Parser --> SectionExt
    SectionExt --> Pipeline
    Pipeline --> ScoreEng
    ScoreEng --> AILayer
    AILayer --> Router
    Router --> DB
    Router -.->|Auto-fallback if DB down| Fallback
    Router --> Files
```

### Dual-Mode Database Resilience
ResumeIQ features an intelligent database proxy:
1. **Primary**: Connects to **PostgreSQL** via **Prisma ORM** with full relational integrity.
2. **Zero-Config Fallback**: If PostgreSQL is not detected, ResumeIQ automatically switches to a local JSON datastore (`data_store.json`), allowing instant local execution with zero manual database configuration.

---

## 📊 5-Dimensional Explainable Scoring Model

The overall score is computed as a weighted composite score ($S \in [0, 100]$):

$$\text{Overall Score} = 0.30 \cdot S_{\text{impact}} + 0.25 \cdot S_{\text{ats}} + 0.20 \cdot S_{\text{keywords}} + 0.15 \cdot S_{\text{format}} + 0.10 \cdot S_{\text{readability}}$$

| Dimension | Weight | Metrics Evaluated | High Score Indicators |
|---|---|---|---|
| **Content Impact** | **30%** | Action verbs, quantification percentage, STAR structure | $\ge 70\%$ quantified bullets, strong verbs (*Spearheaded*, *Engineered*) |
| **ATS Compatibility** | **25%** | Standard headers, contact discoverability, clean formatting | Zero table scrambles, standard date formats, accessible contact info |
| **Keyword Relevance** | **20%** | Overlap with Target Job Description, domain skill coverage | High cosine/token similarity with required JD skills and tools |
| **Formatting Quality** | **15%** | Document length, bullet count, structural consistency | 1–2 pages, 3–6 bullets per role, consistent casing & dates |
| **Readability** | **10%** | Flesch-Kincaid grade level, buzzword penalty, sentence length | Grade level 9–12, clear sentence length ($<22$ words), minimal jargon |

---

## 🛡️ ATS Simulation Matrix

ResumeIQ checks against specific failure modes common in top enterprise ATS software:

```
┌─────────────────┬────────────────────────────────────────────────────────────────────────┐
│ ATS System      │ Simulators & Failure Mode Detectors                                    │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 🏢 Workday      │ • Detects columns that merge into garbled single-line paragraphs       │
│                 │ • Flags contact information placed inside PDF header/footer boxes      │
│                 │ • Checks for unsupported special Unicode bullet characters             │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 🌿 Greenhouse   │ • Validates canonical section headers (Experience, Education, Skills) │
│                 │ • Flags non-standard job date formatting (e.g., 'Winter 2021')         │
│                 │ • Analyzes education section hierarchy                                 │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 🏛️ Taleo        │ • Flags text boxes, floating objects, and vector icons                 │
│                 │ • Checks for missing plain-text email & telephone patterns             │
│                 │ • Verifies single-column readability stream                            │
├─────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 🌐 iCIMS        │ • Detects non-standard delimiters (|, ~, •) in metadata headers        │
│                 │ • Analyzes tabular data misalignments                                  │
└─────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 NLP & AI Analysis Pipeline

### 1. Document Parsing & Section Extraction
* **PDF Parser**: Uses `pdf-parse` to extract text stream, coordinates, and metadata.
* **DOCX Parser**: Uses `mammoth` to extract document structure, bold spans, headers, and bulleted lists.
* **Regex & Fuzzy Section Classifier**: Automatically detects sections: `SUMMARY`, `EXPERIENCE`, `EDUCATION`, `SKILLS`, `PROJECTS`, `CERTIFICATIONS`.

### 2. Verb & Metric Engine
* Uses grammatical part-of-speech analysis to extract the leading action verb for each bullet item.
* Evaluates verb against an curated lexicon:
  * **Strong**: *Accelerated, Architected, Automated, Built, Championed, Consolidated, Deployed, Engineered, Formulated, Orchestrated, Overhauled, Spearheaded...*
  * **Weak**: *Assisted, Handled, Helped, Participated, Responsible for, Worked on, Supported...*

### 3. Readability & Linguistic Analysis
* **Flesch-Kincaid Grade Level**: Evaluates syllable count and sentence complexity to ensure readability by human recruiters.
* **Buzzword Detection**: Flags overused resume clichés (*"hardworking"*, *"go-getter"*, *"synergy"*, *"thought leader"*) and provides active, concrete substitutes.

### 4. LLM Agentic Reasoning (Groq LLaMA 3.3 70B / OpenAI)
* **Context-Aware STAR Rewriter**: Analyzes individual bullet context and role level to formulate realistic, quantified rewrites.
* **Interview Question Predictor**: Mines project and technology claims to generate behavioral and technical questions, paired with interviewer strategy tips.

---

## 🎨 Frontend Glassmorphic Design System

ResumeIQ features a custom-built, modern glassmorphic dark interface designed with pure CSS:

* **Color Palette**:
  * Background: Deep midnight obsidian (`#0a0b10`, `#12131c`, `#181a26`)
  * Accents: Indigo-to-Violet gradient (`#6366f1` $\rightarrow$ `#a855f7`)
  * Status: Emerald (`#22c55e`), Amber (`#f59e0b`), Crimson (`#ef4444`), Sky (`#0ea5e9`)
* **Visual Effects**:
  * Backdrop blur (`backdrop-filter: blur(16px)`)
  * Multi-layer radial ambient glow orbs
  * Smooth micro-interactions & animated progress gauges
* **Typography**: Clean, readable sans-serif system stack optimized for dense technical dashboards.

---

## 📁 Project Structure

```
ResumeIQ/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma            # Prisma schema (PostgreSQL + pgvector)
│   ├── src/
│   │   ├── config.js                # App configuration & env parser
│   │   ├── database.js              # Prisma ORM + local JSON store proxy
│   │   ├── index.js                 # Express application entry point
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── analysis.js          # Analysis polling & retrieval endpoints
│   │   │   ├── auth.js              # Authentication (login/register)
│   │   │   ├── jobs.js              # Job description CRUD
│   │   │   └── resumes.js           # Resume upload, parse, analyze, interview Qs
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── coverLetterGen.js    # AI Cover Letter generator
│   │   │   │   ├── interviewPredictor.js# Interview question predictor
│   │   │   │   ├── llmClient.js         # Groq / OpenAI LLM integration
│   │   │   │   └── rewriteSuggester.js  # STAR-format bullet rewriter
│   │   │   ├── analysis/
│   │   │   │   ├── atsChecker.js        # 4-engine ATS compatibility tester
│   │   │   │   ├── biasDetector.js      # Bias & inclusive language scanner
│   │   │   │   ├── heatmap.js           # 6-sec recruiter attention map
│   │   │   │   ├── keywordMatcher.js    # Keyword overlap & missing skills
│   │   │   │   ├── readability.js       # Flesch-Kincaid & buzzword engine
│   │   │   │   └── verbScorer.js        # Action verb & metric classifier
│   │   │   ├── parsing/
│   │   │   │   ├── parser.js            # PDF, DOCX & TXT document parsing
│   │   │   │   └── sectionExtractor.js  # Heading & section segmenter
│   │   │   ├── scoring/
│   │   │   │   └── scoreEngine.js       # 5-axis composite score calculator
│   │   │   └── semantic/
│   │   │       └── matcher.js           # Semantic similarity algorithms
│   │   └── tests/
│   │       └── verify.js            # Automated verification test suite
│   ├── Dockerfile                   # Backend production Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── favicon.svg              # App icon
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScoreCircle.jsx      # Animated circular score gauge
│   │   │   └── ScoreRadar.jsx       # 5-axis radar chart (Recharts)
│   │   ├── pages/
│   │   │   ├── Auth.jsx             # Login & Registration page
│   │   │   ├── Dashboard.jsx        # Dashboard & resume management
│   │   │   ├── Landing.jsx          # Hero, features & marketing page
│   │   │   └── ResumeDetail.jsx     # Deep analysis, tabs & coaching UI
│   │   ├── services/
│   │   │   └── api.js               # Axios HTTP service client
│   │   ├── App.jsx                  # Main router & Auth provider
│   │   ├── index.css                # Global glassmorphic design system
│   │   └── main.jsx
│   ├── Dockerfile                   # Frontend production Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml               # Complete multi-service compose stack
├── sample_resume.txt                # Sample software engineer resume for testing
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore configuration
└── README.md                        # Project documentation
```

---

## ⚡ Quickstart & Installation

### Option 1: Docker Compose (Recommended)

Run the full stack (Frontend, Backend, PostgreSQL, Redis) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/yash23082007/ResumeIQ.git
cd ResumeIQ

# 2. Copy the environment file
cp .env.example .env

# 3. Launch all containers
docker compose up --build
```

Access the services:
* 🌐 **Frontend UI**: [http://localhost:5173](http://localhost:5173)
* 🔌 **Backend API**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option 2: Manual Local Development

#### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* *(Optional)* **PostgreSQL** & **Redis** (ResumeIQ will automatically fallback to local JSON storage if Postgres is not running).

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# (Optional) Generate Prisma client if using PostgreSQL
npx prisma generate
npx prisma db push

# Start backend in development mode (with hot-reloading)
npm run dev
```
Backend will start on `http://localhost:8000`.

#### 2. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```ini
# ──────────────── Server ────────────────
PORT=8000
APP_ENV=development
APP_DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ──────────────── Database ────────────────
DATABASE_URL=postgresql://resumeiq:resumeiq_dev@localhost:5432/resumeiq
DB_PASSWORD=resumeiq_dev

# ──────────────── Redis & BullMQ ────────────────
REDIS_URL=redis://localhost:6379/0

# ──────────────── Authentication ────────────────
JWT_SECRET=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# ──────────────── Storage ────────────────
STORAGE_BACKEND=local
UPLOAD_DIR=./uploads

# ──────────────── LLM (Groq / OpenAI) ────────────────
LLM_PROVIDER=groq
LLM_API_KEY=your_groq_api_key_here
LLM_MODEL=llama-3.3-70b-versatile
LLM_MAX_TOKENS=4096
```

---

## 🔌 API Reference

### 🔐 Authentication
| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | `{ "email": "user@test.com", "password": "Password123" }` |
| `POST` | `/api/auth/login` | Authenticate & get JWT | `{ "email": "user@test.com", "password": "Password123" }` |
| `GET` | `/api/auth/me` | Get current user profile | *(Requires Bearer Token)* |

### 📄 Resumes
| Method | Endpoint | Description | Request / Payload |
|---|---|---|---|
| `GET` | `/api/resumes` | List all resumes for user | *(Requires Bearer Token)* |
| `POST` | `/api/resumes/upload` | Upload resume (PDF/DOCX/TXT)| `multipart/form-data` with `file` |
| `GET` | `/api/resumes/:id` | Get resume details & analyses | *(Requires Bearer Token)* |
| `POST` | `/api/resumes/:id/analyze` | Trigger full scoring pipeline | `{ "jobDescriptionId": "uuid" (optional) }` |
| `GET` | `/api/resumes/:id/interview-questions` | Generate interview questions | *(Requires Bearer Token)* |
| `POST` | `/api/resumes/:id/cover-letter` | Generate tailored cover letter | `{ "jobDescriptionId": "uuid" }` |

### 📊 Analyses & Jobs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analyses/:id` | Poll/retrieve analysis findings and subscores |
| `GET` | `/api/jobs` | List saved target job descriptions |
| `POST` | `/api/jobs` | Create target job description `{ "title", "company", "rawText" }` |

---

## 🧪 Verification & Sample Testing

A sample resume is included at [`sample_resume.txt`](./sample_resume.txt) for immediate testing.

### Run Automated Backend Verification Suite
```bash
cd backend
node tests/verify.js
```

### Manual Browser End-to-End Walkthrough
1. Open [http://localhost:5173](http://localhost:5173).
2. Click **Get Started** and register an account (`candidate@example.com` / `Password123!`).
3. Click **Job Descriptions** in the sidebar $\rightarrow$ paste a target job description (e.g. *Senior Full Stack Engineer*).
4. Drag & drop `sample_resume.txt` into the Dashboard upload area.
5. In the Resume Detail screen, select the Job Description from the dropdown and click **Analyze**.
6. Explore each analysis tab:
   * **Overview**: Review 5-axis Radar chart and Top Issues.
   * **ATS Check**: Inspect parsing compatibility across Workday, Greenhouse, Taleo, iCIMS.
   * **Impact**: Review strong/weak action verbs and quantified bullet ratios.
   * **Keywords**: Review matched vs. missing skills.
   * **Readability**: Review Flesch-Kincaid index and buzzword suggestions.
   * **Heatmap**: View the 6-second recruiter attention visualizer.
   * **AI Rewrites**: Inspect suggested STAR-format bullet revisions.
   * **Interview Qs**: Click *Generate Questions* to predict behavioral & technical interview questions.

---

## 🤝 Contributing & License

Contributions, feature requests, and bug reports are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ for job seekers, career switchers, and engineers everywhere.</sub>
</div>
