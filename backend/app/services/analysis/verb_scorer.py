"""
ResumeIQ — Action-Verb & Impact Scorer
Classifies leading verbs into strength tiers, detects quantified metrics,
and computes content impact scores.
"""

import re
from typing import Dict, Any, List, Optional

VERB_STRENGTH = {
    "strong": {
        "spearheaded", "architected", "negotiated", "transformed", "pioneered",
        "orchestrated", "revolutionized", "championed", "accelerated", "eliminated",
        "maximized", "optimized", "streamlined", "launched", "established",
        "generated", "secured", "delivered", "exceeded", "drove",
        "overhauled", "redesigned", "engineered", "automated", "scaled",
        "consolidated", "innovated", "mentored", "influenced", "built", "authored"
    },
    "moderate": {
        "managed", "developed", "led", "created", "designed",
        "implemented", "improved", "increased", "reduced", "analyzed",
        "coordinated", "collaborated", "maintained", "supervised",
        "organized", "trained", "evaluated", "directed", "produced",
        "resolved", "planned", "achieved", "contributed", "facilitated",
        "initiated", "presented", "supported", "administered", "conducted",
    },
    "weak": {
        "responsible for", "worked on", "helped with", "assisted",
        "tasked with", "involved in", "participated in", "handled",
        "dealt with", "was responsible", "in charge of",
    },
}

QUANTIFIER_REGEX = re.compile(
    r"(\$[\d,.]+[MKB]?|\d+%|\d+x|\d{2,}(?:,\d{3})*\b|\d+\+?\s*(?:users?|clients?|customers?|teams?|members?|people|employees?|projects?|accounts?))",
    re.IGNORECASE
)

STRONG_VERB_SUGGESTIONS = {
    "responsible for": ["Led", "Directed", "Managed", "Drove"],
    "worked on": ["Developed", "Built", "Delivered", "Engineered"],
    "helped with": ["Contributed to", "Supported", "Facilitated", "Enabled"],
    "assisted": ["Supported", "Facilitated", "Collaborated on"],
    "handled": ["Managed", "Oversaw", "Directed"],
    "tasked with": ["Executed", "Delivered", "Accomplished"],
    "dealt with": ["Resolved", "Addressed", "Managed"],
    "participated in": ["Contributed to", "Collaborated on", "Drove"],
    "involved in": ["Contributed to", "Led", "Supported"],
    "managed": ["Directed", "Orchestrated", "Spearheaded"],
}

def extract_leading_verb(bullet: str) -> str:
    """Extract leading verb or multi-word phrase from a resume bullet point."""
    cleaned = re.sub(r"^[•●■◆▪→\-*]\s*", "", bullet).strip()

    # Check weak multi-word phrases first
    lower = cleaned.lower()
    for phrase in VERB_STRENGTH["weak"]:
        if lower.startswith(phrase):
            return phrase

    # Extract first word
    words = cleaned.split()
    return words[0].lower() if words else ""

def classify_verb(verb: str) -> str:
    """Classify a verb into a strength tier."""
    if not verb:
        return "unknown"

    lower = verb.lower()

    for phrase in VERB_STRENGTH["weak"]:
        if lower == phrase or lower.startswith(phrase):
            return "weak"

    if lower in VERB_STRENGTH["strong"]:
        return "strong"
    if lower in VERB_STRENGTH["moderate"]:
        return "moderate"

    return "moderate"  # Default: benefit of the doubt

def score_bullet(bullet: str) -> Dict[str, Any]:
    """Score a single bullet point for verb strength and quantification."""
    verb = extract_leading_verb(bullet)
    verb_tier = classify_verb(verb)
    quantified = bool(QUANTIFIER_REGEX.search(bullet))

    suggestion = None
    if verb_tier == "weak":
        alternatives = STRONG_VERB_SUGGESTIONS.get(verb, ["Consider a stronger action verb"])
        suggestion = f'Replace "{verb}" with a stronger verb like: {", ".join(alternatives)}.'

    if not quantified:
        metric_hint = "Add a measurable impact (%, $, # of users, time saved, etc.)."
        suggestion = f"{suggestion} {metric_hint}" if suggestion else metric_hint

    return {
        "text": bullet,
        "verb": verb,
        "verbTier": verb_tier,
        "quantified": quantified,
        "suggestion": suggestion,
    }

def score_all_bullets(parsed_json: Dict[str, Any]) -> Dict[str, Any]:
    """Score all bullets in experience and projects sections."""
    sections = (parsed_json or {}).get("sections", {}) or {}
    all_bullets = []

    for name, section in sections.items():
        if name in ["experience", "projects"] and isinstance(section, dict):
            bullets = section.get("bullets", [])
            all_bullets.extend(bullets)

    # Fallback to lines in experience content if bullets array empty
    if not all_bullets and isinstance(sections.get("experience"), dict):
        content = sections["experience"].get("content", "") or ""
        lines = content.split("\n")
        for line in lines:
            trimmed = line.strip()
            if len(trimmed) > 20 and trimmed and trimmed[0].isupper():
                all_bullets.append(trimmed)

    if not all_bullets:
        return {
            "score": 50,
            "bullets": [],
            "summary": {"total": 0, "strong": 0, "moderate": 0, "weak": 0, "quantified": 0},
        }

    scored = [score_bullet(b) for b in all_bullets]

    summary = {
        "total": len(scored),
        "strong": len([b for b in scored if b["verbTier"] == "strong"]),
        "moderate": len([b for b in scored if b["verbTier"] == "moderate"]),
        "weak": len([b for b in scored if b["verbTier"] == "weak"]),
        "quantified": len([b for b in scored if b["quantified"]]),
    }

    verb_score = (
        (summary["strong"] * 100 + summary["moderate"] * 70 + summary["weak"] * 20)
        / max(summary["total"], 1)
    )
    quant_score = (summary["quantified"] / max(summary["total"], 1)) * 100

    score = round(verb_score * 0.6 + quant_score * 0.4)

    return {
        "score": score,
        "bullets": scored,
        "summary": summary,
    }
