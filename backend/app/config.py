"""
ResumeIQ — Application Configuration (FastAPI)
Loads environment variables with robust defaults for local development and production.
"""

import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base workspace directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = "sqlite:///./data_store.db"

    # Security / Auth
    JWT_SECRET: str = "dev-secret-key-change-in-production-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # Uploads & Storage
    STORAGE_BACKEND: str = "local"
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=ENV_PATH if ENV_PATH.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_prod(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
