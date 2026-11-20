from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..deps import get_db, get_settings
from ...config import Settings
from ...schemas.document import DocumentList, DocumentPageList, DocumentRead
from ...services.documents import DocumentService
from ...services.errors import (
    DocumentNotFoundError,
    DocumentProcessingError,
    InvalidPdfError,
    PdfTooLargeError,
)

router = APIRouter(prefix="/api/documents", tags=["documents"])


def build_service(db: Session, settings: Settings) -> DocumentService:
    return DocumentService(db=db, settings=settings)


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> DocumentRead:
    data = file.file.read()
    service = build_service(db, settings)
    try:
        return service.upload(
            filename=file.filename or "upload.pdf",
            content_type=file.content_type or "",
            data=data,
        )
    except PdfTooLargeError as exc:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(exc)) from exc
    except InvalidPdfError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except DocumentProcessingError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("", response_model=DocumentList)
def list_documents(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> DocumentList:
    return build_service(db, settings).list_documents()


@router.get("/{document_id}/pages", response_model=DocumentPageList)
def get_document_pages(
    document_id: str,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> DocumentPageList:
    try:
        return build_service(db, settings).get_pages(document_id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{document_id}/file")
def get_document_file(
    document_id: str,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> FileResponse:
    service = build_service(db, settings)
    try:
        document = service.get_document(document_id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    path = service.storage.path(document_id)
    if not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF file for document '{document_id}' was not found.",
        )

    return FileResponse(path, media_type="application/pdf", filename=document.original_filename)


@router.get("/{document_id}", response_model=DocumentRead)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> DocumentRead:
    try:
        return build_service(db, settings).get_document(document_id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
