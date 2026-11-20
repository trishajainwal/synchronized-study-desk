from sqlalchemy.orm import Session

from ..db.models import Document, SyncSession
from ..enums import DocumentStatus
from ..utils import utcnow
from .errors import SyncSessionNotFoundError


class SyncSessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def ensure(self, session_id: str, document_id: str | None = None) -> SyncSession:
        session = self.db.get(SyncSession, session_id)

        if document_id is not None:
            self._validate_document(document_id)

        if session is None:
            session = SyncSession(id=session_id, document_id=document_id)
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            return session

        if document_id is not None and session.document_id != document_id:
            session.document_id = document_id
            session.updated_at = utcnow()
            self.db.commit()
            self.db.refresh(session)

        return session

    def get(self, session_id: str) -> SyncSession:
        session = self.db.get(SyncSession, session_id)
        if session is None:
            raise SyncSessionNotFoundError(f"Sync session '{session_id}' was not found.")
        return session

    def _validate_document(self, document_id: str) -> None:
        document = self.db.get(Document, document_id)
        if document is None:
            raise SyncSessionNotFoundError(f"Document '{document_id}' was not found.")
        if document.status != DocumentStatus.READY:
            raise SyncSessionNotFoundError(f"Document '{document_id}' is not ready for synchronization.")
