"""
ResumeIQ — ATS Compatibility Checker & Multi-Platform Simulator
Scores resume against documented ATS parsing failure modes.
"""

from typing import Dict, Any, List

def check_ats_compatibility(parsed_json: Dict[str, Any]) -> Dict[str, Any]:
    """Check ATS compatibility and return score + prioritized issues list."""
    if not parsed_json:
        return {
            "score": 50,
            "issues": [{
                "category": "parse",
                "message": "Resume could not be fully parsed",
                "severity": "critical",
                "deduction": 50
            }],
            "passed": False
        }

    layout = parsed_json.get("layout", {}) or {}
    sections = parsed_json.get("sections", {}) or {}
    issues: List[Dict[str, Any]] = []
    score = 100

    # 1. Multi-column tables
    if layout.get("hasMultiColumnTables"):
        issues.append({
            "category": "layout",
            "message": "Multi-column tables often parse out of order in ATS systems, scrambling your experience entries.",
            "severity": "high",
            "deduction": 20,
            "suggestion": "Replace tables with simple lists or single-column layout.",
        })
        score -= 20

    # 2. Text embedded in images
    if layout.get("hasImages"):
        issues.append({
            "category": "content",
            "message": "Text embedded in images is invisible to ATS parsers — any skills, titles, or content in images will be lost.",
            "severity": "critical",
            "deduction": 30,
            "suggestion": "Move all text content out of images into regular text.",
        })
        score -= 30

    # 3. Contact info in header/footer
    if layout.get("contactInHeaderFooter"):
        issues.append({
            "category": "structure",
            "message": "Contact information placed in the document header/footer is often dropped by ATS parsers.",
            "severity": "medium",
            "deduction": 10,
            "suggestion": "Move your name, email, and phone number into the main body of the document.",
        })
        score -= 10

    # 4. Standard section headers check
    standard_sections = ["summary", "experience", "education", "skills"]
    found_sections = [s for s in sections.keys() if s not in ["header", "contact"]]
    has_standard_headers = any(s in found_sections for s in standard_sections)

    if not has_standard_headers:
        issues.append({
            "category": "structure",
            "message": "Non-standard section headers (e.g., 'My Journey' instead of 'Experience') confuse ATS parsers.",
            "severity": "medium",
            "deduction": 10,
            "suggestion": "Use standard headers: 'Experience', 'Education', 'Skills', 'Summary'.",
        })
        score -= 10

    # 5. Multi-column layout
    if layout.get("hasColumns"):
        issues.append({
            "category": "layout",
            "message": "Multi-column layouts can cause ATS systems to read content in the wrong order.",
            "severity": "high",
            "deduction": 15,
            "suggestion": "Use a single-column layout for maximum ATS compatibility.",
        })
        score -= 15

    # 6. Missing key sections
    if not sections.get("experience"):
        header_text = (sections.get("header", {}).get("content", "") or "").lower()
        if "experience" not in header_text:
            issues.append({
                "category": "structure",
                "message": "No 'Experience' section detected — this is the most important section for ATS matching.",
                "severity": "high",
                "deduction": 15,
                "suggestion": "Add a clearly labeled 'Experience' or 'Work Experience' section.",
            })
            score -= 15

    if not sections.get("education"):
        issues.append({
            "category": "structure",
            "message": "No 'Education' section detected — many ATS systems require this for automatic screening.",
            "severity": "medium",
            "deduction": 5,
            "suggestion": "Add an 'Education' section, even if brief.",
        })
        score -= 5

    # 7. Word count check
    word_count = parsed_json.get("wordCount", 0)
    if word_count < 150:
        issues.append({
            "category": "content",
            "message": f"Resume is very short ({word_count} words). ATS keyword matching works better with more content.",
            "severity": "medium",
            "deduction": 10,
            "suggestion": "Expand your experience descriptions with specific accomplishments and metrics.",
        })
        score -= 10

    # 8. Page count check
    page_count = layout.get("pageCount", 1)
    if page_count > 2:
        issues.append({
            "category": "formatting",
            "message": f"Resume is {page_count} pages. Most recruiters and ATS systems expect 1-2 pages.",
            "severity": "low",
            "deduction": 5,
            "suggestion": "Condense to 1-2 pages by focusing on your most recent and relevant experience.",
        })
        score -= 5

    final_score = max(score, 0)
    critical_or_high = [i for i in issues if i.get("severity") in ["critical", "high"]]

    return {
        "score": final_score,
        "issues": issues,
        "passed": len(critical_or_high) == 0,
    }

def simulate_ats(parsed_json: Dict[str, Any]) -> Dict[str, Any]:
    """Simulate parsing across common ATS platform families."""
    layout = (parsed_json or {}).get("layout", {}) or {}
    sections = (parsed_json or {}).get("sections", {}) or {}

    ats_profiles = [
        {
            "name": "Workday",
            "type": "Enterprise ATS",
            "strengths": ["Good at PDF text extraction", "Handles standard formatting well"],
            "weaknesses": ["Struggles with multi-column layouts", "Drops header/footer content"],
        },
        {
            "name": "Greenhouse",
            "type": "Modern ATS",
            "strengths": ["Better handling of varied formats", "Good section detection"],
            "weaknesses": ["Can miss content in tables", "Image text not extracted"],
        },
        {
            "name": "Taleo",
            "type": "Legacy ATS",
            "strengths": ["Widely used", "Basic text extraction works"],
            "weaknesses": ["Poor with non-standard layouts", "Limited font support", "Tables frequently scrambled"],
        },
        {
            "name": "iCIMS",
            "type": "Enterprise ATS",
            "strengths": ["Decent PDF parsing", "Standard section recognition"],
            "weaknesses": ["Multi-column issues", "Special characters can cause problems"],
        },
    ]

    results = []
    for ats in ats_profiles:
        issues = []
        parsed_correctly = True

        if layout.get("hasMultiColumnTables") and ats["name"] in ["Taleo", "Workday"]:
            issues.append("Table content may be scrambled or lost")
            parsed_correctly = False

        if layout.get("hasColumns") and ats["name"] == "Taleo":
            issues.append("Multi-column layout likely to cause reading-order issues")
            parsed_correctly = False

        if layout.get("hasImages"):
            issues.append("Image-embedded text will not be extracted")
            parsed_correctly = False

        if layout.get("contactInHeaderFooter") and ats["name"] in ["Workday", "Taleo"]:
            issues.append("Contact info in header/footer may be dropped")
            parsed_correctly = False

        if not sections.get("experience"):
            issues.append("Missing standard 'Experience' section header")
            parsed_correctly = False

        results.append({
            "ats": ats["name"],
            "type": ats["type"],
            "parsedCorrectly": parsed_correctly,
            "issues": issues,
            "confidence": "high" if parsed_correctly else "low",
        })

    pass_count = len([r for r in results if r["parsedCorrectly"]])

    return {
        "summary": f"{pass_count} of {len(results)} simulated ATS systems parsed this resume correctly.",
        "results": results,
        "disclaimer": "Heuristic simulation based on documented parser failure modes, not a direct connection to proprietary ATS internal engines.",
        "recommendation": (
            "Fix the flagged issues to ensure your resume works across all major ATS platforms."
            if pass_count < len(results)
            else "Your resume format is compatible with all tested ATS platforms."
        ),
    }
