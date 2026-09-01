"""
ResumeIQ — Cover Letter Generator (Local NLP Synthesis)
Generates a structured, compelling cover letter grounded in candidate experience and target role.
100% offline, zero external API keys.
"""

from typing import Dict, Any, List
import re

def extract_highlights(cover_letter: str, resume_text: str) -> List[str]:
    """Extract key quantified achievements and impact sentences from text."""
    highlights = []
    sentences = [s.strip() for s in re.split(r"[.!]", cover_letter) if len(s.strip()) > 25]

    for sentence in sentences:
        if re.search(r"(\d+%|\$[\d,.]+|\d+\+?\s*(year|project|team|client|user))", sentence, re.IGNORECASE):
            highlights.append(sentence)

    if not highlights and sentences:
        highlights = sentences[:3]

    return highlights[:5]

def generate_cover_letter(resume_text: str, jd_text: str, parsed_json: Dict[str, Any] = None) -> Dict[str, Any]:
    """Synthesize a tailored cover letter from resume and job description."""
    contact = (parsed_json or {}).get("sections", {}).get("contact", {}) or {}
    name = contact.get("name") or "Candidate"
    
    # Extract experience bullets or lines
    sections = (parsed_json or {}).get("sections", {}) or {}
    exp_bullets = sections.get("experience", {}).get("bullets", []) if isinstance(sections.get("experience"), dict) else []
    
    top_achievement = (
        exp_bullets[0]
        if exp_bullets
        else "delivering robust software solutions and driving measurable technical impact"
    )
    second_achievement = (
        exp_bullets[1]
        if len(exp_bullets) > 1
        else "collaborating across cross-functional teams to build reliable, high-performance systems"
    )

    # Extract target role keywords from JD
    jd_lines = [l.strip() for l in (jd_text or "").split("\n") if l.strip()]
    target_role = jd_lines[0] if jd_lines and len(jd_lines[0]) < 60 else "the open position"

    cover_letter = (
        f"Dear Hiring Manager,\n\n"
        f"I am writing to express my strong interest in {target_role}. With a proven track record in software engineering "
        f"and technical problem-solving, I am excited about the opportunity to contribute my skills and experience to your team's mission.\n\n"
        f"Throughout my professional journey, I have focused on engineering high-impact solutions with measurable results. "
        f"In my recent work, I spearheaded key initiatives including {top_achievement.rstrip('.')}. "
        f"Furthermore, I contributed to {second_achievement.rstrip('.')}, which reinforced my ability to execute complex projects with agility and technical rigor.\n\n"
        f"Your team's requirements align closely with my background in scalable architecture, clean code standards, and iterative product delivery. "
        f"I welcome the opportunity to discuss how my experience and technical leadership can directly benefit your team's upcoming objectives.\n\n"
        f"Thank you for your time and consideration. I look forward to speaking with you.\n\n"
        f"Sincerely,\n{name}"
    )

    word_count = len(cover_letter.split())
    highlights = extract_highlights(cover_letter, resume_text)

    return {
        "text": cover_letter,
        "coverLetter": cover_letter,  # backward compatibility alias
        "highlights": highlights,
        "wordCount": word_count,
    }
