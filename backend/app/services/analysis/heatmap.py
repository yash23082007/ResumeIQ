"""
ResumeIQ — Attention Heatmap Simulation
Approximates a recruiter's ~6-second F-pattern scan.
Generates heatmap cells from resume section positions and vertical attention decay.
"""

from typing import Dict, Any, List

def build_heatmap(parsed_json: Dict[str, Any]) -> Dict[str, Any]:
    """Build heatmap data from parsed resume structure."""
    if not parsed_json:
        return {
            "cells": [],
            "insights": ["Unable to generate heatmap — resume could not be parsed."]
        }

    sections = parsed_json.get("sections", {}) or {}
    total_lines = parsed_json.get("lineCount", 100) or 100
    cells: List[Dict[str, Any]] = []
    insights: List[str] = []

    section_weights = {
        "contact": 0.7,
        "header": 0.8,
        "summary": 0.95,
        "experience": 0.85,
        "skills": 0.7,
        "education": 0.5,
        "certifications": 0.4,
        "projects": 0.45,
        "awards": 0.35,
        "volunteer": 0.3,
        "publications": 0.3,
        "languages": 0.25,
        "interests": 0.2,
        "references": 0.15,
    }

    for name, section in sections.items():
        if not isinstance(section, dict):
            continue
        start_line = section.get("startLine", None)
        if start_line is None:
            continue

        vertical_pos = start_line / max(total_lines, 1)
        vertical_weight = 1.0 - (vertical_pos * 0.6)  # Top=1.0, Bottom=0.4
        section_weight = section_weights.get(name, 0.3)
        attention = round(max(0.0, min(1.0, vertical_weight * section_weight)) * 100) / 100

        cells.append({
            "section": name,
            "heading": section.get("heading") or name,
            "position": vertical_pos,
            "startLine": start_line,
            "endLine": section.get("endLine", start_line),
            "attention": attention,
            "contentLength": len(section.get("content", "") or ""),
        })

    cells.sort(key=lambda c: c["position"])

    high_attention = [c for c in cells if c["attention"] > 0.7]
    low_attention = [c for c in cells if c["attention"] < 0.3]

    if high_attention:
        zones = ", ".join(c["heading"] for c in high_attention)
        insights.append(f"Your strongest visibility zones: {zones}. Make sure your best content is here.")

    summary_sec = sections.get("summary")
    if isinstance(summary_sec, dict) and summary_sec.get("startLine", 0) > 5:
        insights.append("Your summary/profile section is not at the top — consider moving it up for maximum recruiter attention.")
    elif not summary_sec:
        insights.append("No summary/profile section detected. Adding one at the top significantly increases recruiter engagement in the first 6 seconds.")

    exp_sec = sections.get("experience")
    if isinstance(exp_sec, dict):
        exp_lines = exp_sec.get("endLine", 0) - exp_sec.get("startLine", 0)
        if exp_lines < 10:
            insights.append("Your experience section is short. Recruiters spend the most time here — expand with specific achievements.")

    if low_attention:
        low_zones = ", ".join(c["heading"] for c in low_attention)
        insights.append(f"Low-visibility zones: {low_zones}. If these contain important info, move them higher.")

    return {
        "cells": cells,
        "insights": insights,
    }
