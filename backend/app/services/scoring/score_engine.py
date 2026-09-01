"""
ResumeIQ — Composite Scoring Engine (Local ML/DL Pipeline)
Orchestrates all sub-scorers (ATS, Content Impact, Keywords, Formatting, Readability, Bias)
into an explainable composite score and natural narrative summary.
100% offline, zero external API keys.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from ..analysis.ats_checker import check_ats_compatibility, simulate_ats
from ..analysis.keyword_matcher import match_keywords
from ..analysis.verb_scorer import score_all_bullets
from ..analysis.readability import analyze_readability
from ..analysis.bias_detector import detect_bias
from ..analysis.heatmap import build_heatmap
from ..ml.star_rewriter import suggest_rewrites

WEIGHTS = {
    "content_impact": 0.30,
    "ats_compatibility": 0.25,
    "keyword_relevance": 0.20,
    "formatting": 0.15,
    "readability": 0.10,
}

METHODOLOGY_VERSION = "2026.08.1"

def compute_formatting_score(parsed_json: Dict[str, Any]) -> int:
    """Compute formatting score based on layout structure and word count."""
    if not parsed_json:
        return 50

    score = 100
    sections = parsed_json.get("sections", {}) or {}
    layout = parsed_json.get("layout", {}) or {}

    expected_sections = ["summary", "experience", "education", "skills"]
    found_sections = list(sections.keys())
    missing_sections = [s for s in expected_sections if s not in found_sections]
    score -= len(missing_sections) * 8

    word_count = parsed_json.get("wordCount", 0)
    if word_count < 200:
        score -= 15
    elif word_count < 300:
        score -= 5
    elif word_count > 1200:
        score -= 10

    if layout.get("pageCount", 1) > 2:
        score -= 10

    exp_sec = sections.get("experience")
    if isinstance(exp_sec, dict) and len(exp_sec.get("bullets", [])) < 3:
        score -= 10

    return max(score, 0)

def compute_analysis_confidence(parsed_json: Dict[str, Any], raw_text: str, has_target_role: bool) -> float:
    """Compute confidence score for the analysis."""
    confidence = 0.8 if len(raw_text.strip()) >= 200 else 0.55
    sections = (parsed_json or {}).get("sections", {}) or {}
    if len(sections) >= 3:
        confidence += 0.08
    if has_target_role:
        confidence += 0.08
    if (parsed_json or {}).get("layout", {}).get("hasImages"):
        confidence -= 0.15
    return max(0.0, min(1.0, round(confidence * 100) / 100))

def generate_narrative(sub_scores: Dict[str, Any], findings: Dict[str, Any], overall_score: float) -> str:
    """Generate concise, actionable narrative summary from analysis metrics."""
    parts = []

    if overall_score >= 80:
        parts.append(f"Your resume scores {overall_score}/100 — strong overall profile with solid ATS alignment.")
    elif overall_score >= 60:
        parts.append(f"Your resume scores {overall_score}/100 — good foundation with specific opportunities to increase impact.")
    else:
        parts.append(f"Your resume scores {overall_score}/100 — critical areas in structure and content require optimization.")

    ats_issues = findings.get("ats", {}).get("issues", [])
    if ats_issues:
        parts.append(f"{len(ats_issues)} ATS compatibility issue(s) detected that could affect automatic recruiter screening.")

    weak_bullets = findings.get("impact", {}).get("summary", {}).get("weak", 0)
    if weak_bullets > 0:
        parts.append(f"{weak_bullets} bullet point(s) use passive verbs — upgrading to STAR-format action verbs with quantified metrics will boost score.")

    readability_stats = findings.get("readability", {})
    if readability_stats.get("buzzwords"):
        parts.append(f"Found {len(readability_stats['buzzwords'])} cliché buzzword(s); replace with tangible achievements.")

    return " ".join(parts)

def run_full_analysis_sync(
    db: Session,
    analysis_id: str,
    resume_obj: Any,
    job_description_id: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Execute complete analysis pipeline synchronously and update DB record."""
    from ...database import Analysis, JobDescription

    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        return

    try:
        parsed_json = resume_obj.parsedJson or {}
        raw_text = resume_obj.rawText or ""

        # Fetch JD if provided
        jd_text = None
        if job_description_id:
            jd_query = db.query(JobDescription).filter(JobDescription.id == job_description_id)
            if user_id:
                jd_query = jd_query.filter(JobDescription.userId == user_id)
            jd_obj = jd_query.first()
            if jd_obj:
                jd_text = jd_obj.rawText

        # ─── Run All Sub-Scorers ─────────────────────────────────
        ats_result = check_ats_compatibility(parsed_json)
        ats_sim_result = simulate_ats(parsed_json)
        keyword_result = match_keywords(raw_text, jd_text)
        verb_result = score_all_bullets(parsed_json)
        readability_result = analyze_readability(raw_text)
        bias_result = detect_bias(raw_text)
        heatmap_result = build_heatmap(parsed_json)
        formatting_score = compute_formatting_score(parsed_json)

        # ─── Sub-Scores ──────────────────────────────────────────
        sub_scores = {
            "content_impact": verb_result.get("score", 0),
            "ats_compatibility": ats_result.get("score", 0),
            "keyword_relevance": keyword_result.get("score", 0) if jd_text else None,
            "formatting": formatting_score,
            "readability": readability_result.get("score", 0),
        }

        # ─── Overall Composite Score Calculation ────────────────
        active_weights = {k: v for k, v in WEIGHTS.items() if sub_scores[k] is not None}
        total_weight = sum(active_weights.values())
        overall = sum(sub_scores[k] * (w / total_weight) for k, w in active_weights.items())
        overall_score = round(overall * 10) / 10

        # ─── Findings & STAR Rewrites ───────────────────────────
        weak_bullets = [
            b for b in verb_result.get("bullets", [])
            if b.get("verbTier") == "weak" or not b.get("quantified")
        ]
        rewrites = suggest_rewrites(weak_bullets[:5], raw_text)

        findings = {
            "ats": ats_result,
            "atsSimulation": ats_sim_result,
            "keywords": keyword_result,
            "impact": verb_result,
            "readability": readability_result,
            "bias": bias_result,
            "formatting": {"score": formatting_score},
            "methodologyVersion": METHODOLOGY_VERSION,
            "confidence": compute_analysis_confidence(parsed_json, raw_text, bool(jd_text)),
            "scoreWarnings": (
                ([] if jd_text else ["No target role was provided; role relevance is not included in the composite score."]) +
                (["Some document content may be image-based and unavailable to text analysis."] if parsed_json.get("layout", {}).get("hasImages") else [])
            ),
            "rewrites": rewrites,
            "heatmap": heatmap_result,
        }

        findings["narrative"] = generate_narrative(sub_scores, findings, overall_score)

        # ─── Update Database Record ─────────────────────────────
        analysis.overallScore = overall_score
        analysis.subScores = sub_scores
        analysis.findings = findings
        analysis.heatmapData = heatmap_result
        analysis.status = "completed"
        db.commit()

        print(f"✓ Analysis {analysis_id} completed successfully — Overall Score: {overall_score}")

    except Exception as err:
        print(f"✗ Analysis {analysis_id} failed: {err}")
        db.rollback()
        analysis.status = "failed"
        analysis.findings = {"error": str(err)}
        db.commit()
