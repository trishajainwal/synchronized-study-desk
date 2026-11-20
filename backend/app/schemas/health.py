from typing import Literal

from .common import StrictModel


class HealthResponse(StrictModel):
    status: Literal["ok"]
    app_name: str
    environment: str
    database: Literal["ok"]


class OllamaHealthResponse(StrictModel):
    reachable: bool
    model: str
    model_available: bool
    base_url: str
    detail: str | None = None
