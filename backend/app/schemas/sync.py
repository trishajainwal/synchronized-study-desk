from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import Field, TypeAdapter

from ..enums import ConnectionStatus
from ..utils import utcnow
from .annotation import AnnotationCreate, AnnotationRead, AnnotationUpdate
from .common import StrictModel


class SyncEventBase(StrictModel):
    session_id: str = Field(min_length=1, max_length=100)
    document_id: str | None = Field(default=None, max_length=36)
    origin_device_id: str = Field(min_length=1, max_length=100)
    timestamp: datetime = Field(default_factory=utcnow)


class PageChangedEvent(SyncEventBase):
    event: Literal["page_changed"]
    page_number: int = Field(ge=1)


class CitationNavigationEvent(SyncEventBase):
    event: Literal["citation_navigated"]
    document_id: str = Field(min_length=1, max_length=36)
    page_number: int = Field(ge=1)
    chunk_id: str = Field(min_length=1, max_length=100)
    quote: str = Field(min_length=1, max_length=20_000)


class AnnotationCreateEvent(SyncEventBase):
    event: Literal["annotation_create"]
    annotation: AnnotationCreate


class AnnotationUpdateEvent(SyncEventBase):
    event: Literal["annotation_update"]
    annotation_id: str = Field(min_length=1, max_length=36)
    changes: AnnotationUpdate


class AnnotationDeleteEvent(SyncEventBase):
    event: Literal["annotation_delete"]
    annotation_id: str = Field(min_length=1, max_length=36)


class AnnotationCreatedEvent(SyncEventBase):
    event: Literal["annotation_created"]
    annotation: AnnotationRead


class AnnotationUpdatedEvent(SyncEventBase):
    event: Literal["annotation_updated"]
    annotation: AnnotationRead


class AnnotationDeletedEvent(SyncEventBase):
    event: Literal["annotation_deleted"]
    annotation_id: str = Field(min_length=1, max_length=36)


class ConnectionStatusEvent(SyncEventBase):
    event: Literal["connection_status"]
    status: ConnectionStatus
    connected_device_ids: list[str]


class SessionStateEvent(SyncEventBase):
    event: Literal["session_state"]
    connected_device_ids: list[str]


class SyncErrorEvent(SyncEventBase):
    event: Literal["error"]
    message: str


ClientSyncEvent = Annotated[
    Union[
        PageChangedEvent,
        CitationNavigationEvent,
        AnnotationCreateEvent,
        AnnotationUpdateEvent,
        AnnotationDeleteEvent,
    ],
    Field(discriminator="event"),
]

ServerSyncEvent = Annotated[
    Union[
        PageChangedEvent,
        CitationNavigationEvent,
        AnnotationCreatedEvent,
        AnnotationUpdatedEvent,
        AnnotationDeletedEvent,
        ConnectionStatusEvent,
        SessionStateEvent,
        SyncErrorEvent,
    ],
    Field(discriminator="event"),
]

client_event_adapter: TypeAdapter[ClientSyncEvent] = TypeAdapter(ClientSyncEvent)
