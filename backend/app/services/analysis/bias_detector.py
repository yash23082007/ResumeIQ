"""
ResumeIQ — Bias & Inclusive Language Detector
Flags age signals, gendered terms, and other potentially biasing content.
Offers neutral alternatives.
"""

from datetime import datetime
import re
from typing import Dict, Any, List

CURRENT_YEAR = datetime.now().year

GENDERED_TERMS = {
    "salesman": "salesperson",
    "salesmen": "salespeople",
    "chairman": "chairperson",
    "manpower": "workforce",
    "man-hours": "person-hours",
    "mankind": "humanity",
    "fireman": "firefighter",
    "policeman": "police officer",
    "stewardess": "flight attendant",
    "waitress": "server",
    "foreman": "supervisor",
    "businessman": "business professional",
    "craftsman": "craftsperson",
    "freshman": "first-year student",
    "mailman": "mail carrier",
    "cameraman": "camera operator",
    "spokesman": "spokesperson",
    "workman": "worker",
}

AGE_SIGNAL_TERMS = [
    "seasoned professional",
    "years of wisdom",
    "mature",
    "extensive tenure",
    "long-standing career",
]

def detect_bias(text: str) -> Dict[str, Any]:
    """Detect potential bias flags in resume text."""
    if not text:
        return {"score": 100, "flags": [], "hasCritical": False}

    flags: List[Dict[str, Any]] = []
    lower = text.lower()

    # 1. Graduation years > 20 years ago
    grad_year_regex = re.compile(r"\b(19[5-9]\d|20[0-1]\d)\b")
    for match in grad_year_regex.finditer(text):
        year = int(match.group(1))
        if year < CURRENT_YEAR - 20:
            start_idx = max(0, match.start() - 100)
            end_idx = min(len(text), match.end() + 50)
            context = text[start_idx:end_idx].lower()
            if any(term in context for term in ["graduat", "degree", "university", "college", "bachelor", "master"]):
                flags.append({
                    "type": "age",
                    "found": match.group(1),
                    "message": f"Graduation year {match.group(1)} may invite age bias during screening.",
                    "severity": "medium",
                    "suggestion": "Consider removing graduation years older than 15-20 years — your degree still counts without the date.",
                })

    # 2. Gendered language
    for term, alt in GENDERED_TERMS.items():
        pattern = re.compile(rf"\b{re.escape(term)}\b", re.IGNORECASE)
        if pattern.search(lower):
            flags.append({
                "type": "language",
                "found": term,
                "message": f'"{term}" uses gendered language.',
                "severity": "low",
                "suggestion": f'Consider using "{alt}" instead.',
            })

    # 3. Age-signaling phrases
    for phrase in AGE_SIGNAL_TERMS:
        if phrase in lower:
            flags.append({
                "type": "age",
                "found": phrase,
                "message": f'"{phrase}" can signal age and invite bias.',
                "severity": "low",
                "suggestion": "Replace with specific accomplishments and measurable impact.",
            })

    # 4. Personal demographic info
    personal_patterns = [
        (re.compile(r"\b(married|single|divorced|widowed)\b", re.IGNORECASE), "personal", "Marital status is unnecessary and may invite bias."),
        (re.compile(r"\b(age|born|date of birth|dob)\s*[:\-]?\s*\d", re.IGNORECASE), "age", "Including age/DOB is unnecessary in most regions and invites age bias."),
        (re.compile(r"\b(children|kids|dependents)\s*[:\-]?\s*\d", re.IGNORECASE), "personal", "Family details are unnecessary and may invite bias."),
        (re.compile(r"\bphoto(graph)?\b", re.IGNORECASE), "personal", "Including a photo is not standard in US/UK resumes and can invite bias."),
    ]

    for pattern, ptype, msg in personal_patterns:
        match = pattern.search(text)
        if match:
            flags.append({
                "type": ptype,
                "found": match.group(0),
                "message": msg,
                "severity": "medium",
                "suggestion": "Remove this information unless specifically required by the role or region.",
            })

    score = 100
    score -= len([f for f in flags if f.get("severity") == "medium"]) * 10
    score -= len([f for f in flags if f.get("severity") == "low"]) * 5

    return {
        "score": max(score, 0),
        "flags": flags,
        "hasCritical": any(f.get("severity") == "high" for f in flags),
    }
