from fastapi.testclient import TestClient

from app.api.deps import get_ollama
from app.config import Settings
from app.services.ollama import OllamaHealth


class FakeOllamaService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def check_health(self) -> OllamaHealth:
        return OllamaHealth(
            reachable=True,
            model=self.settings.ollama_model,
            model_available=True,
            base_url=self.settings.ollama_base_url,
        )


def test_ollama_health_endpoint(client: TestClient, settings: Settings) -> None:
    client.app.dependency_overrides[get_ollama] = lambda: FakeOllamaService(settings)

    response = client.get("/api/health/ollama")

    assert response.status_code == 200
    assert response.json() == {
        "reachable": True,
        "model": "test-model",
        "model_available": True,
        "base_url": "http://ollama.test",
        "detail": None,
    }
