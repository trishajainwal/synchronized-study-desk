from datetime import datetime

from pydantic import Field

from .common import ORMModel, StrictModel


class ReadingPositionUpdate(StrictModel):
    document_id: str = Field(min_length=1, max_length=36)
    page_number: int = Field(ge=1)
    origin_device_id: str = Field(min_length=1, max_length=100)


class ReadingPositionRead(ORMModel):
    id: str
    session_id: str
    document_id: str
    page_number: int
    updated_at: datetime
