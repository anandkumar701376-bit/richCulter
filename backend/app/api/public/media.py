import uuid

from fastapi import APIRouter, Depends,HTTPException,status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.media import MediaCreate, MediaResponse,MediaUpdate
from app.services.media_service import (
    create_media,
    get_media_for_item,
    get_media_by_id,
    update_media,
    delete_media,
)

router = APIRouter()


@router.post(
    "",
    response_model=MediaResponse,
    status_code=201,
)
def create_media_item(
    media_data: MediaCreate,
    db: Session = Depends(get_db),
):
    return create_media(db, media_data)


@router.get(
    "/cultural-item/{cultural_item_id}",
    response_model=list[MediaResponse],
)
def get_item_media(
    cultural_item_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return get_media_for_item(db, cultural_item_id)

@router.put("/{media_id}", response_model=MediaResponse)
def update_media_item(
    media_id: uuid.UUID,
    media_data: MediaUpdate,
    db: Session = Depends(get_db),
):
    media = update_media(db, media_id, media_data)

    if media is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    return media


@router.delete("/{media_id}", status_code=204)
def delete_media_item(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    deleted = delete_media(db, media_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    return None