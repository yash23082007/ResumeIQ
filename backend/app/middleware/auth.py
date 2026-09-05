"""
ResumeIQ — Authentication Middleware & JWT Utilities
Handles password hashing, token creation, session cookie parsing, and auth dependencies.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Request, HTTPException, Depends, status
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db, User

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_token(user_id: str) -> str:
    """Generate a signed JWT token for user authentication."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> Optional[str]:
    """Decode JWT token and return user ID if valid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

def get_token_from_request(request: Request) -> Optional[str]:
    """Extract token from Authorization header or HttpOnly session cookie."""
    # 1. Check Authorization Bearer header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    
    # 2. Check HttpOnly cookie
    cookie_token = request.cookies.get("resumeiq_session")
    if cookie_token:
        return cookie_token.strip()

    return None

def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Dependency: Extract current authenticated user or raise 401."""
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
        )
    
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please sign in again.",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
        )
    
    return user

def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Dependency: Extract current authenticated user or return None if unauthenticated."""
    token = get_token_from_request(request)
    if not token:
        return None
    
    user_id = decode_token(token)
    if not user_id:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user

def set_auth_cookie(response, token: str):
    """Set secure session cookie on response."""
    max_age = max(60, 60 * settings.JWT_EXPIRATION_MINUTES)
    response.set_cookie(
        key="resumeiq_session",
        value=token,
        max_age=max_age,
        httponly=True,
        samesite="lax",
        secure=settings.is_prod,
        path="/"
    )

def clear_auth_cookie(response):
    """Clear session cookie on logout."""
    response.delete_cookie(
        key="resumeiq_session",
        path="/",
        httponly=True,
        samesite="lax"
    )
