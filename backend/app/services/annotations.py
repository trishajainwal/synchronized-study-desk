import json

from sqlalchemy.orm import Session

from ..db.models import Annotation, Document, SyncSession
from ..schemas.annotation import AnnotationCreate, AnnotationList, AnnotationRead, AnnotationUpdate
from ..utils import utcnow
from .errors import AnnotationError, AnnotationNotFoundError, SyncSessionNotFoundError

POSITION_FIELD = "position"


class AnnotationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, session_id: str, data: AnnotationCreate) -> AnnotationRead:
        if data.session_id != session_id:
            raise AnnotationError("Annotation session_id does not match the route session.")
        session = self._get_session(session_id)
        self._validate_document(session, data.document_id, data.page_number)

        if self.db.get(Annotation, data.id) is not None:
            raise AnnotationError(f"Annotation '{data.id}' already exists.")

        annotation = Annotation(
            id=data.id,
            session_id=session_id,
            document_id=data.document_id,
            page_number=data.page_number,
            type=data.type,
            content=data.content,
            color=data.color,
            quote=data.quote,
            position_json=self._serialize_position(data.position),
            created_by_device_id=data.origin_device_id,
            updated_by_device_id=data.origin_device_id,
        )
        self.db.add(annotation)
        self.db.commit()
        self.db.refresh(annotation)
        return self._to_read(annotation)

    def update(self, session_id: str, annotation_id: str, changes: AnnotationUpdate) -> AnnotationRead:
        annotation = self.db.get(Annotation, annotation_id)
        if annotation is None or annotation.session_id != session_id:
            raise AnnotationNotFoundError(f"Annotation '{annotation_id}' was not found.")

        session = self._get_session(session_id)
        page_number = changes.page_number if changes.page_number is not None else annotation.page_number
        self._validate_document(session, annotation.document_id, page_number)

        fields = changes.model_fields_set
        if "page_number" in fields and changes.page_number is not None:
            annotation.page_number = changes.page_number
        if "type" in fields and changes.type is not None:
            annotation.type = changes.type
        if "content" in fields and changes.content is not None:
            annotation.content = changes.content
        if "color" in fields:
            annotation.color = changes.color
        if "quote" in fields:
            annotation.quote = changes.quote
        if POSITION_FIELD in fields:
            annotation.position_json = self._serialize_position(changes.position)

        annotation.updated_by_device_id = changes.origin_device_id
        annotation.updated_at = utcnow()
        self.db.commit()
        self.db.refresh(annotation)
        return self._to_read(annotation)

    def delete(self, session_id: str, annotation_id: str) -> None:
        annotation = self.db.get(Annotation, annotation_id)
        if annotation is None or annotation.session_id != session_id:
            raise AnnotationNotFoundError(f"Annotation '{annotation_id}' was not found.")
        self.db.delete(annotation)
        self.db.commit()

    def list(self, session_id: str, document_id: str | None = None) -> AnnotationList:
        session = self._get_session(session_id)
        if document_id is not None:
            self._validate_document(session, document_id, page_number=1)

        query = self.db.query(Annotation).filter(Annotation.session_id == session_id)
        if document_id is not None:
            query = query.filter(Annotation.document_id == document_id)
        annotations = query.order_by(Annotation.created_at, Annotation.id).all()
        return AnnotationList(
            session_id=session_id,
            document_id=document_id,
            annotations=[self._to_read(annotation) for annotation in annotations],
        )

    def _get_session(self, session_id: str) -> SyncSession:
        session = self.db.get(SyncSession, session_id)
        if session is None:
            raise SyncSessionNotFoundError(f"Sync session '{session_id}' was not found.")
        return session

    def _validate_document(self, session: SyncSession, document_id: str, page_number: int) -> None:
        if session.document_id is not None and session.document_id != document_id:
            raise AnnotationError("Annotation document does not match the session document.")
        document = self.db.get(Document, document_id)
        if document is None:
            raise AnnotationError(f"Document '{document_id}' was not found.")
        if document.page_count is not None and page_number > document.page_count:
            raise AnnotationError(f"Page {page_number} is outside the document.")
        if page_number < 1:
            raise AnnotationError("Page numbers must be positive.")

    def _serialize_position(self, position: dict | None) -> str | None:
        return json.dumps(position) if position is not None else None

    def _to_read(self, annotation: Annotation) -> AnnotationRead:
        position = None
        if annotation.position_json:
            decoded = json.loads(annotation.position_json)
            if isinstance(decoded, dict):
                position = decoded
        return AnnotationRead(
            id=annotation.id,
            session_id=annotation.session_id,
            document_id=annotation.document_id,
            page_number=annotation.page_number,
            type=annotation.type,
            content=annotation.content,
            color=annotation.color,
            quote=annotation.quote,
            position=position,
            created_by_device_id=annotation.created_by_device_id,
            updated_by_device_id=annotation.updated_by_device_id,
            created_at=annotation.created_at,
            updated_at=annotation.updated_at,
        )
