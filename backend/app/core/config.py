"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://resumeiq:resumeiq_dev@localhost:5432/resumeiq"
    db_password: str = "resumeiq_dev"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Auth
    jwt_secret: str = "change-me-to-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440

    # Storage
    storage_backend: str = "local"
    upload_dir: str = "./uploads"
    s3_bucket: Optional[str] = None
    s3_access_key: Optional[str] = None
    s3_secret_key: Optional[str] = None
    s3_endpoint_url: Optional[str] = None

    # LLM
    llm_provider: str = "anthropic"
    
    llm_api_key: Optional[str] = None
    llm_model: str = "claude-sonnet-4-20250514"
    llm_max_tokens: int = 4096

    # App
    app_env: str = "development"
    app_debug: bool = True
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_llm_available(self) -> bool:
        return bool(self.llm_api_key)

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
