"""
ResumeIQ — FastAPI Application Entry Point
High-Performance Python Backend with Local Machine Learning (ML/DL) & Zero External AI Keys.
"""

from contextlib import asynccontextmanager
import time
import uuid
import logging
import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .database import init_db, SessionLocal
from .routes.auth import router as auth_router
from .routes.resumes import router as resumes_router
from .routes.analysis import router as analysis_router
from .routes.jobs import router as jobs_router
from .routes.drafts import router as drafts_router
from .routes.export import router as export_router
from .routes.public import router as public_router
from .routes.contact import router as contact_router
from .routes.tailor import router as tailor_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    settings.validate_runtime()
    init_db()
    print("[OK] ResumeIQ FastAPI Backend Initialized")
    print(f"[OK] Local ML/DL & NLP Engines Ready (Groq: {'configured' if settings.GROQ_API_KEY else 'fallback'})")
    print(f"[OK] Upload Directory: {settings.UPLOAD_DIR}")
    yield
    # Shutdown

app = FastAPI(
    title="ResumeIQ API",
    description="ResumeIQ Semantic Resume Analyzer — High-Performance Python & Local ML/DL Engine",
    version="2026.08.1",
    lifespan=lifespan,
    docs_url=None if settings.is_prod else "/docs",
    redoc_url=None if settings.is_prod else "/redoc",
    openapi_url=None if settings.is_prod else "/openapi.json"
)

# ─── CORS Middleware ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "Authorization", "X-Request-ID"],
)

# ─── Request Tracking Middleware ────────────────────────────────────────
@app.middleware("http")
async def add_security_and_tracking_headers(request: Request, call_next):
    request_id = request.headers.get("x-request-id", f"req_{uuid.uuid4()}")
    started = time.perf_counter()
    response = await call_next(request)
    logging.getLogger("resumeiq.request").info("request_id=%s method=%s path=%s status=%s duration_ms=%s", request_id, request.method, request.url.path, response.status_code, round((time.perf_counter() - started) * 1000))
    response.headers["x-request-id"] = request_id
    response.headers["x-content-type-options"] = "nosniff"
    response.headers["x-frame-options"] = "DENY"
    response.headers["referrer-policy"] = "same-origin"
    response.headers["permissions-policy"] = "camera=(), microphone=(), geolocation=()"
    if settings.is_prod:
        response.headers["strict-transport-security"] = "max-age=31536000; includeSubDomains"
    return response

from .limiter import limiter
from slowapi.errors import RateLimitExceeded

app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "error": f"Too many requests. Rate limit exceeded: {exc.detail}",
            "requestId": request.headers.get("x-request-id")
        },
        headers={"Retry-After": "60"}
    )

# ─── Global Error Handler ───────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, RateLimitExceeded):
        return await rate_limit_handler(request, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "An unexpected internal server error occurred.",
            "requestId": request.headers.get("x-request-id")
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
app.include_router(tailor_router, prefix="/api")

# ─── System Health & Methodology Endpoints ──────────────────────────────
@app.get("/api/health/live")
@app.get("/api/v1/health/live")
def health_live():
    return {
        "status": "live",
        "service": "resumeiq-python",
        "environment": settings.APP_ENV,
        "engine": "local-ml-dl",
        "groq_configured": bool(settings.GROQ_API_KEY)
    }

@app.get("/api/health/ready")
@app.get("/api/v1/health/ready")
@app.get("/api/health")
@app.get("/api/v1/health")
def health_ready():
    db = SessionLocal()
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not_ready", "database": {"connected": False}})
    finally:
        db.close()
    storage_ready = os.path.isdir(settings.UPLOAD_DIR) and os.access(settings.UPLOAD_DIR, os.W_OK)
    if not storage_ready:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "storage": {"connected": False}}
        )
    return {
        "status": "ready",
        "service": "resumeiq-python",
        "environment": settings.APP_ENV,
        "database": {
            "mode": "sqlite" if "sqlite" in settings.DATABASE_URL else "postgres",
            "connected": True
        },
        "storage": {
            "backend": settings.STORAGE_BACKEND,
            "path": settings.UPLOAD_DIR,
            "connected": True
        },
        "ml": {
            "mode": "groq_with_local_fallback" if settings.GROQ_API_KEY else "local_standalone",
            "tfidf_vectorizer": "ready",
            "star_rewriter": "ready",
            "interview_predictor": "ready",
            "cover_letter_gen": "ready",
            "external_api_keys_required": False,
            "groq_configured": bool(settings.GROQ_API_KEY)
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
