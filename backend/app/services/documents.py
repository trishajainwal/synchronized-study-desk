import hashlib
import logging
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from ..config import Settings
from ..db.models import Document, DocumentPage
from ..enums import DocumentStatus
from ..schemas.document import DocumentList, DocumentPageList, DocumentPageRead, DocumentRead
from .errors import (
    DocumentNotFoundError,
    DocumentProcessingError,
    InvalidPdfError,
    PdfTooLargeError,
)
from .pdf import PdfExtractor
from .storage import DocumentStorage

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(
        self,
        db: Session,
        settings: Settings,
        extractor: PdfExtractor | None = None,
        storage: DocumentStorage | None = None,
    ) -> None:
        self.db = db
        self.settings = settings
        self.extractor = extractor or PdfExtractor()
        self.storage = storage or DocumentStorage(settings.upload_dir or settings.data_dir / "uploads")

    def upload(self, *, filename: str, content_type: str, data: bytes) -> DocumentRead:
        self.extractor.validate_upload(
            filename=filename,
            content_type=content_type,
            size_bytes=len(data),
            max_bytes=self.settings.max_upload_bytes,
        )

        document_id = str(uuid.uuid4())
        safe_filename = Path(filename).name[:255] or "upload.pdf"
        document = Document(
            id=document_id,
            original_filename=safe_filename,
            stored_filename=f"{document_id}.pdf",
            content_type=content_type or "application/octet-stream",
            size_bytes=len(data),
            sha256=hashlib.sha256(data).hexdigest(),
            status=DocumentStatus.PENDING,
            page_count=None,
            error_message=None,
        )
        self.db.add(document)
        self.db.commit()

        try:
            document.status = DocumentStatus.PROCESSING
            self.db.commit()

            extracted = self.extractor.extract(data)
            self.storage.save(document_id, data)

            for page in extracted.pages:
                self.db.add(
                    DocumentPage(
                        document_id=document_id,
                        page_number=page.page_number,
                        text=page.text,
                        char_count=len(page.text),
                    )
                )

            document.page_count = extracted.page_count
            document.status = DocumentStatus.READY
            document.error_message = None
            self.db.commit()
        except (InvalidPdfError, PdfTooLargeError):
            self._mark_failed(document_id, "PDF validation failed during extraction.")
            raise
        except Exception as exc:
            logger.exception("Document processing failed for %s", document_id)
            self.storage.delete(document_id)
            self._mark_failed(document_id, "PDF text extraction failed.")
            raise DocumentProcessingError("PDF text extraction failed.") from exc

        self.db.refresh(document)
        return DocumentRead.model_validate(document)

    def list_documents(self) -> DocumentList:
        documents = self.db.query(Document).order_by(Document.created_at.desc()).all()
        return DocumentList(documents=[DocumentRead.model_validate(item) for item in documents])

    def get_document(self, document_id: str) -> DocumentRead:
        document = self.db.get(Document, document_id)
        if document is None:
            raise DocumentNotFoundError(f"Document '{document_id}' was not found.")
        return DocumentRead.model_validate(document)

    def get_pages(self, document_id: str) -> DocumentPageList:
        self.get_document(document_id)
        pages = (
            self.db.query(DocumentPage)
            .filter(DocumentPage.document_id == document_id)
            .order_by(DocumentPage.page_number)
            .all()
        )
        return DocumentPageList(
            document_id=document_id,
            pages=[DocumentPageRead.model_validate(page) for page in pages],
        )

    def _mark_failed(self, document_id: str, message: str) -> None:
        self.db.rollback()
        document = self.db.get(Document, document_id)
        if document is not None:
            document.status = DocumentStatus.FAILED
            document.error_message = message
            self.db.commit()
