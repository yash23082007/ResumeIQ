"""
ResumeIQ — Job Description, Semantic Matching & Cover Letter Routes (FastAPI)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List

from ..database import get_db, User, JobDescription, Resume
from ..middleware.auth import get_current_user
from ..services.ml.semantic_matcher import semantic_match_score
from ..services.ml.cover_letter_gen import generate_cover_letter

router = APIRouter(prefix="", tags=["Job Descriptions"])

class CreateJDRequest(BaseModel):
    title: Optional[str] = "Untitled Position"
    company: Optional[str] = None
    rawText: str

@router.post("/job-descriptions", status_code=status.HTTP_201_CREATED)
@router.post("/v1/job-descriptions", status_code=status.HTTP_201_CREATED)
def create_job_description(
    payload: CreateJDRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payload.rawText or not payload.rawText.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text is required."
        )

    jd = JobDescription(
        userId=user.id,
        title=payload.title or "Untitled Position",
        company=payload.company,
        rawText=payload.rawText.strip(),
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)

    return {
        "id": jd.id,
        "title": jd.title,
        "company": jd.company,
        "createdAt": jd.createdAt.isoformat() if jd.createdAt else None,
    }

@router.get("/job-descriptions")
@router.get("/v1/job-descriptions")
def list_job_descriptions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    jds = (
        db.query(JobDescription)
        .filter(JobDescription.userId == user.id)
        .order_by(JobDescription.createdAt.desc())
        .all()
    )

    return [
        {
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "createdAt": j.createdAt.isoformat() if j.createdAt else None,
        }
        for j in jds
    ]

@router.delete("/job-descriptions/{jd_id}")
@router.delete("/v1/job-descriptions/{jd_id}")
def delete_job_description(
    jd_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id, JobDescription.userId == user.id).first()
    if not jd:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job description not found.")

    db.delete(jd)
    db.commit()

    return {"message": "Job description deleted successfully", "id": jd_id}

@router.post("/resumes/{resume_id}/match/{jd_id}")
@router.post("/v1/resumes/{resume_id}/match/{jd_id}")
def match_resume_to_jd(
    resume_id: str,
    jd_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id, JobDescription.userId == user.id).first()

    if not resume or not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume or job description not found."
        )

    return semantic_match_score(resume.rawText, jd.rawText)

@router.post("/resumes/{resume_id}/cover-letter/{jd_id}")
@router.post("/v1/resumes/{resume_id}/cover-letter/{jd_id}")
def create_cover_letter(
    resume_id: str,
    jd_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    jd = db.query(JobDescription).filter(JobDescription.id == jd_id, JobDescription.userId == user.id).first()

    if not resume or not jd:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume or job description not found."
        )

    return generate_cover_letter(resume.rawText, jd.rawText, resume.parsedJson)
