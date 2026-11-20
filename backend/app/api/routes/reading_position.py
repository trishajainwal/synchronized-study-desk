from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..deps import get_db
from ...schemas.reading import ReadingPositionRead, ReadingPositionUpdate
from ...services.errors import ReadingPositionError, SyncSessionNotFoundError
from ...services.reading_position import ReadingPositionRepository

router = APIRouter(prefix="/api/sessions/{session_id}/reading-position", tags=["synchronization"])


@router.get("", response_model=ReadingPositionRead | None)
def get_reading_position(
    session_id: str,
    document_id: str,
    db: Session = Depends(get_db),
) -> ReadingPositionRead | None:
    return ReadingPositionRepository(db).get(session_id, document_id)


@router.put("", response_model=ReadingPositionRead)
def put_reading_position(
    session_id: str,
    data: ReadingPositionUpdate,
    db: Session = Depends(get_db),
) -> ReadingPositionRead:
    try:
        return ReadingPositionRepository(db).upsert(session_id, data)
    except SyncSessionNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ReadingPositionError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
