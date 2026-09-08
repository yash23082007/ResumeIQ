"""Small, server-side Groq adapter with a deterministic no-key fallback."""

import httpx

from ...config import settings

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"


def generate_tailoring_advice(resume_text: str, jd_text: str) -> dict:
    """Ask Groq for concise tailoring guidance when configured.

    The local pipeline remains the source of truth when no key is configured or
    when the provider is unavailable, so development and tests stay offline.
    """
    if not settings.GROQ_API_KEY:
        return {"available": False, "provider": "local", "text": ""}

    prompt = (
        "Review this resume against the job description. Return concise, factual guidance "
        "with three sections: strongest matches, missing evidence, and five suggested "
        "edits. Never invent employers, dates, metrics, or skills.\n\n"
        f"RESUME:\n{resume_text[:12000]}\n\nJOB DESCRIPTION:\n{jd_text[:12000]}"
    )
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
                    "temperature": 0.2,
                    "max_tokens": 1200,
                    "messages": [
                        {"role": "system", "content": "You are a precise resume editor."},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            response.raise_for_status()
            body = response.json()
            text = body["choices"][0]["message"]["content"].strip()
            return {"available": True, "provider": "groq", "model": settings.GROQ_MODEL, "text": text}
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        return {"available": False, "provider": "local", "text": ""}
