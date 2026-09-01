"""
ResumeIQ — Database Layer (SQLAlchemy)
Supports SQLite (zero-config local dev) and PostgreSQL.
Includes models for User, Resume, JobDescription, Analysis, ResumeDraft, ContactSubmission, ReviewLink.
"""

import uuid
from datetime import datetime, timezone
from typing import Generator
from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from .config import settings

# Format database URL for SQLite vs PostgreSQL
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
    # Connect to PostgreSQL
    engine = create_engine(db_url, pool_pre_ping=True)
else:
    # Use SQLite by default for instant local setup
    if not db_url.startswith("sqlite"):
        db_url = "sqlite:///./data_store.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a SQLAlchemy database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─── Models ─────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    passwordHash = Column(String(255), nullable=False)
    privacySettings = Column(JSON, nullable=True, default=dict)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    jobDescriptions = relationship("JobDescription", back_populates="user", cascade="all, delete-orphan")
    drafts = relationship("ResumeDraft", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    fileName = Column(String(255), nullable=False)
    filePath = Column(String(512), nullable=False)
    rawText = Column(Text, nullable=False)
    parsedJson = Column(JSON, nullable=True)
    version = Column(Integer, default=1)
    versionGroupId = Column(String(64), index=True, default=lambda: str(uuid.uuid4()))
    label = Column(String(255), nullable=True)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resumes")
    analyses = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")
    reviewLinks = relationship("ReviewLink", back_populates="resume", cascade="all, delete-orphan")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Untitled Position")
    company = Column(String(255), nullable=True)
    rawText = Column(Text, nullable=False)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="jobDescriptions")
    analyses = relationship("Analysis", back_populates="jobDescription")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    resumeId = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    jobDescriptionId = Column(String(64), ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(32), default="queued", index=True)  # queued, processing, completed, failed
    overallScore = Column(Float, nullable=True)
    subScores = Column(JSON, nullable=True)
    findings = Column(JSON, nullable=True)
    heatmapData = Column(JSON, nullable=True)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="analyses")
    jobDescription = relationship("JobDescription", back_populates="analyses")

class ResumeDraft(Base):
    __tablename__ = "resume_drafts"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Untitled Draft")
    templateId = Column(String(64), default="classic")
    templateSettings = Column(JSON, nullable=True, default=dict)
    sections = Column(JSON, nullable=True, default=list)
    roleId = Column(String(64), nullable=True)
    branchOfVersionId = Column(String(64), nullable=True)
    revision = Column(Integer, default=1)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updatedAt = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="drafts")

class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), default="Anonymous")
    email = Column(String(255), nullable=False)
    subject = Column(String(200), default="General Question")
    message = Column(Text, nullable=False)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ReviewLink(Base):
    __tablename__ = "review_links"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    token = Column(String(128), unique=True, index=True, nullable=False)
    resumeId = Column(String(64), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    expiresAt = Column(DateTime, nullable=False)
    createdAt = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="reviewLinks")

def init_db():
    """Create tables if they do not exist."""
    Base.metadata.create_all(bind=engine)
