import pytest
from pydantic import ValidationError

from app.schemas.sync import PageChangedEvent, client_event_adapter


def test_client_sync_events_are_typed() -> None:
    event = client_event_adapter.validate_python(
        {
            "event": "page_changed",
            "session_id": "session-1",
            "document_id": "doc-1",
            "origin_device_id": "laptop-1",
            "page_number": 3,
        }
    )

    assert isinstance(event, PageChangedEvent)
    assert event.page_number == 3
    assert event.origin_device_id == "laptop-1"


def test_client_sync_events_reject_unknown_event_names() -> None:
    with pytest.raises(ValidationError):
        client_event_adapter.validate_python(
            {
                "event": "unknown",
                "session_id": "session-1",
                "origin_device_id": "laptop-1",
            }
        )
