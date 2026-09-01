"""
ResumeIQ — Section Extractor (Python NLP)
Segments resume text into canonical sections:
contact, summary, experience, education, skills, certifications, projects, etc.
"""

import re
from typing import Dict, Any, List, Optional, Tuple

SECTION_PATTERNS = {
    "contact": re.compile(r"^(contact\s*(info(rmation)?)?|personal\s*(info(rmation)?|details)?)\b(:|\s*$)", re.IGNORECASE),
    "summary": re.compile(r"^(summary|profile|professional\s+profile|objective|about(\s+me)?|professional\s+summary|career\s+summary|executive\s+summary|overview)\b(:|\s*$)", re.IGNORECASE),
    "experience": re.compile(r"^(work\s*experience|experience|employment(\s+history)?|work\s+history|professional\s+experience|career\s+history)\b(:|\s*$|\s*[-–—])", re.IGNORECASE),
    "education": re.compile(r"^(education|academic(\s+background|\s+history)?|qualifications|degrees?|schooling)\b(:|\s*$)", re.IGNORECASE),
    "skills": re.compile(r"^(skills|technical\s+skills|core\s+competencies|competencies|technologies|tech\s+stack|tools(\s*(&|\+)\s*technologies)?)\b(:|\s*$)", re.IGNORECASE),
    "certifications": re.compile(r"^(certifications?|licenses?|accreditations?|credentials)\b(:|\s*$)", re.IGNORECASE),
    "projects": re.compile(r"^(projects|personal\s+projects|key\s+projects|portfolio|selected\s+projects)\b(:|\s*$)", re.IGNORECASE),
    "awards": re.compile(r"^(awards?|honors?|achievements?|accomplishments?|recognition)\b(:|\s*$)", re.IGNORECASE),
    "publications": re.compile(r"^(publications?|papers?|research)\b(:|\s*$)", re.IGNORECASE),
    "volunteer": re.compile(r"^(volunteer(ing)?|community\s+service|extracurricular)\b(:|\s*$)", re.IGNORECASE),
    "languages": re.compile(r"^(languages?|language\s+skills)\b(:|\s*$)", re.IGNORECASE),
    "interests": re.compile(r"^(interests?|hobbies)\b(:|\s*$)", re.IGNORECASE),
    "references": re.compile(r"^(references?)\b(:|\s*$)", re.IGNORECASE),
}

BULLET_REGEX = re.compile(r"^\s*[•●■◆▪→\-*]\s+(.+)")

def extract_bullets(lines: List[str]) -> List[str]:
    """Extract bullet points from a list of text lines."""
    bullets = []
    for line in lines:
        match = BULLET_REGEX.match(line)
        if match:
            bullets.append(match.group(1).strip())
    return bullets

def extract_contact_info(text: str) -> Dict[str, Any]:
    """Extract contact information (emails, phones, LinkedIn, GitHub, URLs, name)."""
    email_regex = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
    phone_regex = re.compile(r"(\+?\d[\d\s\-().]{7,}\d)")
    linkedin_regex = re.compile(r"linkedin\.com/in/[\w-]+", re.IGNORECASE)
    github_regex = re.compile(r"github\.com/[\w-]+", re.IGNORECASE)
    url_regex = re.compile(r"https?://[^\s,]+", re.IGNORECASE)

    emails = email_regex.findall(text)
    phones = [p.strip() for p in phone_regex.findall(text)]
    linkedin = linkedin_regex.findall(text)
    github = github_regex.findall(text)
    raw_urls = url_regex.findall(text)
    urls = [u for u in raw_urls if "linkedin" not in u.lower() and "github" not in u.lower()]

    # Extract name (first non-empty line without special symbols or emails)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    first_name_candidate = None
    for line in lines:
        if len(line) < 60 and not re.search(r"[@()\d+\-.]", line):
            first_name_candidate = line
            break

    return {
        "name": first_name_candidate,
        "emails": emails,
        "phones": phones,
        "linkedin": linkedin,
        "github": github,
        "urls": urls,
    }

def detect_section_header(line: str) -> Optional[Tuple[str, Optional[str]]]:
    """Detect if a single line is a section header."""
    cleaned = re.sub(r"^[─━═\-_*#|:]+\s*", "", line)
    cleaned = re.sub(r"\s*[─━═\-_*#|:]+$", "", cleaned)
    cleaned = re.sub(r"^\d+\.\s*", "", cleaned).strip()

    if not cleaned or len(cleaned) > 100:
        return None

    colon_idx = cleaned.find(":")
    heading_candidate = cleaned[:colon_idx].strip() if (colon_idx != -1 and colon_idx < 30) else cleaned
    inline_content = cleaned[colon_idx + 1:].strip() if (colon_idx != -1 and colon_idx < 30) else None

    # Never match long descriptive sentences without a colon
    if len(cleaned.split()) > 6 and colon_idx == -1:
        return None

    for section, pattern in SECTION_PATTERNS.items():
        if pattern.search(heading_candidate) or pattern.search(cleaned):
            return section, inline_content

    # Heuristic: short ALL-CAPS line (<35 chars, <=4 words) that isn't a bullet
    if len(cleaned) < 35 and len(cleaned.split()) <= 4 and cleaned.isupper() and not BULLET_REGEX.match(cleaned):
        lower = cleaned.lower()
        for section, pattern in SECTION_PATTERNS.items():
            if pattern.search(lower):
                return section, None

    return None

def extract_sections(raw_text: str) -> Dict[str, Any]:
    """Extract structured sections map from raw resume text."""
    lines = raw_text.split("\n")
    sections: Dict[str, Any] = {}
    current_section = "header"
    current_content: List[str] = []
    current_heading = ""
    section_start_line = 0

    def save_current(end_line: int):
        nonlocal current_content, current_section, current_heading, section_start_line
        content = "\n".join(current_content).strip()
        bullets = extract_bullets(current_content)

        if current_section in sections and current_section != "header":
            sections[current_section]["content"] += f"\n\n{content}"
            sections[current_section]["bullets"].extend(bullets)
            sections[current_section]["endLine"] = end_line
        else:
            sections[current_section] = {
                "heading": current_heading or current_section,
                "content": content,
                "bullets": bullets,
                "startLine": section_start_line,
                "endLine": end_line,
            }

    for i, line in enumerate(lines):
        trimmed = line.strip()
        if not trimmed:
            current_content.append(line)
            continue

        header_detection = detect_section_header(trimmed)
        if header_detection:
            sec_name, inline_text = header_detection
            if current_content or current_section == "header":
                save_current(i - 1)

            current_section = sec_name
            current_heading = trimmed
            current_content = [inline_text] if inline_text else []
            section_start_line = i
        else:
            current_content.append(line)

    if current_content:
        save_current(len(lines) - 1)

    if "header" in sections:
        contact_info = extract_contact_info(sections["header"]["content"])
        sections["contact"] = {
            **contact_info,
            "startLine": sections["header"]["startLine"],
            "endLine": sections["header"]["endLine"],
        }

    return sections
