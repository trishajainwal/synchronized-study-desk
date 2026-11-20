from fastapi.testclient import TestClient

from .helpers import build_pdf


def test_websocket_session_state_and_page_change_persistence(client: TestClient) -> None:
    response = client.post(
        "/api/documents",
        files={"file": ("chapter.pdf", build_pdf(["Page one", "Page two"]), "application/pdf")},
    )
    assert response.status_code == 201
    document_id = response.json()["id"]

    with client.websocket_connect(
        f"/api/ws/sessions/sync-session?device_id=laptop-1&document_id={document_id}"
    ) as websocket:
        state_event = websocket.receive_json()
        assert state_event["event"] == "session_state"
        assert state_event["session_id"] == "sync-session"
        assert state_event["document_id"] == document_id
        assert state_event["origin_device_id"] == "laptop-1"

        websocket.send_json(
            {
                "event": "page_changed",
                "session_id": "sync-session",
                "document_id": document_id,
                "origin_device_id": "laptop-1",
                "page_number": 2,
            }
        )

    stored = client.get(
        "/api/sessions/sync-session/reading-position",
        params={"document_id": document_id},
    )
    assert stored.status_code == 200
    assert stored.json()["page_number"] == 2


def test_websocket_sends_error_for_unknown_event(client: TestClient) -> None:
    response = client.post(
        "/api/documents",
        files={"file": ("chapter.pdf", build_pdf(["Page one"]), "application/pdf")},
    )
    document_id = response.json()["id"]

    with client.websocket_connect(
        f"/api/ws/sessions/error-session?device_id=laptop-1&document_id={document_id}"
    ) as websocket:
        websocket.receive_json()
        websocket.send_json({"event": "unknown_event", "session_id": "error-session"})

        error_event = websocket.receive_json()
        assert error_event["event"] == "error"
        assert error_event["message"] == "Invalid sync event payload."
