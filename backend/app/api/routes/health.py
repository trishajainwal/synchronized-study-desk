from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from ...config import Settings
from ...schemas.health import HealthResponse, OllamaHealthResponse
from ...services.ollama import OllamaService
from ..deps import get_db, get_ollama, get_settings

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("", response_model=HealthResponse)
def health(db: Session = Depends(get_db), settings: Settings = Depends(get_settings)) -> HealthResponse:
    db.execute(text("SELECT 1"))
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        environment=settings.environment,
        database="ok",
    )


@router.get("/ollama", response_model=OllamaHealthResponse)
async def ollama_health(service: OllamaService = Depends(get_ollama)) -> OllamaHealthResponse:
    result = await service.check_health()
    return OllamaHealthResponse(
        reachable=result.reachable,
        model=result.model,
        model_available=result.model_available,
        base_url=result.base_url,
        detail=result.detail,
    )
