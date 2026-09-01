"""
ResumeIQ — Keyword Matcher & Technical Skill Extraction
Lexical & Skill matching against Job Descriptions with boundary checks and canonical alias expansion.
"""

import re
from typing import Dict, Any, Set, List

SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "reactjs": "react",
    "react.js": "react",
    "nodejs": "node.js",
    "node": "node.js",
    "vuejs": "vue",
    "angularjs": "angular",
    "postgres": "postgresql",
    "psql": "postgresql",
    "mongo": "mongodb",
    "es6": "javascript",
    "aws": "amazon web services",
    "gcp": "google cloud platform",
    "ci/cd": "cicd",
    "ci-cd": "cicd",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "nlp": "natural language processing",
    "dl": "deep learning",
    "cv": "computer vision",
    "rest": "rest api",
    "restful": "rest api",
}

STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought", "used",
    "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into",
    "through", "during", "before", "after", "above", "below", "between",
    "this", "that", "these", "those", "it", "its", "we", "you", "they", "them",
    "our", "your", "their", "my", "his", "her", "who", "which", "what", "where",
    "when", "how", "all", "each", "every", "both", "few", "more", "most", "other",
    "some", "such", "no", "not", "only", "same", "so", "than", "too", "very",
    "just", "also", "about", "up", "out", "if", "then", "else", "while",
    "including", "must", "able", "etc", "well", "using", "work", "working",
    "experience", "required", "preferred", "strong", "excellent", "good",
    "responsibilities", "requirements", "qualifications", "job", "role", "position",
    "looking", "candidate", "team", "company", "opportunity", "years", "plus",
    "skills", "ability", "degree", "computer", "science", "engineering",
}

def extract_keywords(text: str) -> Set[str]:
    """Extract meaningful unigram and bigram keywords from text."""
    if not text:
        return set()

    # Replace slashes and brackets with spaces to break compound terms like fastapi/django
    cleaned = re.sub(r"[/\\(){}\[\]|,;:\n\r\t]", " ", text.lower())
    words = []
    for token in cleaned.split():
        token = token.strip(" \t\n\r.,!?:;\"'()[]{}")
        if len(token) >= 2 and token not in STOP_WORDS and not token.isdigit():
            words.append(token)
    return set(words)

def text_contains_keyword(text: str, keyword: str) -> bool:
    """Check if keyword or any alias occurs with strict word boundaries in text."""
    normalized_text = f" {text.lower()} "
    kw = keyword.lower()

    # Direct word boundary pattern
    pattern = re.compile(rf"(^|[^a-z0-9]){re.escape(kw)}([^a-z0-9]|$)", re.IGNORECASE)
    if pattern.search(normalized_text):
        return True

    # Alias matching
    for alias, canonical in SKILL_ALIASES.items():
        if canonical == kw or alias == kw:
            target_term = alias if canonical == kw else canonical
            alias_pattern = re.compile(rf"(^|[^a-z0-9]){re.escape(target_term)}([^a-z0-9]|$)", re.IGNORECASE)
            if alias_pattern.search(normalized_text):
                return True

    return False

def match_keywords(resume_text: str, jd_text: str = None) -> Dict[str, Any]:
    """Match keywords between resume and job description."""
    if not jd_text or not resume_text:
        return {
            "score": 100,
            "matched": [],
            "missing": [],
            "total": 0,
            "matchRate": "N/A",
            "type": "lexical_and_aliases",
        }

    jd_keywords = extract_keywords(jd_text)
    if not jd_keywords:
        return {
            "score": 100,
            "matched": [],
            "missing": [],
            "total": 0,
            "matchRate": "N/A",
            "type": "lexical_and_aliases",
        }

    matched = []
    missing = []

    for kw in jd_keywords:
        if text_contains_keyword(resume_text, kw):
            matched.append(kw)
        else:
            missing.append(kw)

    unique_matched = list(dict.fromkeys(matched))[:35]
    unique_missing = list(dict.fromkeys(missing))[:25]

    score = round((len(matched) / len(jd_keywords)) * 100) if jd_keywords else 100

    return {
        "score": min(score, 100),
        "matched": unique_matched,
        "missing": unique_missing,
        "total": len(jd_keywords),
        "matchRate": f"{len(matched)}/{len(jd_keywords)}",
        "type": "lexical_and_aliases",
    }
