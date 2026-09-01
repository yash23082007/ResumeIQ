"""
ResumeIQ — Interview Question Predictor (Local NLP Engine)
Generates tailored behavioral (STAR), technical probing, and situational interview questions
grounded directly in the candidate's parsed resume content and skills.
100% offline, zero external API keys.
"""

from typing import Dict, Any, List

def predict_interview_questions(resume_text: str, parsed_json: Dict[str, Any] = None) -> Dict[str, List[Dict[str, str]]]:
    """Generate grounded interview questions based on resume content, skills, and experience."""
    sections = (parsed_json or {}).get("sections", {}) or {}
    questions: List[Dict[str, str]] = []

    # 1. Experience-grounded questions
    exp_section = sections.get("experience", {})
    bullets = exp_section.get("bullets", []) if isinstance(exp_section, dict) else []
    
    if bullets:
        # Use first bullet for project challenge
        b1 = bullets[0]
        questions.append({
            "type": "behavioral",
            "question": f"In your experience, you mentioned '{b1[:100]}...'. Can you walk me through the key technical obstacles you faced and how you overcame them?",
            "context": "Work experience achievement",
            "tip": "Use the STAR method (Situation, Task, Action, Result). Emphasize your personal contribution and trade-off decisions.",
        })
        if len(bullets) > 1:
            b2 = bullets[1]
            questions.append({
                "type": "technical",
                "question": f"Regarding your work on '{b2[:100]}...', what architecture or methodology did you select and what were the alternatives considered?",
                "context": "System design and implementation",
                "tip": "Explain system trade-offs, scalability considerations, and metrics used to evaluate success.",
            })
    else:
        questions.append({
            "type": "behavioral",
            "question": "Tell me about a complex project you worked on recently. What was your role and what measurable outcome was achieved?",
            "context": "Professional experience",
            "tip": "Frame your answer with the STAR format: highlight the Situation, Task, Action, and quantified Result.",
        })

    # 2. Skills-grounded questions
    skills_sec = sections.get("skills", {})
    skills_content = skills_sec.get("content", "") if isinstance(skills_sec, dict) else ""
    if not skills_content and resume_text:
        # extract words from skills if present
        skills_content = resume_text

    lower_text = (skills_content + " " + resume_text).lower()

    if any(k in lower_text for k in ["react", "next", "vue", "frontend", "typescript", "javascript"]):
        questions.append({
            "type": "technical",
            "question": "How do you optimize state management, component re-rendering, and page load performance in modern web applications?",
            "context": "Frontend & JavaScript stack",
            "tip": "Discuss memoization, code splitting, virtual DOM/server components, and Core Web Vitals profiling.",
        })

    if any(k in lower_text for k in ["python", "fastapi", "django", "node", "backend", "api", "rest"]):
        questions.append({
            "type": "technical",
            "question": "How do you design scalable RESTful/gRPC APIs with proper authentication, rate limiting, and database query optimization?",
            "context": "Backend & API engineering",
            "tip": "Cover indexing, connection pooling, async concurrency, idempotency, and defense-in-depth security.",
        })

    if any(k in lower_text for k in ["sql", "postgres", "mongodb", "database", "redis"]):
        questions.append({
            "type": "technical",
            "question": "Describe a scenario where a database query or schema bottlenecked system performance. How did you diagnose and resolve it?",
            "context": "Database & Data Layer",
            "tip": "Discuss EXPLAIN ANALYZE, indexing strategies, caching layers, and schema normalization trade-offs.",
        })

    if any(k in lower_text for k in ["docker", "k8s", "kubernetes", "aws", "gcp", "ci/cd", "devops"]):
        questions.append({
            "type": "technical",
            "question": "Walk me through your end-to-end CI/CD and container orchestration strategy for zero-downtime production deployments.",
            "context": "DevOps & Cloud Infrastructure",
            "tip": "Highlight automated canary/blue-green deployments, health probes, rollback mechanisms, and secret management.",
        })

    # 3. Collaboration, Conflict & Leadership
    questions.append({
        "type": "behavioral",
        "question": "Describe a situation where you had a strong technical disagreement with a team member or stakeholder. How did you navigate the discussion to reach consensus?",
        "context": "Cross-functional collaboration",
        "tip": "Focus on data-driven reasoning, active listening, psychological safety, and aligning on product goals.",
    })

    # 4. Situational & Career
    questions.append({
        "type": "situational",
        "question": "If you inherited a legacy codebase with minimal documentation and tight deadlines, how would you prioritize refactoring versus delivering new features?",
        "context": "Engineering judgment & prioritization",
        "tip": "Demonstrate pragmatic balance: introduce automated safety tests first, decouple critical paths iteratively, and communicate risks.",
    })

    questions.append({
        "type": "situational",
        "question": "Where do you see yourself technically and professionally in the next 2-3 years, and how does this role fit your career trajectory?",
        "context": "Long-term vision & motivation",
        "tip": "Align your personal growth goals with the team's engineering challenges and business impact.",
    })

    return {"questions": questions}
