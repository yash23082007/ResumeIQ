"""
ResumeIQ — AI Resume Roast Engine (Streaming SSE)
Provides brutal, witty, yet actionable tech recruiter critiques with token streaming.
Uses Groq LLaMA 3.3 70B / gpt-oss streaming when available, with an intelligent
deterministic progressive fallback.
"""

import asyncio
import json
import re
from typing import AsyncGenerator
from .groq_client import stream_groq_chat
from ...config import settings

ROAST_PROMPT_TEMPLATE = """You are a brutally honest, cynical, yet hilarious Silicon Valley Staff Tech Recruiter and hiring manager who has screened 50,000 resumes.
Give a funny, razor-sharp, yet constructive 'Roast' of this candidate's resume.

Break your roast into these 4 distinct markdown sections:
### 1. 🔥 The 3-Second First Glance
Point out buzzword fatigue, cheesy adjectives, cliché objective statements, or formatting sins that make recruiters roll their eyes.

### 2. 📉 The Impact Crime Scene
Call out vague, unquantified bullets, lines that sound like passive job descriptions rather than achievements, or suspiciously rounded numbers.

### 3. 🛠️ Tech Stack Reality Check
Critique their skills section: is it a bloated laundry list where HTML and Kubernetes sit side-by-side? Any dead frameworks or buzzword soup?

### 4. 🏆 The Redemption Verdict
Acknowledge the genuinely strong parts of their experience and give the single highest-leverage rewrite advice that will get them interviews.

Format with crisp Markdown headings and emojis. Be punchy, witty, direct, and under 400 words.

RESUME TEXT:
{resume_text}
"""


def _generate_deterministic_roast(resume_text: str) -> str:
    """Generate a contextual, humorous, and high-signal roast locally."""
    lines = [line.strip() for line in resume_text.split("\n") if line.strip()]
    total_words = len(resume_text.split())
    
    # Analyze buzzwords
    buzzwords = ["synergy", "spearheaded", "passionate", "hardworking", "results-driven", "fast-paced", "dynamic", "team player", "ninja", "guru"]
    found_buzzwords = [b for b in buzzwords if re.search(rf"\b{b}\b", resume_text, re.I)]
    
    # Analyze numbers/metrics
    bullets = [l for l in lines if re.match(r"^[-*•●▪]\s+", l)]
    quantified_bullets = [b for b in bullets if re.search(r"\b(\d+%?|\$\d+|\d+\+)\b", b)]
    quant_ratio = (len(quantified_bullets) / len(bullets)) if bullets else 0.5
    
    # Skills check
    has_k8s = bool(re.search(r"\b(kubernetes|k8s|docker)\b", resume_text, re.I))
    has_html = bool(re.search(r"\b(html|css)\b", resume_text, re.I))
    skills_clash = has_k8s and has_html

    roast_p1 = (
        f"### 1. 🔥 The 3-Second First Glance\n\n"
        f"At {total_words} words, your resume opens like an terms-and-conditions agreement that nobody wants to read. "
    )
    if found_buzzwords:
        roast_p1 += (
            f"You dropped {' and '.join(f'*{w}*' for w in found_buzzwords[:3])} right in the recruiter's path. "
            f"Whenever a recruiter reads *'{found_buzzwords[0]}'* in 2026, a tiny bell rings in an HR dungeon and your resume moves 2 inches closer to the 'Archive' pile."
        )
    else:
        roast_p1 += "The layout is dense enough to shield a spacecraft from solar radiation. Give your margins and line-height some room to breathe before your reviewer gets eye strain."

    roast_p2 = f"\n\n### 2. 📉 The Impact Crime Scene\n\n"
    if quant_ratio < 0.4:
        roast_p2 += (
            f"Only {int(quant_ratio * 100)}% of your bullet points contain an actual measurable number. "
            f"The rest read like a daily chore list. *'Responsible for maintaining servers'* doesn't tell us if you kept Google Cloud running or kept a Raspberry Pi from overheating under your desk. "
            f"Give us dollars saved, latency shaved, or user counts — not job description regurgitations."
        )
    else:
        roast_p2 += (
            f"You've got some numbers in here ({int(quant_ratio * 100)}% quantified), which is a relief. "
            f"But make sure they don't look plucked from thin air. When recruiters see *'improved performance by 40%'* with no baseline, our first question is always: *'40% of what? A 10-second query down to 6 seconds?'*"
        )

    roast_p3 = f"\n\n### 3. 🛠️ Tech Stack Reality Check\n\n"
    if skills_clash:
        roast_p3 += (
            "Listing *HTML/CSS* alongside *Kubernetes* and *Distributed Systems* is the engineering equivalent of listing *'Can hold a fork'* on a Michelin-star chef resume. "
            "We assume you know how a div works. Group your skills by architectural layer (Cloud/Infra, Backend, Data) instead of dumping a 30-item comma salad."
        )
    else:
        roast_p3 += (
            "Your skills list looks like an npm registry audit. Prune the technologies you haven't touched in 18 months; "
            "if an interviewer asks you a deep-dive garbage collection question on a language you listed 6th, you will sweat through your shirt."
        )

    roast_p4 = (
        f"\n\n### 4. 🏆 The Redemption Verdict\n\n"
        f"Beneath the jargon, there is genuine technical muscle here. Your strongest bullet points demonstrate real ownership. "
        f"**The fix:** Cut 20% of the adjective fluff, upgrade every passive bullet into an active STAR statement with a verified metric, "
        f"and you'll instantly jump from the *'maybe'* pile into the first-round screen."
    )

    return roast_p1 + roast_p2 + roast_p3 + roast_p4


async def stream_resume_roast(resume_text: str) -> AsyncGenerator[str, None]:
    """
    Yields SSE formatted data packets:
    data: {"chunk": "text"}
    """
    has_streamed_any = False

    # 1. Try Groq streaming if configured
    if settings.GROQ_API_KEY:
        try:
            messages = [
                {"role": "system", "content": "You are a witty, hilarious, yet deeply insightful tech recruiter roasting resumes."},
                {"role": "user", "content": ROAST_PROMPT_TEMPLATE.format(resume_text=resume_text[:8000])},
            ]
            for token in stream_groq_chat(messages, max_tokens=1000, temperature=0.7):
                if token:
                    has_streamed_any = True
                    payload = json.dumps({"chunk": token})
                    yield f"data: {payload}\n\n"
                    await asyncio.sleep(0.01)
        except Exception:
            has_streamed_any = False

    # 2. If Groq didn't stream (or offline), stream local deterministic roast
    if not has_streamed_any:
        local_text = _generate_deterministic_roast(resume_text)
        # Split into words / punctuation chunks for smooth typewriter feel
        chunks = re.findall(r"\S+\s*", local_text)
        for chunk in chunks:
            payload = json.dumps({"chunk": chunk})
            yield f"data: {payload}\n\n"
            await asyncio.sleep(0.02)

    # End of stream sentinel
    yield "data: [DONE]\n\n"
