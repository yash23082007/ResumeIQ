"""
ResumeIQ — Readability Scorer (NLP)
Computes Flesch Reading Ease, Flesch-Kincaid Grade Level, sentence complexity,
and buzzword density for resume text.
"""

import re
from typing import Dict, Any, List

BUZZWORDS = {
    "synergy", "leverage", "paradigm", "proactive", "dynamic",
    "results-driven", "self-starter", "team player", "go-getter",
    "think outside the box", "detail-oriented", "hard-working",
    "motivated", "passionate", "guru", "ninja", "rockstar",
    "best-of-breed", "cutting-edge", "world-class",
    "strategic thinker", "visionary", "thought leader",
}

def count_syllables(word: str) -> int:
    """Linguistic syllable estimation for an English word."""
    word = re.sub(r"[^a-z]", "", word.lower())
    if len(word) <= 3:
        return 1

    word = re.sub(r"(?:[^laeiouy]es|ed|[^laeiouy]e)$", "", word)
    word = re.sub(r"^y", "", word)
    matches = re.findall(r"[aeiouy]{1,2}", word)
    return max(len(matches), 1)

def split_sentences(text: str) -> List[str]:
    """Split text into sentences handling bullet points and punctuation boundaries."""
    lines = text.split("\n")
    sentences = []

    for line in lines:
        trimmed = re.sub(r"^[•●■◆▪→\-*]\s*", "", line).strip()
        if not trimmed:
            continue

        chunks = [s.strip() for s in re.split(r"[.!?]+", trimmed) if len(s.strip()) > 5]
        if chunks:
            sentences.extend(chunks)
        elif len(trimmed) > 5:
            sentences.append(trimmed)

    return sentences

def split_words(text: str) -> List[str]:
    """Extract valid alphanumeric words."""
    return [w for w in text.split() if re.sub(r"[^a-zA-Z0-9]", "", w)]

def compute_reading_ease(words: List[str], sentences: List[str], total_syllables: int) -> float:
    """Flesch Reading Ease score (0 - 100). Target: 50 - 70."""
    if not sentences or not words:
        return 50.0

    avg_words_per_sentence = len(words) / len(sentences)
    avg_syllables_per_word = total_syllables / len(words)

    score = 206.835 - 1.015 * avg_words_per_sentence - 84.6 * avg_syllables_per_word
    return max(0.0, min(100.0, round(score * 10) / 10))

def compute_grade_level(words: List[str], sentences: List[str], total_syllables: int) -> float:
    """Flesch-Kincaid Grade Level. Target: Grade 9 - 12."""
    if not sentences or not words:
        return 10.0

    avg_words_per_sentence = len(words) / len(sentences)
    avg_syllables_per_word = total_syllables / len(words)

    grade = 0.39 * avg_words_per_sentence + 11.8 * avg_syllables_per_word - 15.59
    return max(1.0, min(20.0, round(grade * 10) / 10))

def detect_complex_sentences(sentences: List[str]) -> List[Dict[str, Any]]:
    """Detect overly long sentences (>32 words) that cause recruiter fatigue."""
    issues = []
    for sentence in sentences:
        words = split_words(sentence)
        if len(words) > 32:
            issues.append({
                "text": sentence[:90] + ("..." if len(sentence) > 90 else ""),
                "wordCount": len(words),
                "issue": "Very long sentence — may cause recruiter fatigue during rapid screening.",
                "suggestion": "Break into 2 concise statements or separate into distinct bullet points.",
            })
    return issues

def detect_buzzwords(text: str) -> List[Dict[str, str]]:
    """Detect clichés and buzzwords."""
    lower = text.lower()
    found = []
    for word in BUZZWORDS:
        pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
        if pattern.search(lower):
            found.append({
                "term": word,
                "suggestion": f'"{word}" is a common cliché — substitute with an active, quantified achievement.',
            })
    return found

def analyze_readability(raw_text: str) -> Dict[str, Any]:
    """Full readability analysis."""
    if not raw_text:
        return {
            "score": 50,
            "fleschReadingEase": 50.0,
            "fleschKincaidGrade": 10.0,
            "fleschKincaid": 50.0,
            "complexSentences": [],
            "buzzwords": [],
            "stats": {},
        }

    words = split_words(raw_text)
    sentences = split_sentences(raw_text)
    total_syllables = sum(count_syllables(w) for w in words)

    reading_ease = compute_reading_ease(words, sentences, total_syllables)
    grade_level = compute_grade_level(words, sentences, total_syllables)
    complex_sentences = detect_complex_sentences(sentences)
    buzzwords = detect_buzzwords(raw_text)

    stats = {
        "wordCount": len(words),
        "sentenceCount": len(sentences),
        "avgWordsPerSentence": round((len(words) / max(len(sentences), 1)) * 10) / 10,
        "avgWordLength": round((sum(len(w) for w in words) / max(len(words), 1)) * 10) / 10,
    }

    score = 100
    if grade_level > 14:
        score -= 15
    elif grade_level < 8:
        score -= 10

    score -= min(len(complex_sentences) * 5, 20)
    score -= min(len(buzzwords) * 3, 15)

    return {
        "score": max(score, 0),
        "fleschReadingEase": reading_ease,
        "fleschKincaidGrade": grade_level,
        "fleschKincaid": reading_ease,
        "complexSentences": complex_sentences,
        "buzzwords": buzzwords,
        "stats": stats,
    }
