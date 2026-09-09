"""
ResumeIQ — Authentication Routes (FastAPI)
Register, Login, Session Check, Logout, Account Deletion, Privacy Settings.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from fastapi.responses import StreamingResponse
from io import BytesIO
import json
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from ..database import get_db, User, Resume, JobDescription, Analysis, ResumeDraft
from ..limiter import limiter
from ..middleware.auth import (
    hash_password, verify_password, create_token, get_current_user,
    set_auth_cookie, clear_auth_cookie
)

router = APIRouter(prefix="", tags=["Authentication"])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PrivacyRequest(BaseModel):
    settings: Dict[str, Any]

@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
@router.post("/v1/auth/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(
    request: Request,
    payload: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    email = payload.email.strip().lower()
    password = payload.password

    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered."
        )

    password_hash = hash_password(password)
    user = User(email=email, passwordHash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id)
    set_auth_cookie(response, token)

    return {
        "token": token,
        "user": {"id": user.id, "email": user.email}
    }

@router.post("/auth/login")
@router.post("/v1/auth/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    email = payload.email.strip().lower()
    password = payload.password

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_token(user.id)
    set_auth_cookie(response, token)

    return {
        "token": token,
        "user": {"id": user.id, "email": user.email}
    }

@router.post("/auth/logout")
@router.post("/v1/auth/logout")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Signed out successfully"}

@router.get("/auth/me")
@router.get("/v1/auth/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "privacySettings": user.privacySettings or {}
        }
    }

@router.delete("/auth/account")
@router.delete("/v1/auth/account")
def delete_account(
    response: Response,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(user)
    db.commit()
    clear_auth_cookie(response)
    return {"message": "Account permanently deleted."}

@router.patch("/auth/privacy")
@router.patch("/v1/auth/privacy")
def update_privacy(
    payload: PrivacyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user.privacySettings = payload.settings
    db.commit()
    return {"status": "success", "privacySettings": user.privacySettings}

@router.get("/auth/export")
@router.get("/v1/auth/export")
def export_account_data(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the authenticated user's data as a portable JSON archive."""
    resumes = db.query(Resume).filter(Resume.userId == user.id).all()
    jobs = db.query(JobDescription).filter(JobDescription.userId == user.id).all()
    drafts = db.query(ResumeDraft).filter(ResumeDraft.userId == user.id).all()
    resume_ids = [resume.id for resume in resumes]
    analyses = db.query(Analysis).filter(Analysis.resumeId.in_(resume_ids)).all() if resume_ids else []

    archive = {
        "exportedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "user": {"id": user.id, "email": user.email, "privacySettings": user.privacySettings or {}},
        "resumes": [{"id": r.id, "fileName": r.fileName, "label": r.label, "rawText": r.rawText, "parsedJson": r.parsedJson} for r in resumes],
        "jobDescriptions": [{"id": j.id, "title": j.title, "company": j.company, "rawText": j.rawText} for j in jobs],
        "drafts": [{"id": d.id, "title": d.title, "templateId": d.templateId, "sections": d.sections or []} for d in drafts],
        "analyses": [{"id": a.id, "resumeId": a.resumeId, "status": a.status, "overallScore": a.overallScore, "subScores": a.subScores, "findings": a.findings} for a in analyses],
    }
    content = json.dumps(archive, ensure_ascii=True, indent=2).encode("utf-8")
    return StreamingResponse(
        BytesIO(content),
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="resumeiq-data.json"'},
    )
