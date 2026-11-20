from pydantic import Field

from .common import StrictModel


class EvidenceReference(StrictModel):
    document_id: str = Field(min_length=1, max_length=36)
    document_title: str
    page_number: int = Field(ge=1)
    chunk_id: str = Field(min_length=1, max_length=100)
    quote: str
    relevance_score: float | None = Field(default=None, ge=0.0, le=1.0)
