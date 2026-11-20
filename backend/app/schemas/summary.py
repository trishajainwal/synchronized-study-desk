from pydantic import Field

from ..enums import SummaryStyle
from .common import StrictModel
from .evidence import EvidenceReference


class SummaryRequest(StrictModel):
    document_id: str = Field(min_length=1, max_length=36)
    chapter: str | None = Field(default=None, max_length=200)
    topic: str | None = Field(default=None, max_length=200)
    style: SummaryStyle = SummaryStyle.CONCISE
    max_words: int = Field(default=500, ge=50, le=5_000)


class SummaryResponse(StrictModel):
    document_id: str
    chapter: str | None
    topic: str | None
    summary: str
    evidence: list[EvidenceReference]
    model: str
