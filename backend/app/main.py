"""
ResumeIQ — FastAPI Application Entry Point
High-Performance Python Backend with Local Machine Learning (ML/DL) & Zero External AI Keys.
"""

from contextlib import asynccontextmanager
import time
import uuid
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import init_db
from .routes.auth import router as auth_router
from .routes.resumes import router as resumes_router
from .routes.analysis import router as analysis_router
from .routes.jobs import router as jobs_router
from .routes.drafts import router as drafts_router
from .routes.export import router as export_router
from .routes.public import router as public_router
from .routes.contact import router as contact_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    init_db()
    print("[OK] ResumeIQ FastAPI Backend Initialized")
    print("[OK] Local ML/DL & NLP Engines Ready (Zero API Keys required)")
    print(f"[OK] Upload Directory: {settings.UPLOAD_DIR}")
    yield
    # Shutdown

app = FastAPI(
    title="ResumeIQ API",
    description="ResumeIQ Semantic Resume Analyzer — High-Performance Python & Local ML/DL Engine",
    version="2026.08.1",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ─── CORS Middleware ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Tracking Middleware ────────────────────────────────────────
@app.middleware("http")
async def add_security_and_tracking_headers(request: Request, call_next):
    request_id = request.headers.get("x-request-id", f"req_{uuid.uuid4()}")
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "same-origin"
    return response

# ─── Global Error Handler ───────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": str(exc) if settings.APP_DEBUG else "An unexpected internal server error occurred."
        }
    )

# ─── Include API Routers ────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(drafts_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(public_router, prefix="/api")
app.include_router(contact_router, prefix="/api")

# ─── System Health & Methodology Endpoints ──────────────────────────────
@app.get("/api/health/live")
@app.get("/api/v1/health/live")
def health_live():
    return {
        "status": "live",
        "service": "resumeiq-python",
        "environment": settings.APP_ENV,
        "engine": "local-ml-dl"
    }

@app.get("/api/health/ready")
@app.get("/api/v1/health/ready")
@app.get("/api/health")
@app.get("/api/v1/health")
def health_ready():
    return {
        "status": "ready",
        "service": "resumeiq-python",
        "environment": settings.APP_ENV,
        "database": {
            "mode": "sqlite" if "sqlite" in settings.DATABASE_URL else "postgres",
            "connected": True
        },
        "ml": {
            "mode": "local_standalone",
            "tfidf_vectorizer": "ready",
            "star_rewriter": "ready",
            "interview_predictor": "ready",
            "cover_letter_gen": "ready",
            "external_api_keys_required": False
        }
    }

@app.get("/api/v1/methodology/current")
def get_methodology():
    return {
        "methodologyVersion": "2026.08.1",
        "scoreDimensions": {
            "contentImpact": 0.30,
            "atsCompatibility": 0.25,
            "roleRelevance": 0.20,
            "formatting": 0.15,
            "readability": 0.10,
        },
        "limitations": [
            "ATS results are simulated heuristics, not vendor certifications.",
            "Readability scores are directional for resume fragments and technical language.",
            "A score is diagnostic and does not predict hiring outcomes.",
        ],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.APP_DEBUG)
