from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..deps import get_db
from ...schemas.annotation import AnnotationCreate, AnnotationList, AnnotationRead, AnnotationUpdate
from ...services.annotations import AnnotationRepository
from ...services.errors import (
    AnnotationError,
    AnnotationNotFoundError,
    SyncSessionNotFoundError,
)

router = APIRouter(prefix="/api/sessions/{session_id}/annotations", tags=["annotations"])


@router.post("", response_model=AnnotationRead, status_code=status.HTTP_201_CREATED)
def create_annotation(
    session_id: str,
    data: AnnotationCreate,
    db: Session = Depends(get_db),
) -> AnnotationRead:
    try:
        return AnnotationRepository(db).create(session_id, data)
    except AnnotationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except SyncSessionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("", response_model=AnnotationList)
def list_annotations(
    session_id: str,
    document_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> AnnotationList:
    try:
        return AnnotationRepository(db).list(session_id, document_id)
    except AnnotationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except SyncSessionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{annotation_id}", response_model=AnnotationRead)
def update_annotation(
    session_id: str,
    annotation_id: str,
    changes: AnnotationUpdate,
    db: Session = Depends(get_db),
) -> AnnotationRead:
    try:
        return AnnotationRepository(db).update(session_id, annotation_id, changes)
    except AnnotationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (AnnotationError, SyncSessionNotFoundError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_annotation(
    session_id: str,
    annotation_id: str,
    db: Session = Depends(get_db),
) -> None:
    try:
        AnnotationRepository(db).delete(session_id, annotation_id)
    except AnnotationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
