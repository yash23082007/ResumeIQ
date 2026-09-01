"""
ResumeIQ — STAR Rewrite Engine (Local NLP & Heuristic Synthesis)
Transforms weak or passive resume bullets into high-impact STAR-format statements
(Situation, Task, Action, Result) with strong action verbs and quantified impact placeholders.
Runs 100% locally with zero external API calls.
"""

import re
from typing import List, Dict, Any

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
    re.compile(r"^(responsible for\s*(the)?|worked on\s*(the)?|helped with\s*(the)?|assisted in\s*(the)?|assisted with\s*(the)?|tasked with\s*(the)?|involved in\s*(the)?|participated in\s*(the)?|handled\s*(the)?|was responsible for\s*(the)?)\s*", re.IGNORECASE),
    re.compile(r"^[•●■◆▪→\-*]\s*"),
]

def clean_bullet_text(text: str) -> str:
    """Strip weak introductory phrases and bullet markers."""
    cleaned = text.strip()
    for pattern in WEAK_PREFIXES:
        cleaned = pattern.sub("", cleaned).strip()
    return cleaned

def synthesize_star_bullet(bullet_text: str, index: int = 0) -> Dict[str, Any]:
    """Synthesize a STAR-format rewrite with strong power verbs and quantified impact."""
    cleaned = clean_bullet_text(bullet_text)
    lower = cleaned.lower()

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

    verb = matched_transform["verbs"][index % len(matched_transform["verbs"])]
    core_action = cleaned
    if core_action and core_action[0].isupper():
        core_action = core_action[0].lower() + core_action[1:]

    # Remove trailing period if present
    core_action = core_action.rstrip(".")

    metric = matched_transform["metric"]
    rewritten = f"{verb} {core_action}, {metric}."

    explanation = (
        f"Replaced passive phrasing with the active leadership verb '{verb}' "
        f"and added STAR-format quantified impact placeholders."
    )

    return {
        "original": bullet_text,
        "rewritten": rewritten,
        "explanation": explanation
    }

def suggest_rewrites(flagged_bullets: List[Dict[str, Any]], resume_context: str = "") -> List[Dict[str, Any]]:
    """
    Generate STAR rewrite suggestions for flagged weak or unquantified bullets.
    100% local synthesis.
    """
    if not flagged_bullets:
        return []

    rewrites = []
    for i, bullet in enumerate(flagged_bullets):
        text = bullet.get("text", "") if isinstance(bullet, dict) else str(bullet)
        if text:
            suggestion = synthesize_star_bullet(text, index=i)
            rewrites.append(suggestion)

    return rewrites
