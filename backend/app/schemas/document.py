from datetime import datetime

from ..enums import DocumentStatus
from .common import ORMModel, StrictModel


class DocumentRead(ORMModel):
    id: str
    original_filename: str
    content_type: str
    size_bytes: int
    sha256: str
    status: DocumentStatus
    page_count: int | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class DocumentPageRead(ORMModel):
    id: int
    document_id: str
    page_number: int
    text: str
    char_count: int


class DocumentPageList(StrictModel):
    document_id: str
    pages: list[DocumentPageRead]


class DocumentList(StrictModel):
    documents: list[DocumentRead]
