"""
ResumeIQ — Groq Adapter with Deterministic Offline Fallbacks
Provides server-side Groq LLaMA 3.3 70B inference for tailoring advice,
intelligent STAR rewrites, interview questions, and cover letter synthesis.
Falls back automatically to local deterministic engines when no API key is provided
or when the service is unreachable.
"""

import json
import logging
from typing import List, Dict, Any, Optional
import httpx

from ...config import settings

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
logger = logging.getLogger("resumeiq.groq")


def _call_groq_chat(messages: List[Dict[str, str]], max_tokens: int = 1200, temperature: float = 0.2) -> Optional[str]:
    """Internal helper to call Groq Chat Completion API."""
    if not settings.GROQ_API_KEY:
        return None

    try:
        with httpx.Client(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
            response = client.post(
                GROQ_ENDPOINT,
                headers={
                    "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.GROQ_MODEL,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "messages": messages,
                },
            )
            response.raise_for_status()
            body = response.json()
            return body["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        logger.warning(f"Groq API call failed, falling back to local engine: {exc}")
        return None


def generate_tailoring_advice(resume_text: str, jd_text: str) -> dict:
    """Ask Groq for concise tailoring guidance when configured."""
    if not settings.GROQ_API_KEY:
        return {"available": False, "provider": "local", "text": ""}

    prompt = (
        "Review this resume against the job description. Return concise, factual guidance "
        "with three sections: strongest matches, missing evidence, and five suggested "
        "edits. Never invent employers, dates, metrics, or skills.\n\n"
        f"RESUME:\n{resume_text[:12000]}\n\nJOB DESCRIPTION:\n{jd_text[:12000]}"
    )
    content = _call_groq_chat([
        {"role": "system", "content": "You are a precise resume editor."},
        {"role": "user", "content": prompt},
    ], max_tokens=1200)

    if content:
        return {"available": True, "provider": "groq", "model": settings.GROQ_MODEL, "text": content}
    return {"available": False, "provider": "local", "text": ""}


def generate_star_rewrites_groq(bullets: List[str], resume_context: str = "") -> Dict[str, Any]:
    """Generate high-impact STAR rewrites with filled realistic metrics via Groq LLaMA 3.3 70B."""
    if not settings.GROQ_API_KEY or not bullets:
        return {"available": False, "rewrites": []}

    bullets_formatted = "\n".join([f"- {b}" for b in bullets[:5]])
    prompt = (
        "You are an elite technical resume strategist. Rewrite each of the following resume bullet points "
        "into a compelling, high-impact STAR format (Situation, Task, Action, Result) statement.\n\n"
        "Guidelines:\n"
        "1. Start each rewritten bullet with a strong executive action verb (e.g., Engineered, Spearheaded, Architected, Automated).\n"
        "2. Do NOT duplicate verbs or start with weak phrasing.\n"
        "3. Provide realistic, contextual quantified impact (e.g. latency, scale, user count, %, or time saved) — do NOT leave placeholders like [X%] or [Y hours].\n"
        "4. Return ONLY a valid JSON array of objects with keys: 'original', 'rewritten', and 'explanation'.\n\n"
        f"Bullets to rewrite:\n{bullets_formatted}\n\n"
        f"Resume Context (if helpful):\n{resume_context[:2000]}"
    )

    content = _call_groq_chat([
        {"role": "system", "content": "You are a professional technical resume writer who outputs strict JSON."},
        {"role": "user", "content": prompt},
    ], max_tokens=1500, temperature=0.3)

    if not content:
        return {"available": False, "rewrites": []}

    try:
        # Strip markdown fences if present
        clean_json = content
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
        parsed = json.loads(clean_json)
        if isinstance(parsed, list) and len(parsed) > 0:
            return {"available": True, "provider": "groq", "rewrites": parsed}
    except Exception as e:
        logger.warning(f"Failed to parse Groq STAR rewrite JSON: {e}")

    return {"available": False, "rewrites": []}


def generate_interview_questions_groq(resume_text: str, parsed_json: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Generate interview questions tailored to candidate's background via Groq LLaMA 3.3 70B."""
    if not settings.GROQ_API_KEY:
        return {"available": False, "questions": []}

    prompt = (
        "Analyze this resume and generate 6 targeted interview questions "
        "(a mix of behavioral STAR, technical architecture, and system design/problem-solving) "
        "grounded directly in the candidate's actual projects, technologies, and achievements.\n\n"
        "Return ONLY a valid JSON array of objects with keys:\n"
        "- 'type': 'behavioral' | 'technical' | 'situational'\n"
        "- 'question': the interview question text\n"
        "- 'context': which specific bullet or skill from the resume this probes\n"
        "- 'tip': actionable guidance for how the candidate should structure their answer\n\n"
        f"RESUME:\n{resume_text[:6000]}"
    )

    content = _call_groq_chat([
        {"role": "system", "content": "You are an engineering hiring manager who outputs strict JSON."},
        {"role": "user", "content": prompt},
    ], max_tokens=1400, temperature=0.3)

    if not content:
        return {"available": False, "questions": []}

    try:
        clean_json = content
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
        parsed = json.loads(clean_json)
        if isinstance(parsed, list) and len(parsed) > 0:
            return {"available": True, "provider": "groq", "questions": parsed}
    except Exception as e:
        logger.warning(f"Failed to parse Groq interview questions JSON: {e}")

    return {"available": False, "questions": []}


def generate_cover_letter_groq(resume_text: str, jd_text: str, candidate_name: str = "Candidate") -> Dict[str, Any]:
    """Generate a high-impact, tailored cover letter via Groq LLaMA 3.3 70B."""
    if not settings.GROQ_API_KEY:
        return {"available": False, "text": ""}

    prompt = (
        f"Write an articulate, compelling, 3-paragraph cover letter for {candidate_name} applying for the position "
        "described in the job description, grounded strictly in the achievements and skills from the resume.\n"
        "Never invent fake credentials or dates. Align technical terminology and achievements.\n\n"
        f"RESUME:\n{resume_text[:6000]}\n\n"
        f"JOB DESCRIPTION:\n{jd_text[:6000]}"
    )

    content = _call_groq_chat([
        {"role": "system", "content": "You are an executive career coach and cover letter specialist."},
        {"role": "user", "content": prompt},
    ], max_tokens=1000, temperature=0.4)

    if not content:
        return {"available": False, "text": ""}

    return {
        "available": True,
        "provider": "groq",
        "text": content,
        "wordCount": len(content.split()),
    }
