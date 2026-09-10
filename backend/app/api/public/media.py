import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.media import (
    MediaCreate,
    MediaResponse,
    MediaUpdate,
)

from app.services.media_service import (
    create_media,
    get_media_for_item,
    get_media_by_id,
    update_media,
    delete_media,
    media_to_response,
)

from app.services.media_storage_service import (
    save_media_file,
    get_media_url,
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
    media, error = create_media(
        db,
        media_data,
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error,
        )

    return media_to_response(media)


@router.get(
    "/cultural-item/{cultural_item_id}",
    response_model=list[MediaResponse],
)
def get_item_media(
    cultural_item_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    media_items = get_media_for_item(
        db,
        cultural_item_id,
    )

    return [
        media_to_response(media)
        for media in media_items
    ]


@router.get(
    "/{media_id}",
    response_model=MediaResponse,
)
def get_media_item(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    media = get_media_by_id(
        db,
        media_id,
    )

    if media is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    return media_to_response(media)


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

    return media_to_response(media)


@router.delete(
    "/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_media_item(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    deleted = delete_media(
        db,
        media_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    return None


@router.post(
    "/upload",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_media_file(
    cultural_item_id: uuid.UUID,
    media_type: str,
    title: str | None = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        file_path, storage_key = await save_media_file(
            file=file,
            media_type=media_type,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )

    media_data = MediaCreate(
        cultural_item_id=cultural_item_id,
        media_type=media_type,
        storage_type="local",
        storage_key=storage_key,
        url=None,
        title=title,
    )

    media, error = create_media(
        db,
        media_data,
    )

    if error:
        saved_file = Path(file_path)

        if saved_file.exists():
            saved_file.unlink()

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error,
        )

    media_url = get_media_url(
        storage_type=media.storage_type,
        storage_key=media.storage_key,
        url=media.url,
    )

    return {
        "id": media.id,
        "cultural_item_id": media.cultural_item_id,
        "media_type": media.media_type,
        "url": media.url,
        "storage_type": media.storage_type,
        "storage_key": media.storage_key,
        "title": media.title,
        "created_at": media.created_at,
        "media_url": media_url,
    }