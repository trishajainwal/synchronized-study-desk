from datetime import datetime

from pydantic import Field

from .common import StrictModel
from .evidence import EvidenceReference


class StudyReportRequest(StrictModel):
    session_id: str = Field(min_length=1, max_length=100)
    document_id: str = Field(min_length=1, max_length=36)
    from_date: datetime | None = None
    to_date: datetime | None = None
    include_quiz_results: bool = True
    include_reading_progress: bool = True


class ReportSection(StrictModel):
    title: str
    content: str


class StudyReportResponse(StrictModel):
    session_id: str
    document_id: str
    generated_at: datetime
    sections: list[ReportSection]
    evidence: list[EvidenceReference]
    model: str
