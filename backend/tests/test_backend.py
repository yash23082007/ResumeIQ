"""
ResumeIQ — Comprehensive Test Suite for Python FastAPI & Local ML/DL Engines
"""

import os
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.parsing.section_extractor import extract_sections, extract_contact_info
from backend.app.services.analysis.ats_checker import check_ats_compatibility, simulate_ats
from backend.app.services.analysis.verb_scorer import score_all_bullets, score_bullet
from backend.app.services.analysis.readability import analyze_readability
from backend.app.services.analysis.bias_detector import detect_bias
from backend.app.services.ml.semantic_matcher import semantic_match_score, compute_tfidf_similarity
from backend.app.services.ml.star_rewriter import suggest_rewrites, synthesize_star_bullet
from backend.app.services.ml.interview_predictor import predict_interview_questions
from backend.app.services.ml.cover_letter_gen import generate_cover_letter

client = TestClient(app)

SAMPLE_RESUME_TEXT = """
Alex Morgan
alex.morgan@example.com | (555) 123-4567 | linkedin.com/in/alexmorgan | github.com/alexmorgan

SUMMARY
Results-driven Senior Full Stack Software Engineer with 6+ years of experience designing scalable microservices, high-performance web applications, and cloud infrastructure.

EXPERIENCE
TechCorp Solutions | Senior Software Engineer
2021 - Present
• Spearheaded architecture of high-throughput FastAPI and React microservices, reducing latency by 45% for 500,000 daily users.
• Managed relational PostgreSQL databases and optimized indexing, accelerating query response times by 60%.
• Responsible for testing software features and fixing bugs in legacy systems.
• Worked on deployment pipelines and containerization with Docker and Kubernetes.

StartupHub | Full Stack Developer
2018 - 2021
• Developed responsive user interfaces in React and Next.js, elevating customer engagement metrics by 35%.
• Assisted with database migration and API maintenance across cross-functional teams.

SKILLS
Programming Languages: Python, JavaScript, TypeScript, SQL
Frameworks & Libraries: FastAPI, React, Next.js, Node.js, Express, TailwindCSS
Tools & Cloud: PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, Git, CI/CD

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2018)
"""

SAMPLE_JD_TEXT = """
Senior Full Stack Engineer
Tech Innovations Inc.

We are looking for a Senior Full Stack Engineer to join our core product team.
Responsibilities:
- Build and maintain high-performance microservices in Python (FastAPI/Django) and modern web applications in React/Next.js.
- Optimize database queries and schema design in PostgreSQL and Redis.
- Collaborate with cross-functional engineering teams and implement automated CI/CD pipelines in AWS and Docker.

Requirements:
- 5+ years of experience with Python, React, Next.js, and TypeScript.
- Strong knowledge of PostgreSQL, REST APIs, and Docker/Kubernetes.
- Experience with unit testing, automated deployments, and scalable architecture.
"""

def test_health_endpoints():
    """Verify live and ready health endpoints without external AI keys."""
    res_live = client.get("/api/health/live")
    assert res_live.status_code == 200
    assert res_live.json()["status"] == "live"

    res_ready = client.get("/api/health/ready")
    assert res_ready.status_code == 200
    data = res_ready.json()
    assert data["status"] == "ready"
    assert data["ml"]["external_api_keys_required"] is False

def test_methodology_endpoint():
    """Verify methodology definition."""
    res = client.get("/api/v1/methodology/current")
    assert res.status_code == 200
    assert "scoreDimensions" in res.json()

def test_section_extraction():
    """Test section parsing and contact info extraction."""
    sections = extract_sections(SAMPLE_RESUME_TEXT)
    assert "summary" in sections
    assert "experience" in sections
    assert "skills" in sections
    assert "education" in sections
    assert "contact" in sections

    contact = sections["contact"]
    assert "alex.morgan@example.com" in contact["emails"]
    assert len(contact["phones"]) > 0
    assert len(contact["linkedin"]) > 0

def test_ats_checker():
    """Test ATS compatibility and simulation."""
    sections = extract_sections(SAMPLE_RESUME_TEXT)
    parsed = {
        "sections": sections,
        "layout": {"hasMultiColumnTables": False, "hasImages": False, "pageCount": 1},
        "wordCount": len(SAMPLE_RESUME_TEXT.split()),
    }
    ats_res = check_ats_compatibility(parsed)
    assert ats_res["score"] >= 80
    assert ats_res["passed"] is True

    sim_res = simulate_ats(parsed)
    assert "Workday" in [r["ats"] for r in sim_res["results"]]

def test_verb_scoring_and_star_rewrites():
    """Test action verb impact and STAR rewrite engine."""
    sections = extract_sections(SAMPLE_RESUME_TEXT)
    parsed = {"sections": sections}
    verb_res = score_all_bullets(parsed)
    assert verb_res["score"] > 0
    assert verb_res["summary"]["total"] > 0

    # Test STAR rewrite synthesis for weak bullet
    weak_bullet = {"text": "Responsible for testing software features and fixing bugs."}
    rewrites = suggest_rewrites([weak_bullet])
    assert len(rewrites) == 1
    assert rewrites[0]["rewritten"] is not None
    assert "[" in rewrites[0]["rewritten"]  # Metric placeholder

def test_ml_semantic_matching():
    """Test TF-IDF cosine semantic similarity."""
    sim = compute_tfidf_similarity(SAMPLE_RESUME_TEXT, SAMPLE_JD_TEXT)
    assert sim > 0.1

    match = semantic_match_score(SAMPLE_RESUME_TEXT, SAMPLE_JD_TEXT)
    assert match["score"] > 50
    assert len(match["matchedKeywords"]) > 0
    assert len(match["insights"]) > 0

def test_readability_and_bias():
    """Test readability and bias detection."""
    readability = analyze_readability(SAMPLE_RESUME_TEXT)
    assert readability["score"] > 50
    assert readability["fleschReadingEase"] > 0

    bias = detect_bias(SAMPLE_RESUME_TEXT)
    assert bias["score"] >= 80

def test_interview_prediction_and_cover_letter():
    """Test interview question predictor and cover letter synthesizer."""
    sections = extract_sections(SAMPLE_RESUME_TEXT)
    parsed = {"sections": sections}

    questions_res = predict_interview_questions(SAMPLE_RESUME_TEXT, parsed)
    assert len(questions_res["questions"]) >= 5

    cover_letter_res = generate_cover_letter(SAMPLE_RESUME_TEXT, SAMPLE_JD_TEXT, parsed)
    assert cover_letter_res["wordCount"] > 100
    assert "Alex Morgan" in cover_letter_res["text"] or "Dear Hiring Manager" in cover_letter_res["text"]

def test_auth_and_resume_lifecycle():
    """End-to-end test of user registration, login, resume upload, and analysis."""
    # 1. Register
    email = f"test_user_{os.urandom(4).hex()}@example.com"
    password = "SecurePassword123!"

    reg_res = client.post("/api/auth/register", json={"email": email, "password": password})
    assert reg_res.status_code == 201
    token = reg_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == email

    # 3. Create Job Description
    jd_res = client.post(
        "/api/job-descriptions",
        json={"title": "Senior Full Stack Engineer", "company": "Tech Corp", "rawText": SAMPLE_JD_TEXT},
        headers=headers
    )
    assert jd_res.status_code == 201
    jd_id = jd_res.json()["id"]

    # 4. Upload Resume (.txt)
    files = {"file": ("sample_resume.txt", SAMPLE_RESUME_TEXT.encode("utf-8"), "text/plain")}
    data = {"label": "Primary Resume"}
    upload_res = client.post("/api/resumes", files=files, data=data, headers=headers)
    assert upload_res.status_code == 201
    resume_id = upload_res.json()["id"]

    # 5. Trigger Full Analysis
    analyze_res = client.post(
        f"/api/resumes/{resume_id}/analyze",
        json={"jobDescriptionId": jd_id},
        headers=headers
    )
    assert analyze_res.status_code == 202
    analysis_id = analyze_res.json()["analysisId"]

    # 6. Fetch Analysis
    analysis_poll = client.get(f"/api/analyses/{analysis_id}", headers=headers)
    assert analysis_poll.status_code == 200
    analysis_data = analysis_poll.json()
    assert analysis_data["status"] == "completed"
    assert analysis_data["overallScore"] is not None
    assert analysis_data["findings"]["narrative"] is not None

    # 7. Heatmap & Interview Qs
    heatmap_res = client.get(f"/api/resumes/{resume_id}/heatmap", headers=headers)
    assert heatmap_res.status_code == 200

    questions_res = client.get(f"/api/resumes/{resume_id}/interview-questions", headers=headers)
    assert questions_res.status_code == 200

    # 8. Public ATS check
    pub_res = client.post("/api/public/ats-check", json={"text": SAMPLE_RESUME_TEXT})
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "success"
