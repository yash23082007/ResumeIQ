"""
ResumeIQ — Contact Form Submission Routes (FastAPI)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db, ContactSubmission

router = APIRouter(prefix="", tags=["Contact"])

class ContactRequest(BaseModel):
    name: Optional[str] = "Anonymous"
    email: EmailStr
    subject: Optional[str] = "General Question"
    message: str

@router.post("/contact", status_code=status.HTTP_201_CREATED)
@router.post("/v1/contact", status_code=status.HTTP_201_CREATED)
def submit_contact(
    payload: ContactRequest,
    db: Session = Depends(get_db)
):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message is required.")

    submission = ContactSubmission(
        name=payload.name or "Anonymous",
        email=payload.email.strip().lower(),
        subject=payload.subject or "General Question",
        message=payload.message.strip(),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "status": "success",
        "message": "Inquiry received successfully. Our team will review it shortly.",
        "submissionId": submission.id,
    }
