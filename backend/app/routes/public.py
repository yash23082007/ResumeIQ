"""
ResumeIQ — Public Tools & Shared Review Link Routes (FastAPI)
No authentication required for public ATS text check and shared links.
"""

from datetime import datetime, timezone
import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db, ReviewLink, Resume
from ..services.analysis.ats_checker import check_ats_compatibility

router = APIRouter(prefix="", tags=["Public"])

class PublicATSCheckRequest(BaseModel):
    text: str

@router.post("/public/ats-check")
@router.post("/v1/public/ats-check")
def public_ats_check(payload: PublicATSCheckRequest):
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text is required.")
    if len(text) > 4000:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Text exceeds maximum limit.")

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    word_count = len(text.split())
    has_experience = any(re.search(r"experience|work history", l, re.IGNORECASE) for l in lines)
    has_education = any(re.search(r"education|degree|university", l, re.IGNORECASE) for l in lines)
    has_skills = any(re.search(r"skills|technologies|tech stack", l, re.IGNORECASE) for l in lines)

    mock_parsed = {
        "layout": {
            "hasMultiColumnTables": False,
            "hasImages": False,
            "hasColumns": False,
            "contactInHeaderFooter": False,
            "pageCount": 1
        },
        "sections": {
            **({"experience": {"content": text, "bullets": []}} if has_experience else {}),
            **({"education": {"content": ""}} if has_education else {}),
            **({"skills": {"content": ""}} if has_skills else {}),
        },
        "wordCount": word_count,
    }

    ats_result = check_ats_compatibility(mock_parsed)

    return {
        "status": "success",
        "data": {
            "issues": ats_result["issues"],
            "score": ats_result["score"],
            "disclaimer": "Heuristic simulation based on documented parser failure modes — not a direct connection to proprietary ATS engines."
        }
    }

@router.get("/public/review/{token}")
@router.get("/v1/public/review/{token}")
def get_shared_review(
    token: str,
    db: Session = Depends(get_db)
):
    link = db.query(ReviewLink).filter(ReviewLink.token == token).first()
    if not link or (link.expiresAt and link.expiresAt.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link is invalid or has expired."
        )

    resume = db.query(Resume).filter(Resume.id == link.resumeId).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared resume not found."
        )

    return {
        "status": "success",
        "data": {
            "resume": {
                "id": resume.id,
                "fileName": resume.fileName,
                "rawText": resume.rawText,
                "parsedJson": resume.parsedJson,
                "createdAt": resume.createdAt.isoformat() if resume.createdAt else None,
            },
            "expiresAt": link.expiresAt.isoformat() if link.expiresAt else None,
        }
    }
