"""
ResumeIQ — Resume Management & Analysis Routes (FastAPI)
Upload (PDF, DOCX, TXT), List, Version History, Analysis Dispatch, Heatmap, ATS Sim, Interview Qs, Tailoring.
"""

import os
import uuid
from typing import Optional, List
from fastapi import (
    APIRouter, Depends, HTTPException, UploadFile, File, Form,
    BackgroundTasks, status
)
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db, User, Resume, JobDescription, Analysis
from ..middleware.auth import get_current_user
from ..services.parsing.parser import parse_resume_file
from ..services.analysis.heatmap import build_heatmap
from ..services.analysis.ats_checker import simulate_ats
from ..services.ml.interview_predictor import predict_interview_questions
from ..services.ml.tailor_engine import generate_tailored_resume
from ..services.scoring.score_engine import run_analysis_job

router = APIRouter(prefix="", tags=["Resumes"])

class AnalyzeRequest(BaseModel):
    jobDescriptionId: Optional[str] = None

@router.post("/resumes", status_code=status.HTTP_201_CREATED)
@router.post("/v1/resumes", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    label: Optional[str] = Form(None),
    parentResumeId: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded. Please attach a PDF, DOCX, or TXT document."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Only PDF, DOCX, and TXT are supported."
        )

    # Save file to disk
    stored_filename = f"{uuid.uuid4()}{ext}"
    saved_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowable limit (10MB)."
        )

    with open(saved_path, "wb") as f:
        f.write(content)

    # Parse file
    try:
        parsed = parse_resume_file(saved_path, file.filename)
    except Exception as parse_err:
        if os.path.exists(saved_path):
            os.remove(saved_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(parse_err) or "Failed to parse resume document."
        )

    version_group_id = str(uuid.uuid4())
    version = 1

    if parentResumeId:
        parent = db.query(Resume).filter(Resume.id == parentResumeId, Resume.userId == user.id).first()
        if parent:
            version_group_id = parent.versionGroupId or parent.id
            version_count = db.query(Resume).filter(
                Resume.userId == user.id,
                Resume.versionGroupId == version_group_id
            ).count()
            version = version_count + 1

    resume = Resume(
        userId=user.id,
        fileName=file.filename,
        filePath=stored_filename,
        rawText=parsed["rawText"],
        parsedJson=parsed["structured"],
        version=version,
        versionGroupId=version_group_id,
        label=label,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    sections_found = list((parsed["structured"].get("sections") or {}).keys())

    return {
        "id": resume.id,
        "fileName": resume.fileName,
        "version": resume.version,
        "versionGroupId": resume.versionGroupId,
        "label": resume.label,
        "sections": sections_found,
        "createdAt": resume.createdAt.isoformat() if resume.createdAt else None,
    }

@router.get("/resumes")
@router.get("/v1/resumes")
def list_resumes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(Resume.userId == user.id).order_by(Resume.createdAt.desc()).all()
    results = []

    for r in resumes:
        latest_analysis = (
            db.query(Analysis)
            .filter(Analysis.resumeId == r.id)
            .order_by(Analysis.createdAt.desc())
            .first()
        )

        results.append({
            "id": r.id,
            "fileName": r.fileName,
            "version": r.version,
            "versionGroupId": r.versionGroupId,
            "label": r.label,
            "createdAt": r.createdAt.isoformat() if r.createdAt else None,
            "latestScore": latest_analysis.overallScore if latest_analysis else None,
            "latestStatus": latest_analysis.status if latest_analysis else None,
            "subScores": latest_analysis.subScores if latest_analysis else None,
            "latestAnalysis": {
                "id": latest_analysis.id,
                "status": latest_analysis.status,
                "score": latest_analysis.overallScore,
                "subScores": latest_analysis.subScores,
            } if latest_analysis else None,
            "analyses": [
                {
                    "id": a.id,
                    "overallScore": a.overallScore,
                    "subScores": a.subScores,
                    "status": a.status,
                    "createdAt": a.createdAt.isoformat() if a.createdAt else None
                }
                for a in r.analyses
            ] if r.analyses else []
        })

    return results

@router.get("/resumes/{resume_id}")
@router.get("/v1/resumes/{resume_id}")
def get_resume(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    analyses = (
        db.query(Analysis)
        .filter(Analysis.resumeId == resume.id)
        .order_by(Analysis.createdAt.desc())
        .all()
    )

    return {
        "id": resume.id,
        "fileName": resume.fileName,
        "filePath": resume.filePath,
        "rawText": resume.rawText,
        "parsedJson": resume.parsedJson,
        "version": resume.version,
        "versionGroupId": resume.versionGroupId,
        "label": resume.label,
        "createdAt": resume.createdAt.isoformat() if resume.createdAt else None,
        "analyses": [
            {
                "id": a.id,
                "overallScore": a.overallScore,
                "subScores": a.subScores,
                "status": a.status,
                "findings": a.findings,
                "createdAt": a.createdAt.isoformat() if a.createdAt else None
            }
            for a in analyses
        ]
    }

@router.delete("/resumes/{resume_id}")
@router.delete("/v1/resumes/{resume_id}")
def delete_resume(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    # Remove physical file if present
    file_full_path = os.path.join(settings.UPLOAD_DIR, resume.filePath)
    if os.path.exists(file_full_path):
        try:
            os.remove(file_full_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()

    return {"message": "Resume deleted successfully", "id": resume_id}

@router.get("/resumes/{resume_id}/versions")
@router.get("/v1/resumes/{resume_id}/versions")
def get_resume_versions(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    if not current:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    group_id = current.versionGroupId or current.id
    versions = (
        db.query(Resume)
        .filter(Resume.userId == user.id, Resume.versionGroupId == group_id)
        .order_by(Resume.version.desc())
        .all()
    )

    results = []
    for v in versions:
        latest = (
            db.query(Analysis)
            .filter(Analysis.resumeId == v.id)
            .order_by(Analysis.createdAt.desc())
            .first()
        )
        results.append({
            "id": v.id,
            "version": v.version,
            "versionGroupId": v.versionGroupId,
            "label": v.label,
            "fileName": v.fileName,
            "createdAt": v.createdAt.isoformat() if v.createdAt else None,
            "latestScore": latest.overallScore if latest else None,
            "subScores": latest.subScores if latest else None,
        })

    return results

@router.post("/resumes/{resume_id}/analyze", status_code=status.HTTP_202_ACCEPTED)
@router.post("/v1/resumes/{resume_id}/analyze", status_code=status.HTTP_202_ACCEPTED)
def analyze_resume(
    resume_id: str,
    payload: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found or unauthorized.")

    jd_id = payload.jobDescriptionId
    if jd_id:
        jd = db.query(JobDescription).filter(JobDescription.id == jd_id, JobDescription.userId == user.id).first()
        if not jd:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: Specified Job Description does not exist or does not belong to you."
            )

    analysis = Analysis(
        resumeId=resume.id,
        jobDescriptionId=jd_id,
        status="queued"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Run analysis in background or synchronously
    background_tasks.add_task(run_analysis_job, analysis.id, resume.id, jd_id, user.id)

    return {
        "analysisId": analysis.id,
        "status": "queued",
        "message": "Analysis initiated. Poll GET /api/analyses/{id} for results.",
    }

@router.get("/resumes/{resume_id}/heatmap")
@router.get("/v1/resumes/{resume_id}/heatmap")
def get_resume_heatmap(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    return build_heatmap(resume.parsedJson)

@router.get("/resumes/{resume_id}/ats-simulation")
@router.get("/v1/resumes/{resume_id}/ats-simulation")
def get_resume_ats_simulation(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    return simulate_ats(resume.parsedJson)

@router.get("/resumes/{resume_id}/interview-questions")
@router.get("/v1/resumes/{resume_id}/interview-questions")
def get_resume_interview_questions(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.userId == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    return predict_interview_questions(resume.rawText, resume.parsedJson)

@router.post("/resumes/{resume_id}/tailor/{jd_id}")
@router.post("/v1/resumes/{resume_id}/tailor/{jd_id}")
def tailor_resume(
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
            detail="Resume or Job Description not found or unauthorized."
        )

    return generate_tailored_resume(resume.rawText, jd.rawText, resume.parsedJson)
