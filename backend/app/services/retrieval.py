from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True, slots=True)
class RetrievedPassage:
    chunk_id: str
    document_id: str
    page_number: int
    text: str
    score: float | None = None


class Retriever(Protocol):
    def retrieve(
        self,
        query: str,
        document_ids: list[str] | None = None,
        top_k: int = 5,
    ) -> list[RetrievedPassage]: ...
