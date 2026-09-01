"""
ResumeIQ — Resume Builder Drafts & Autosave Routes (FastAPI)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from ..database import get_db, User, ResumeDraft
from ..middleware.auth import get_current_user

router = APIRouter(prefix="", tags=["Drafts"])

class CreateDraftRequest(BaseModel):
    title: Optional[str] = "Untitled Draft"
    templateId: Optional[str] = "classic"
    templateSettings: Optional[Dict[str, Any]] = None
    sections: Optional[List[Dict[str, Any]]] = None
    roleId: Optional[str] = None
    branchOfVersionId: Optional[str] = None

class UpdateDraftRequest(BaseModel):
    title: Optional[str] = None
    templateId: Optional[str] = None
    templateSettings: Optional[Dict[str, Any]] = None
    sections: Optional[List[Dict[str, Any]]] = None
    roleId: Optional[str] = None

@router.get("/drafts")
@router.get("/v1/drafts")
def list_drafts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    drafts = (
        db.query(ResumeDraft)
        .filter(ResumeDraft.userId == user.id)
        .order_by(ResumeDraft.updatedAt.desc())
        .all()
    )
    return {
        "status": "success",
        "data": [
            {
                "id": d.id,
                "title": d.title,
                "templateId": d.templateId,
                "templateSettings": d.templateSettings or {},
                "sections": d.sections or [],
                "roleId": d.roleId,
                "branchOfVersionId": d.branchOfVersionId,
                "revision": d.revision,
                "createdAt": d.createdAt.isoformat() if d.createdAt else None,
                "updatedAt": d.updatedAt.isoformat() if d.updatedAt else None,
            }
            for d in drafts
        ]
    }

@router.post("/drafts", status_code=status.HTTP_201_CREATED)
@router.post("/v1/drafts", status_code=status.HTTP_201_CREATED)
def create_draft(
    payload: CreateDraftRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    draft = ResumeDraft(
        userId=user.id,
        title=payload.title or "Untitled Draft",
        templateId=payload.templateId or "classic",
        templateSettings=payload.templateSettings or {},
        sections=payload.sections or [],
        roleId=payload.roleId,
        branchOfVersionId=payload.branchOfVersionId,
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)

    return {
        "status": "success",
        "data": {
            "id": draft.id,
            "title": draft.title,
            "templateId": draft.templateId,
            "templateSettings": draft.templateSettings or {},
            "sections": draft.sections or [],
            "roleId": draft.roleId,
            "branchOfVersionId": draft.branchOfVersionId,
            "revision": draft.revision,
            "createdAt": draft.createdAt.isoformat() if draft.createdAt else None,
            "updatedAt": draft.updatedAt.isoformat() if draft.updatedAt else None,
        }
    }

@router.get("/drafts/{draft_id}")
@router.get("/v1/drafts/{draft_id}")
def get_draft(
    draft_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    draft = db.query(ResumeDraft).filter(ResumeDraft.id == draft_id, ResumeDraft.userId == user.id).first()
    if not draft:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found.")

    return {
        "status": "success",
        "data": {
            "id": draft.id,
            "title": draft.title,
            "templateId": draft.templateId,
            "templateSettings": draft.templateSettings or {},
            "sections": draft.sections or [],
            "roleId": draft.roleId,
            "branchOfVersionId": draft.branchOfVersionId,
            "revision": draft.revision,
            "createdAt": draft.createdAt.isoformat() if draft.createdAt else None,
            "updatedAt": draft.updatedAt.isoformat() if draft.updatedAt else None,
        }
    }

@router.patch("/drafts/{draft_id}")
@router.patch("/v1/drafts/{draft_id}")
def update_draft(
    draft_id: str,
    payload: UpdateDraftRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    draft = db.query(ResumeDraft).filter(ResumeDraft.id == draft_id, ResumeDraft.userId == user.id).first()
    if not draft:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found.")

    if payload.title is not None:
        draft.title = payload.title
    if payload.templateId is not None:
        draft.templateId = payload.templateId
    if payload.templateSettings is not None:
        draft.templateSettings = payload.templateSettings
    if payload.sections is not None:
        draft.sections = payload.sections
    if payload.roleId is not None:
        draft.roleId = payload.roleId

    draft.revision += 1
    db.commit()
    db.refresh(draft)

    return {
        "status": "success",
        "data": {
            "id": draft.id,
            "title": draft.title,
            "templateId": draft.templateId,
            "templateSettings": draft.templateSettings or {},
            "sections": draft.sections or [],
            "roleId": draft.roleId,
            "revision": draft.revision,
            "updatedAt": draft.updatedAt.isoformat() if draft.updatedAt else None,
        }
    }
