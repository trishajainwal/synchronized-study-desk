import uuid

from sqlalchemy.orm import Session

from ..db.models import Document, ReadingPosition, SyncSession
from ..schemas.reading import ReadingPositionRead, ReadingPositionUpdate
from ..utils import utcnow
from .errors import ReadingPositionError, SyncSessionNotFoundError


class ReadingPositionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get(self, session_id: str, document_id: str) -> ReadingPositionRead | None:
        position = (
            self.db.query(ReadingPosition)
            .filter(
                ReadingPosition.session_id == session_id,
                ReadingPosition.document_id == document_id,
            )
            .one_or_none()
        )
        if position is None:
            return None
        return ReadingPositionRead.model_validate(position)

    def upsert(self, session_id: str, data: ReadingPositionUpdate) -> ReadingPositionRead:
        session = self.db.get(SyncSession, session_id)
        if session is None:
            raise SyncSessionNotFoundError(f"Sync session '{session_id}' was not found.")
        if session.document_id is not None and session.document_id != data.document_id:
            raise ReadingPositionError("Reading position document does not match the session document.")

        document = self.db.get(Document, data.document_id)
        if document is None:
            raise ReadingPositionError(f"Document '{data.document_id}' was not found.")
        if document.page_count is not None and data.page_number > document.page_count:
            raise ReadingPositionError(f"Page {data.page_number} is outside the document.")

        position = (
            self.db.query(ReadingPosition)
            .filter(
                ReadingPosition.session_id == session_id,
                ReadingPosition.document_id == data.document_id,
            )
            .one_or_none()
        )
        if position is None:
            position = ReadingPosition(
                id=str(uuid.uuid4()),
                session_id=session_id,
                document_id=data.document_id,
                page_number=data.page_number,
            )
            self.db.add(position)
        else:
            position.page_number = data.page_number
            position.updated_at = utcnow()

        self.db.commit()
        self.db.refresh(position)
        return ReadingPositionRead.model_validate(position)
