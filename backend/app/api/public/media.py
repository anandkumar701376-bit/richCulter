import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.media import MediaCreate, MediaResponse, MediaUpdate
from app.services.media_service import (
    create_media,
    get_media_for_item,
    get_media_by_id,
    update_media,
    delete_media,
)

router = APIRouter(tags=["Media"])


@router.post(
    "",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_media_item(
    media_data: MediaCreate,
    db: Session = Depends(get_db),
):
    media, error = create_media(db, media_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error,
        )

    return media


@router.get(
    "/cultural-item/{cultural_item_id}",
    response_model=list[MediaResponse],
)
def get_item_media(
    cultural_item_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return get_media_for_item(db, cultural_item_id)


@router.get(
    "/{media_id}",
    response_model=MediaResponse,
)
def get_media_item(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    media = get_media_by_id(db, media_id)

    if media is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    return media

@router.put(
    "/{media_id}",
    response_model=MediaResponse,
)
def update_media_item(
    media_id: uuid.UUID,
    media_data: MediaUpdate,
    db: Session = Depends(get_db),
):
    media, error = update_media(
        db,
        media_id,
        media_data,
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error,
        )

    return media


@router.delete(
    "/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
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