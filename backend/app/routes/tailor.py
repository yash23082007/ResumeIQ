"""
ResumeIQ — Tailoring Pipeline Route
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import logging

from ..middleware.auth import get_current_user, get_current_user_optional
from ..services.tailoring.crew import run_tailoring_pipeline

router = APIRouter(prefix="", tags=["Tailoring"])

class TailorRequest(BaseModel):
    resume_text: str
    jd_text: str

@router.post("/tailor")
@router.post("/v1/tailor")
def tailor_resume(
    payload: TailorRequest,
    # Optional auth if we want to allow guests to try it, or enforce get_current_user
    user = Depends(get_current_user_optional)
):
    if not payload.resume_text or not payload.jd_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both resume_text and jd_text are required."
        )

    try:
        # Run the crew AI pipeline synchronously (could be slow, consider background task in prod)
        result = run_tailoring_pipeline(
            resume_text=payload.resume_text.strip(),
            jd_text=payload.jd_text.strip()
        )
        return result
    except Exception as e:
        logging.error(f"Tailoring pipeline failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run the tailoring pipeline."
        )
