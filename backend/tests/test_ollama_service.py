import asyncio

import httpx

from app.config import Settings
from app.services.ollama import OllamaHealth, OllamaService


def test_ollama_service_uses_configured_model(settings: Settings) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/tags"
        return httpx.Response(
            200,
            json={"models": [{"name": "test-model:latest"}, {"name": "unrelated:7b"}]},
        )

    async def run_check() -> OllamaHealth:
        transport = httpx.MockTransport(handler)
        async with httpx.AsyncClient(transport=transport) as client:
            service = OllamaService(settings, client)
            return await service.check_health()

    result = asyncio.run(run_check())

    assert result.reachable is True
    assert result.model == "test-model"
    assert result.model_available is True
    assert result.detail is None
