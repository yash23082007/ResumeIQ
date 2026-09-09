"""
ResumeIQ — STAR Rewrite Engine (Hybrid Groq LLM + Local NLP Synthesis)
Transforms weak or passive resume bullets into high-impact STAR-format statements
(Situation, Task, Action, Result) with strong action verbs and quantified metrics.
Supports server-side Groq LLaMA 3.3 70B when configured, with 100% deterministic local fallback.
"""

import re
from typing import List, Dict, Any, Optional

from ..analysis.verb_scorer import extract_leading_verb, classify_verb, VERB_STRENGTH
from .groq_client import generate_star_rewrites_groq

DOMAIN_TRANSFORMS = [
    {
        "keywords": ["api", "backend", "endpoint", "server", "microservice", "service", "rest"],
        "verbs": ["Architected", "Engineered", "Optimized", "Streamlined"],
        "metric": "reducing latency by [X%] and supporting [Xk] daily active users",
        "action_tmpl": "high-throughput {core} services using robust design patterns"
    },
    {
        "keywords": ["database", "sql", "postgres", "mongo", "query", "schema", "indexing"],
        "verbs": ["Optimized", "Redesigned", "Refactored", "Consolidated"],
        "metric": "improving query performance by [X%] across [X Million] records",
        "action_tmpl": "relational database models and indexing strategies for {core}"
    },
    {
        "keywords": ["frontend", "ui", "ux", "react", "next", "vue", "component", "design", "css"],
        "verbs": ["Spearheaded", "Revamped", "Engineered", "Delivered"],
        "metric": "increasing user engagement by [X%] and boosting page load speed by [X%]",
        "action_tmpl": "responsive, accessible user interfaces for {core}"
    },
    {
        "keywords": ["test", "qa", "automation", "coverage", "cypress", "jest", "pytest", "bug"],
        "verbs": ["Implemented", "Automated", "Standardized", "Established"],
        "metric": "expanding test coverage from [X%] to [Y%] and cutting production bugs by [Z%]",
        "action_tmpl": "end-to-end automated testing suites to validate {core}"
    },
    {
        "keywords": ["cloud", "aws", "docker", "k8s", "kubernetes", "ci/cd", "pipeline", "deploy"],
        "verbs": ["Automated", "Orchestrated", "Containerized", "Modernized"],
        "metric": "reducing deployment cycle time by [X hours] with [99.9X%] uptime",
        "action_tmpl": "CI/CD deployment pipelines and cloud infrastructure for {core}"
    },
    {
        "keywords": ["team", "lead", "manage", "mentor", "scrum", "agile", "coordinate", "junior"],
        "verbs": ["Spearheaded", "Mentored", "Orchestrated", "Championed"],
        "metric": "accelerating sprint delivery velocity by [X%] across [X]-person engineering team",
        "action_tmpl": "agile workflows and cross-functional technical initiatives for {core}"
    },
    {
        "keywords": ["client", "customer", "sales", "revenue", "user", "onboarding", "support"],
        "verbs": ["Delivered", "Drove", "Pioneered", "Maximized"],
        "metric": "driving [$Xk] in incremental value and elevating satisfaction ratings by [X%]",
        "action_tmpl": "client-facing technical solutions addressing {core}"
    },
]

WEAK_PREFIXES = [
    re.compile(r"^(responsible for\s*(the)?|worked on\s*(the)?|helped with\s*(the)?|assisted in\s*(the)?|assisted with\s*(the)?|tasked with\s*(the)?|involved in\s*(the)?|participated in\s*(the)?|handled\s*(the)?|was responsible for\s*(the)?|was tasked with\s*(the)?)\s*", re.IGNORECASE),
    re.compile(r"^[•●■◆▪→\-*]\s*"),
]


def clean_bullet_text(text: str) -> str:
    """Strip bullet markers and weak introductory phrases."""
    cleaned = text.strip()
    for pattern in WEAK_PREFIXES:
        cleaned = pattern.sub("", cleaned).strip()
    return cleaned


def synthesize_star_bullet(bullet_text: str, index: int = 0, verb_tier: Optional[str] = None) -> Dict[str, Any]:
    """
    Synthesize a STAR-format rewrite with strong power verbs and quantified impact.
    Detects already-strong leading verbs and avoids duplicate verb prepending.
    """
    cleaned = clean_bullet_text(bullet_text)
    if not cleaned:
        return {"original": bullet_text, "rewritten": bullet_text, "explanation": ""}

    lower = cleaned.lower()
    words = cleaned.split()
    first_word = words[0] if words else ""
    first_word_clean = re.sub(r"[^\w]", "", first_word).lower()

    # Determine leading verb & tier
    leading_verb = extract_leading_verb(cleaned)
    tier = verb_tier or classify_verb(first_word_clean or leading_verb)

    # Find best domain transform match
    matched_transform = None
    for transform in DOMAIN_TRANSFORMS:
        if any(kw in lower for kw in transform["keywords"]):
            matched_transform = transform
            break

    if not matched_transform:
        matched_transform = {
            "verbs": ["Spearheaded", "Engineered", "Executed", "Optimized"],
            "metric": "resulting in [X%] increase in operational efficiency and [Y hours] saved weekly",
            "action_tmpl": "{core}"
        }

    # If the bullet already starts with a strong action verb, preserve it
    if tier == "strong" or first_word_clean in VERB_STRENGTH["strong"]:
        verb = first_word.capitalize()
        rest_words = words[1:]
        # Guard against consecutive duplicate verb tokens
        while rest_words and re.sub(r"[^\w]", "", rest_words[0]).lower() in (first_word_clean, verb.lower()):
            rest_words.pop(0)
        core_action = " ".join(rest_words).strip()
        explanation = (
            f"Preserved strong action verb '{verb}' and added STAR-format quantified impact placeholders."
        )
    else:
        # Upgrade weak or moderate verb to a power verb from the domain transform
        verb = matched_transform["verbs"][index % len(matched_transform["verbs"])]

        # Strip the weak or moderate leading verb token/phrase
        if leading_verb and lower.startswith(leading_verb):
            core_action = cleaned[len(leading_verb):].strip()
        elif tier == "moderate" or first_word_clean in VERB_STRENGTH["moderate"]:
            core_action = " ".join(words[1:]).strip() if len(words) > 1 else cleaned
        else:
            core_action = cleaned

        # Guard against duplicate verb stuttering (e.g., if core_action begins with verb)
        parts = core_action.split()
        while parts and re.sub(r"[^\w]", "", parts[0]).lower() in (verb.lower(), leading_verb.lower()):
            parts.pop(0)
        core_action = " ".join(parts).strip()

        explanation = (
            f"Replaced passive/moderate phrasing with the active leadership verb '{verb}' "
            f"and added STAR-format quantified impact placeholders."
        )

    # Clean leading/trailing punctuation and casing
    core_action = core_action.lstrip(" ,.-:")
    if core_action:
        # Avoid lowercasing acronyms like CI/CD, AWS, API, SQL
        if not re.match(r"^[A-Z0-9/]{2,}\b", core_action) and core_action[0].isupper():
            core_action = core_action[0].lower() + core_action[1:]

    core_action = core_action.rstrip(".")
    metric = matched_transform["metric"]

    if core_action:
        rewritten = f"{verb} {core_action}, {metric}."
    else:
        rewritten = f"{verb}, {metric}."

    return {
        "original": bullet_text,
        "rewritten": rewritten,
        "proposedText": rewritten,
        "explanation": explanation
    }


def suggest_rewrites(flagged_bullets: List[Dict[str, Any]], resume_context: str = "") -> List[Dict[str, Any]]:
    """
    Generate STAR rewrite suggestions for flagged weak or unquantified bullets.
    Uses Groq LLaMA 3.3 70B if configured, or deterministic local synthesis as fallback.
    """
    if not flagged_bullets:
        return []

    # Extract raw text strings
    bullet_texts = []
    for bullet in flagged_bullets:
        text = bullet.get("text", "") if isinstance(bullet, dict) else str(bullet)
        if text.strip():
            bullet_texts.append(text.strip())

    if not bullet_texts:
        return []

    # Attempt Groq LLM rewrite if key is configured
    groq_res = generate_star_rewrites_groq(bullet_texts[:5], resume_context=resume_context)
    if groq_res.get("available") and groq_res.get("rewrites"):
        return groq_res["rewrites"]

    # Local deterministic synthesis fallback
    rewrites = []
    for i, bullet in enumerate(flagged_bullets):
        text = bullet.get("text", "") if isinstance(bullet, dict) else str(bullet)
        verb_tier = bullet.get("verbTier") if isinstance(bullet, dict) else None
        if text:
            suggestion = synthesize_star_bullet(text, index=i, verb_tier=verb_tier)
            rewrites.append(suggestion)

    return rewrites
