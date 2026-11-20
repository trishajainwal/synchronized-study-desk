from pydantic import Field

from ..enums import ConfidenceStatus
from .common import StrictModel
from .evidence import EvidenceReference


class ChatRequest(StrictModel):
    session_id: str = Field(min_length=1, max_length=100)
    document_id: str | None = Field(default=None, max_length=36)
    question: str = Field(min_length=1, max_length=4_000)
    selected_page_numbers: list[int] = Field(default_factory=list)
    max_evidence_passages: int = Field(default=5, ge=1, le=20)


class ChatResponse(StrictModel):
    answer: str
    evidence: list[EvidenceReference]
    confidence: ConfidenceStatus
    refused: bool
    refusal_reason: str | None = None
    model: str
