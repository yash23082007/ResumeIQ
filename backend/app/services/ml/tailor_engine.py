"""
ResumeIQ — Resume Tailoring Engine (Local NLP Synthesis)
Suggests specific modifications to align candidate resume with a target job description:
keyword inclusions, section reordering, and bullet refinements.
100% offline, zero external API keys.
"""

from typing import Dict, Any, List
from ..analysis.keyword_matcher import match_keywords

def generate_tailored_resume(resume_text: str, jd_text: str, parsed_json: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generate section-by-section tailoring plan and keyword insertion suggestions."""
    match_result = match_keywords(resume_text, jd_text)
    missing_keywords = match_result.get("missing", [])[:8]
    matched_keywords = match_result.get("matched", [])[:10]

    sections = (parsed_json or {}).get("sections", {}) or {}
    suggestions: List[Dict[str, str]] = []

    # 1. Summary suggestions
    if "summary" in sections:
        suggestions.append({
            "section": "Summary",
            "original": sections["summary"].get("content", "")[:150] + "...",
            "suggested": f"Target-focused professional with core proficiency in {', '.join(matched_keywords[:4])}. Proven ability to deliver high-impact results aligned with job requirements.",
            "rationale": "Aligning your summary headline immediately validates relevant skills for the target position."
        })

    # 2. Experience suggestions for missing keywords
    if missing_keywords and "experience" in sections:
        exp_bullets = sections["experience"].get("bullets", [])
        if exp_bullets:
            top_b = exp_bullets[0]
            suggestions.append({
                "section": "Experience",
                "original": top_b,
                "suggested": f"{top_b.rstrip('.')} incorporating {missing_keywords[0]} to drive scalable system performance.",
                "rationale": f"Explicitly mentioning '{missing_keywords[0]}' addresses a core requirement from the job description."
            })

    # 3. Skills section suggestions
    if missing_keywords:
        suggestions.append({
            "section": "Skills",
            "original": "Existing skill listings",
            "suggested": f"Add verified competencies: {', '.join(missing_keywords[:5])}",
            "rationale": "High-priority keywords extracted from the target job posting."
        })

    sections_to_reorder = [
        "Summary / Professional Profile",
        "Technical Skills (move higher if applying for specialized tech roles)",
        "Work Experience",
        "Projects & Portfolio",
        "Education & Certifications"
    ]

    summary_text = (
        f"Analyzed resume against role requirements: {len(matched_keywords)} skill matches detected and "
        f"{len(missing_keywords)} strategic opportunities identified to increase ATS alignment and relevance."
    )

    return {
        "suggestions": suggestions,
        "keywordsToAdd": missing_keywords,
        "sectionsToReorder": sections_to_reorder,
        "summary": summary_text,
    }
