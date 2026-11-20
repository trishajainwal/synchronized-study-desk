from fastapi.testclient import TestClient

from app.services.sync_sessions import SyncSessionRepository

from .helpers import build_pdf


def _create_document_and_session(client: TestClient) -> tuple[str, str]:
    response = client.post(
        "/api/documents",
        files={"file": ("chapter.pdf", build_pdf(["Annotated page", "Second page"]), "application/pdf")},
    )
    assert response.status_code == 201
    document_id = response.json()["id"]

    with client.app.state.session_factory() as db:
        SyncSessionRepository(db).ensure("laptop-session", document_id)

    return document_id, "laptop-session"


def test_annotation_crud(client: TestClient) -> None:
    document_id, session_id = _create_document_and_session(client)
    annotation_id = "11111111-1111-1111-1111-111111111111"

    created = client.post(
        f"/api/sessions/{session_id}/annotations",
        json={
            "id": annotation_id,
            "session_id": session_id,
            "document_id": document_id,
            "page_number": 1,
            "type": "highlight",
            "content": "Important definition",
            "color": "#ffff00",
            "quote": "Annotated page",
            "position": {"x": 12, "y": 34},
            "origin_device_id": "laptop-1",
        },
    )
    assert created.status_code == 201
    assert created.json()["id"] == annotation_id
    assert created.json()["position"] == {"x": 12, "y": 34}

    updated = client.patch(
        f"/api/sessions/{session_id}/annotations/{annotation_id}",
        json={"content": "Revised definition", "origin_device_id": "tablet-1"},
    )
    assert updated.status_code == 200
    assert updated.json()["content"] == "Revised definition"
    assert updated.json()["updated_by_device_id"] == "tablet-1"

    listed = client.get(f"/api/sessions/{session_id}/annotations")
    assert listed.status_code == 200
    assert len(listed.json()["annotations"]) == 1

    deleted = client.delete(f"/api/sessions/{session_id}/annotations/{annotation_id}")
    assert deleted.status_code == 204

    listed_after_delete = client.get(f"/api/sessions/{session_id}/annotations")
    assert listed_after_delete.json()["annotations"] == []


def test_annotation_rejects_page_outside_document(client: TestClient) -> None:
    document_id, session_id = _create_document_and_session(client)

    response = client.post(
        f"/api/sessions/{session_id}/annotations",
        json={
            "id": "22222222-2222-2222-2222-222222222222",
            "session_id": session_id,
            "document_id": document_id,
            "page_number": 99,
            "type": "note",
            "content": "Invalid page",
            "origin_device_id": "laptop-1",
        },
    )

    assert response.status_code == 400
