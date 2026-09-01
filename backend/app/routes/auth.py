"""
ResumeIQ — Authentication Routes (FastAPI)
Register, Login, Session Check, Logout, Account Deletion, Privacy Settings.
"""

from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from ..database import get_db, User
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
def register(
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
def login(
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
