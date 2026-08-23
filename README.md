# 🚀 ResumeIQ — AI Semantic Resume Analyzer & Career Coach

ResumeIQ is a next-generation resume analyzer that goes far beyond keyword counting:
- **Semantic Understanding**: Uses embeddings & TF-IDF similarity vectors to understand that *"led a team"* ≈ *"managed personnel"*.
- **Realistic ATS Simulation**: Detects parsing failure modes across Workday, Greenhouse, Taleo, and iCIMS (table scrambling, column layouts, hidden header/footer text).
- **Iterative AI Coach**: Provides STAR-method quantified bullet rewrites, recruiter F-pattern attention heatmaps, bias detection, and predicted interview questions.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Recharts + Lucide Icons + Custom Modern Dark Glassmorphic Design System
- **Backend**: Node.js (ESM) + Express.js + Prisma ORM + BullMQ / Redis
- **Parsing**: `pdf-parse` (bounding/layout analysis) + `mammoth` (DOCX structure)
- **NLP & Analysis**: Readability (Flesch-Kincaid), Sentiment/POS extraction, Action-Verb scoring, Bias & Inclusive language detector
- **AI Engine**: Groq LLaMA 3.3 70B Versatile / OpenAI-compatible client
- **Database & Storage**: PostgreSQL with `pgvector` + Redis 7

---

## ⚡ Quickstart

### Option 1: Run with Docker Compose (Recommended)

1. Make sure Docker is running on your machine.
2. Build and start all services:
   ```bash
   docker compose up --build
   ```
3. Open your browser:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option 2: Run Locally (Outside Docker)

#### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push   # Ensure Postgres is running
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌟 Key Features

1. **Explainable Composite Score (5 Radar Sub-Scores)**:
   - *Content Impact (30%)*
   - *ATS Compatibility (25%)*
   - *Keyword Relevance (20%)*
   - *Formatting Quality (15%)*
   - *Readability (10%)*
2. **Action-Verb & Quantification Engine**:
   - Classifies verbs into Strong, Moderate, and Weak tiers.
   - Detects measurable metrics (`$`, `%`, `X`, user counts) and suggests STAR-format rewrites.
3. **6-Second Recruiter Attention Heatmap**:
   - Simulates top-to-bottom F-pattern eye tracking over document sections.
4. **Bias & Inclusive Language Checker**:
   - Flags graduation years older than 20 years (age bias) and gendered terminology.
5. **Interview Question Predictor**:
   - Automatically generates grounded behavioral and technical interview questions based on actual resume bullets.
6. **Tailored Job Matching & Cover Letter Generator**:
   - Compares your resume against any pasted Job Description (JD).
