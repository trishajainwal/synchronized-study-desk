import logging

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from sqlalchemy.orm import Session

from ..deps import get_websocket_db
from ...db.models import Document
from ...enums import ConnectionStatus
from ...schemas.reading import ReadingPositionUpdate
from ...schemas.sync import (
    AnnotationCreateEvent,
    AnnotationCreatedEvent,
    AnnotationDeleteEvent,
    AnnotationDeletedEvent,
    AnnotationUpdateEvent,
    AnnotationUpdatedEvent,
    CitationNavigationEvent,
    ConnectionStatusEvent,
    PageChangedEvent,
    SessionStateEvent,
    SyncErrorEvent,
    client_event_adapter,
)
from ...services.annotations import AnnotationRepository
from ...services.errors import BackendError, SyncSessionNotFoundError
from ...services.reading_position import ReadingPositionRepository
from ...services.sync import SyncConnectionManager
from ...services.sync_sessions import SyncSessionRepository

logger = logging.getLogger(__name__)

router = APIRouter(tags=["synchronization"])


@router.websocket("/api/ws/sessions/{session_id}")
async def session_socket(
    websocket: WebSocket,
    session_id: str,
    device_id: str = Query(..., min_length=1, max_length=100),
    document_id: str | None = Query(default=None),
    db: Session = Depends(get_websocket_db),
) -> None:
    manager: SyncConnectionManager = websocket.app.state.sync_manager
    session_repository = SyncSessionRepository(db)

    try:
        session_repository.ensure(session_id, document_id)
    except BackendError as exc:
        await websocket.close(code=1008, reason=str(exc))
        return

    active_document_id = document_id or session_repository.get(session_id).document_id

    await websocket.accept()
    await manager.connect(session_id, websocket, device_id)

    state_event = SessionStateEvent(
        event="session_state",
        session_id=session_id,
        document_id=active_document_id,
        origin_device_id=device_id,
        connected_device_ids=manager.device_ids(session_id),
    )
    await websocket.send_json(state_event.model_dump(mode="json"))

    connected_event = ConnectionStatusEvent(
        event="connection_status",
        session_id=session_id,
        document_id=active_document_id,
        origin_device_id=device_id,
        status=ConnectionStatus.CONNECTED,
        connected_device_ids=manager.device_ids(session_id),
    )
    await manager.broadcast(session_id, connected_event, exclude_device_id=device_id)

    try:
        while True:
            raw_event = await websocket.receive_json()
            try:
                event = client_event_adapter.validate_python(raw_event)
            except ValidationError as exc:
                await _send_error(websocket, session_id, active_document_id, device_id, "Invalid sync event payload.")
                logger.info("Rejected invalid sync event: %s", exc.errors())
                continue

            try:
                active_document_id = await _handle_event(
                    event=event,
                    session_id=session_id,
                    device_id=device_id,
                    active_document_id=active_document_id,
                    db=db,
                    manager=manager,
                )
            except BackendError as exc:
                await _send_error(websocket, session_id, active_document_id, device_id, str(exc))
    except WebSocketDisconnect:
        logger.info("Device %s disconnected from session %s", device_id, session_id)
    except ValueError:
        await _send_error(websocket, session_id, active_document_id, device_id, "Sync messages must be JSON objects.")
    finally:
        await manager.disconnect(session_id, websocket)
        disconnected_event = ConnectionStatusEvent(
            event="connection_status",
            session_id=session_id,
            document_id=active_document_id,
            origin_device_id=device_id,
            status=ConnectionStatus.DISCONNECTED,
            connected_device_ids=manager.device_ids(session_id),
        )
        await manager.broadcast(session_id, disconnected_event, exclude_device_id=device_id)


async def _handle_event(
    *,
    event: object,
    session_id: str,
    device_id: str,
    active_document_id: str | None,
    db: Session,
    manager: SyncConnectionManager,
) -> str | None:
    if event.session_id != session_id:
        raise SyncSessionNotFoundError("Event session_id does not match the connected session.")
    if event.origin_device_id != device_id:
        raise BackendError("Event origin_device_id does not match the connected device.")

    document_id = event.document_id or active_document_id

    if isinstance(event, PageChangedEvent):
        if document_id is None:
            raise BackendError("A document must be selected before page changes can be synchronized.")
        _validate_page(db, document_id, event.page_number)
        if active_document_id is None:
            SyncSessionRepository(db).ensure(session_id, document_id)
        ReadingPositionRepository(db).upsert(
            session_id,
            ReadingPositionUpdate(
                document_id=document_id,
                page_number=event.page_number,
                origin_device_id=device_id,
            ),
        )
        event.document_id = document_id
        await manager.broadcast(session_id, event, exclude_device_id=device_id)
        return document_id

    if isinstance(event, CitationNavigationEvent):
        _validate_page(db, event.document_id, event.page_number)
        await manager.broadcast(session_id, event, exclude_device_id=device_id)
        return event.document_id

    if isinstance(event, AnnotationCreateEvent):
        annotation = AnnotationRepository(db).create(session_id, event.annotation)
        created = AnnotationCreatedEvent(
            event="annotation_created",
            session_id=session_id,
            document_id=annotation.document_id,
            origin_device_id=device_id,
            timestamp=event.timestamp,
            annotation=annotation,
        )
        await manager.broadcast(session_id, created, exclude_device_id=device_id)
        return annotation.document_id

    if isinstance(event, AnnotationUpdateEvent):
        annotation = AnnotationRepository(db).update(session_id, event.annotation_id, event.changes)
        updated = AnnotationUpdatedEvent(
            event="annotation_updated",
            session_id=session_id,
            document_id=annotation.document_id,
            origin_device_id=device_id,
            timestamp=event.timestamp,
            annotation=annotation,
        )
        await manager.broadcast(session_id, updated, exclude_device_id=device_id)
        return annotation.document_id

    if isinstance(event, AnnotationDeleteEvent):
        if document_id is None:
            raise BackendError("A document must be selected before annotations can be deleted.")
        AnnotationRepository(db).delete(session_id, event.annotation_id)
        deleted = AnnotationDeletedEvent(
            event="annotation_deleted",
            session_id=session_id,
            document_id=document_id,
            origin_device_id=device_id,
            timestamp=event.timestamp,
            annotation_id=event.annotation_id,
        )
        await manager.broadcast(session_id, deleted, exclude_device_id=device_id)
        return document_id

    raise BackendError("Unsupported sync event.")


def _validate_page(db: Session, document_id: str, page_number: int) -> None:
    document = db.get(Document, document_id)
    if document is None or document.page_count is None:
        raise BackendError("The target document is not ready.")
    if page_number < 1 or page_number > document.page_count:
        raise BackendError("The target page does not exist in the document.")


async def _send_error(
    websocket: WebSocket,
    session_id: str,
    document_id: str | None,
    device_id: str,
    message: str,
) -> None:
    error_event = SyncErrorEvent(
        event="error",
        session_id=session_id,
        document_id=document_id,
        origin_device_id=device_id,
        message=message,
    )
    await websocket.send_json(error_event.model_dump(mode="json"))
