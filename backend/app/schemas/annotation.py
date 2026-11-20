from datetime import datetime

from pydantic import Field, JsonValue

from ..enums import AnnotationType
from .common import ORMModel, StrictModel


class AnnotationCreate(StrictModel):
    id: str = Field(min_length=1, max_length=36)
    session_id: str = Field(min_length=1, max_length=100)
    document_id: str = Field(min_length=1, max_length=36)
    page_number: int = Field(ge=1)
    type: AnnotationType
    content: str = Field(min_length=1, max_length=20_000)
    color: str | None = Field(default=None, max_length=20)
    quote: str | None = Field(default=None, max_length=20_000)
    position: dict[str, JsonValue] | None = None
    origin_device_id: str = Field(min_length=1, max_length=100)


class AnnotationUpdate(StrictModel):
    page_number: int | None = Field(default=None, ge=1)
    type: AnnotationType | None = None
    content: str | None = Field(default=None, min_length=1, max_length=20_000)
    color: str | None = Field(default=None, max_length=20)
    quote: str | None = Field(default=None, max_length=20_000)
    position: dict[str, JsonValue] | None = None
    origin_device_id: str = Field(min_length=1, max_length=100)


class AnnotationRead(ORMModel):
    id: str
    session_id: str
    document_id: str
    page_number: int
    type: AnnotationType
    content: str
    color: str | None
    quote: str | None
    position: dict[str, JsonValue] | None
    created_by_device_id: str
    updated_by_device_id: str
    created_at: datetime
    updated_at: datetime


class AnnotationList(StrictModel):
    session_id: str
    document_id: str | None
    annotations: list[AnnotationRead]
