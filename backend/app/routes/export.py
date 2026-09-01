"""
ResumeIQ — Export & Sharing Routes (FastAPI)
"""

from datetime import datetime, timedelta, timezone
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db, User, ResumeDraft, ReviewLink
from ..middleware.auth import get_current_user

router = APIRouter(prefix="", tags=["Export & Share"])

class ShareRequest(BaseModel):
    expiresInHours: int = 24

class ExportRequest(BaseModel):
    draftId: str

@router.post("/export/pdf")
@router.post("/v1/export/pdf")
def export_pdf(payload: ExportRequest, user: User = Depends(get_current_user)):
    return {
        "status": "info",
        "message": "Please use frontend PDF generator / print dialog for client-side pixel-perfect export."
    }

@router.post("/export/docx")
@router.post("/v1/export/docx")
def export_docx(payload: ExportRequest, user: User = Depends(get_current_user)):
    return {
        "status": "info",
        "message": "DOCX export initiated."
    }

@router.post("/share/resume/{resume_id}", status_code=status.HTTP_201_CREATED)
@router.post("/v1/share/resume/{resume_id}", status_code=status.HTTP_201_CREATED)
def create_share_link(
    resume_id: str,
    payload: ShareRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=payload.expiresInHours)

    link = ReviewLink(
        token=token,
        resumeId=resume_id,
        expiresAt=expires_at
    )
    db.add(link)
    db.commit()

    return {
        "status": "success",
        "data": {
            "token": token,
            "expiresAt": expires_at.isoformat()
        }
    }
