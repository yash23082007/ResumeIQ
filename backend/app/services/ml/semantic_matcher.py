"""
ResumeIQ — Semantic Matcher (Local ML & NLP Engine)
Computes cosine similarity using Scikit-Learn TF-IDF vectorization (sublinear TF, 1-3 grams)
blended with deterministic lexical & skill alias matching. Zero external API keys needed.
"""

from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from ..analysis.keyword_matcher import match_keywords

def compute_tfidf_similarity(text_a: str, text_b: str) -> float:
    """Compute sublinear TF-IDF cosine similarity between two documents."""
    if not text_a or not text_b:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words="english",
            max_features=5000,
        )
        tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
        sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        score = float(sim_matrix[0][0])
        return max(0.0, min(1.0, score))
    except Exception:
        return 0.0

def semantic_match_score(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Perform semantic (TF-IDF Cosine) + lexical keyword match between resume and job description.
    Blended score: 60% semantic similarity + 40% keyword overlap.
    """
    if not resume_text or not jd_text:
        return {
            "score": 0.0,
            "semanticScore": 0.0,
            "keywordScore": 0,
            "missingKeywords": [],
            "matchedKeywords": [],
            "insights": ["Please provide both a resume and a job description to calculate matching scores."]
        }

    # 1. Lexical & alias matching
    keyword_result = match_keywords(resume_text, jd_text)
    keyword_score = keyword_result.get("score", 0)

    # 2. Local TF-IDF Semantic similarity with standard resume calibration
    raw_semantic_sim = compute_tfidf_similarity(resume_text, jd_text)
    calibrated_semantic = min(1.0, raw_semantic_sim * 3.0)

    # 3. Blended Composite Score
    blended = 0.5 * calibrated_semantic + 0.5 * (keyword_score / 100.0)
    score = round(blended * 100 * 10) / 10

    # 4. Generate Explainable Insights
    insights: List[str] = []

    if score >= 80:
        insights.append("Strong match — your resume aligns well with this job description.")
    elif score >= 60:
        insights.append("Decent match, but there's room to improve alignment and emphasis.")
    elif score >= 40:
        insights.append("Moderate gap between your resume and this role. Consider tailoring your experience descriptions.")
    else:
        insights.append("Significant gap — this role may require substantial resume tailoring or additional relevant experience.")

    missing = keyword_result.get("missing", [])
    if missing:
        top_missing = missing[:5]
        insights.append(f"Key missing terms: {', '.join(top_missing)}. Try incorporating these where truthfully applicable.")

    if keyword_score > calibrated_semantic * 100:
        insights.append("Your keywords match well, but your descriptions may not fully convey the depth of relevant experience. Consider expanding achievement context.")

    return {
        "score": score,
        "semanticScore": round(calibrated_semantic * 100 * 10) / 10,
        "keywordScore": keyword_score,
        "missingKeywords": missing,
        "matchedKeywords": keyword_result.get("matched", []),
        "insights": insights,
    }
