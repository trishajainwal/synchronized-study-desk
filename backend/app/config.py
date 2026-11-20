from functools import lru_cache
from pathlib import Path

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_prefix="STUDYDESK_",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Synchronized Study Desk API"
    environment: str = "development"
    log_level: str = "INFO"
    data_dir: Path = PROJECT_ROOT / "data"
    database_url: str | None = None
    upload_dir: Path | None = None
    max_upload_mb: int = Field(default=25, gt=0)
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "qwen3.5:4b"
    ollama_timeout_seconds: float = Field(default=10.0, gt=0)
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    @model_validator(mode="after")
    def resolve_paths(self) -> "Settings":
        self.data_dir = self.data_dir.expanduser().resolve()
        self.upload_dir = (self.upload_dir or self.data_dir / "uploads").expanduser().resolve()
        if not self.database_url:
            database_path = self.data_dir / "studydesk.db"
            self.database_url = f"sqlite:///{database_path.as_posix()}"
        self.ollama_base_url = self.ollama_base_url.rstrip("/")
        return self

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
