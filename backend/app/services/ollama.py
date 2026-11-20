from dataclasses import dataclass

import httpx

from ..config import Settings


@dataclass(frozen=True, slots=True)
class OllamaHealth:
    reachable: bool
    model: str
    model_available: bool
    base_url: str
    detail: str | None = None


class OllamaService:
    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None) -> None:
        self.settings = settings
        self.client = client or httpx.AsyncClient()
        self._owns_client = client is None

    async def check_health(self) -> OllamaHealth:
        model = self.settings.ollama_model
        base_url = self.settings.ollama_base_url

        try:
            response = await self.client.get(
                f"{base_url}/api/tags",
                timeout=self.settings.ollama_timeout_seconds,
            )
        except httpx.HTTPError as exc:
            return OllamaHealth(
                reachable=False,
                model=model,
                model_available=False,
                base_url=base_url,
                detail=f"Could not connect to Ollama: {exc}",
            )

        if response.status_code != 200:
            return OllamaHealth(
                reachable=True,
                model=model,
                model_available=False,
                base_url=base_url,
                detail=f"Ollama returned HTTP {response.status_code} for /api/tags.",
            )

        try:
            payload = response.json()
        except ValueError:
            return OllamaHealth(
                reachable=True,
                model=model,
                model_available=False,
                base_url=base_url,
                detail="Ollama returned a non-JSON response.",
            )

        installed_models = [
            item.get("name", "")
            for item in payload.get("models", [])
            if isinstance(item, dict)
        ]
        requested_base = model.split(":", 1)[0]
        model_available = any(
            name == model or name.split(":", 1)[0] == requested_base
            for name in installed_models
        )
        detail = None
        if not model_available:
            detail = f"Configured model '{model}' is not installed in Ollama."

        return OllamaHealth(
            reachable=True,
            model=model,
            model_available=model_available,
            base_url=base_url,
            detail=detail,
        )

    async def close(self) -> None:
        if self._owns_client:
            await self.client.aclose()
