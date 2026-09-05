"""
ResumeIQ — Tailoring Pipeline Route (Local ML/DL Only)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import logging

from ..middleware.auth import get_current_user_optional
from ..services.parsing.section_extractor import extract_sections
from ..services.ml.tailor_engine import generate_tailored_resume
from ..services.ml.cover_letter_gen import generate_cover_letter
from ..services.ml.interview_predictor import predict_interview_questions
from ..services.ml.semantic_matcher import semantic_match_score

router = APIRouter(prefix="", tags=["Tailoring"])

class TailorRequest(BaseModel):
    resume_text: str
    jd_text: str

@router.post("/tailor")
@router.post("/v1/tailor")
def tailor_resume(
    payload: TailorRequest,
    user = Depends(get_current_user_optional)
):
    if not payload.resume_text or not payload.jd_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both resume_text and jd_text are required."
        )

    try:
        resume_text = payload.resume_text.strip()
        jd_text = payload.jd_text.strip()

        # Parse sections
        sections = extract_sections(resume_text)
        parsed_json = {"sections": sections}

        # Run local ML pipelines
        tailor_result = generate_tailored_resume(resume_text, jd_text, parsed_json)
        cover_letter_result = generate_cover_letter(resume_text, jd_text, parsed_json)
        questions_result = predict_interview_questions(resume_text, parsed_json)
        match_result = semantic_match_score(resume_text, jd_text)

        # Aggregate results
        return {
            "tailored_resume": tailor_result,
            "cover_letter": cover_letter_result.get("text", ""),
            "ats_score": match_result.get("score", 0),
            "ats_feedback": "\n".join(match_result.get("insights", [])),
            "interview_questions": [
                {
                    "question": q,
                    "context": "Identified from your existing skills and experience gaps.",
                    "suggested_approach": "Use the STAR method to structure your answer."
                } for q in questions_result.get("questions", [])
            ]
        }
    except Exception as e:
        logging.error(f"Tailoring pipeline failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run the local ML tailoring pipeline."
        )
