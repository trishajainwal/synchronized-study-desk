from fastapi.testclient import TestClient

from app.services.sync_sessions import SyncSessionRepository

from .helpers import build_pdf


def test_reading_position_is_upserted(client: TestClient) -> None:
    response = client.post(
        "/api/documents",
        files={"file": ("chapter.pdf", build_pdf(["Page one", "Page two"]), "application/pdf")},
    )
    assert response.status_code == 201
    document_id = response.json()["id"]

    with client.app.state.session_factory() as db:
        SyncSessionRepository(db).ensure("reading-session", document_id)

    first = client.put(
        "/api/sessions/reading-session/reading-position",
        json={"document_id": document_id, "page_number": 1, "origin_device_id": "laptop-1"},
    )
    second = client.put(
        "/api/sessions/reading-session/reading-position",
        json={"document_id": document_id, "page_number": 2, "origin_device_id": "tablet-1"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json()["page_number"] == 2
    assert second.json()["id"] == first.json()["id"]

    stored = client.get(
        "/api/sessions/reading-session/reading-position",
        params={"document_id": document_id},
    )
    assert stored.json()["page_number"] == 2
