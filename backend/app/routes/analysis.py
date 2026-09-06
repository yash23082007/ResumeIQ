"""
ResumeIQ — Analysis Result & Polling Routes (FastAPI)
Fetch analysis findings, poll status, retry failed analyses, and list historical analyses.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from ..database import get_db, User, Analysis, Resume, JobDescription
from ..middleware.auth import get_current_user
from ..services.scoring.score_engine import run_analysis_job, METHODOLOGY_VERSION

router = APIRouter(prefix="", tags=["Analysis"])

@router.get("/analyses/{analysis_id}")
@router.get("/v1/analyses/{analysis_id}")
def get_analysis(
    analysis_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = (
        db.query(Analysis)
        .join(Resume, Analysis.resumeId == Resume.id)
        .filter(Analysis.id == analysis_id)
        .first()
    )

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    if analysis.resume.userId != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    is_terminal = analysis.status in ["completed", "failed", "cancelled"]
    findings = analysis.findings or {}

    progress = None if is_terminal else {"stage": analysis.stage or analysis.status, "percent": analysis.progress or 0}

    return {
        "id": analysis.id,
        "resumeId": analysis.resumeId,
        "resumeName": analysis.resume.fileName,
        "jobTitle": analysis.jobDescription.title if analysis.jobDescription else None,
        "jobCompany": analysis.jobDescription.company if analysis.jobDescription else None,
        "status": analysis.status,
        "overallScore": analysis.overallScore,
        "subScores": analysis.subScores,
        "findings": findings,
        "heatmapData": analysis.heatmapData,
        "methodologyVersion": analysis.methodologyVersion or METHODOLOGY_VERSION,
        "confidence": findings.get("confidence") if isinstance(findings, dict) else None,
        "progress": progress,
        "scoreWarnings": findings.get("scoreWarnings", []) if isinstance(findings, dict) else [],
        "createdAt": analysis.createdAt.isoformat() if analysis.createdAt else None,
        "completedAt": analysis.updatedAt.isoformat() if is_terminal and analysis.updatedAt else None,
        "retryable": analysis.status == "failed",
    }

@router.post("/analyses/{analysis_id}/retry")
@router.post("/v1/analyses/{analysis_id}/retry")
def retry_analysis(
    analysis_id: str,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = (
        db.query(Analysis)
        .join(Resume, Analysis.resumeId == Resume.id)
        .filter(Analysis.id == analysis_id)
        .first()
    )

    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    if analysis.resume.userId != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    if analysis.status != "failed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only failed analyses can be retried.")

    analysis.status = "queued"
    analysis.overallScore = None
    analysis.subScores = None
    analysis.findings = None
    analysis.heatmapData = None
    db.commit()

    background_tasks.add_task(run_analysis_job, analysis.id, analysis.resumeId, analysis.jobDescriptionId, user.id)

    return {
        "id": analysis.id,
        "status": "queued",
        "message": "Analysis re-queued. Poll GET /api/analyses/{id} for status.",
    }

@router.get("/analyses")
@router.get("/v1/analyses")
def list_analyses(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = (
        db.query(Analysis)
        .join(Resume, Analysis.resumeId == Resume.id)
        .filter(Resume.userId == user.id)
        .order_by(Analysis.createdAt.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "resumeId": a.resumeId,
            "resumeName": a.resume.fileName,
            "resumeLabel": a.resume.label,
            "jobTitle": a.jobDescription.title if a.jobDescription else None,
            "status": a.status,
            "overallScore": a.overallScore,
            "createdAt": a.createdAt.isoformat() if a.createdAt else None,
        }
        for a in analyses
    ]
