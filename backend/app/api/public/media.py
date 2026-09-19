import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.media import (
    MediaCreate,
    MediaResponse,
    MediaUpdate,
)

from app.services.media_service import (
    get_all_media,
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
    validate_external_image_url,
)
from app.models.cultural_item import CulturalItem

router = APIRouter(tags=["Media"])


# ============================================================
# CREATE MEDIA RECORD
# ============================================================
@router.post(
    "",
    response_model=MediaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_media_item(
    media_data: MediaCreate,
    db: Session = Depends(get_db),
):
    # First verify the cultural item exists
    cultural_item = (
        db.query(CulturalItem)
        .filter(
            CulturalItem.id == media_data.cultural_item_id
        )
        .first()
    )

    if cultural_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultural item not found",
        )

    # Then validate external image URL
    if (
        media_data.storage_type == "external"
        and media_data.media_type == "image"
    ):
        if not media_data.url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="External image URL is required",
            )

        try:
            await validate_external_image_url(
                media_data.url
            )
        except ValueError as error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(error),
            )

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
# ============================================================
# GET MEDIA FOR CULTURAL ITEM
# ============================================================

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


# ============================================================
# GET MEDIA BY ID
# ============================================================

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


# ============================================================
# UPDATE MEDIA
# ============================================================

@router.put(
    "/{media_id}",
    response_model=MediaResponse,
)
def update_media_item(
    media_id: uuid.UUID,
    media_data: MediaUpdate,
    db: Session = Depends(get_db),
):
    try:
        media, error = update_media(
            db,
            media_id,
            media_data,
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while updating media",
        )

    if error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error,
        )

    return media_to_response(media)


# ============================================================
# DELETE MEDIA
# ============================================================

@router.delete(
    "/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_media_item(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    try:
        deleted = delete_media(
            db,
            media_id,
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while deleting media",
        )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found",
        )

    return None


# ============================================================
# UPLOAD MEDIA FILE
# ============================================================

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
    file_path = None

    try:

        # ----------------------------------------------------
        # SAVE + VALIDATE FILE
        # ----------------------------------------------------

        file_path, storage_key = await save_media_file(
            file=file,
            media_type=media_type,
        )

        # ----------------------------------------------------
        # CREATE DATABASE DATA
        # ----------------------------------------------------

        media_data = MediaCreate(
            cultural_item_id=cultural_item_id,
            media_type=media_type,
            storage_type="local",
            storage_key=storage_key,
            url=None,
            title=title,
        )

        # ----------------------------------------------------
        # CREATE DATABASE RECORD
        # ----------------------------------------------------

        media, error = create_media(
            db,
            media_data,
        )

        # ----------------------------------------------------
        # EXPECTED SERVICE ERROR
        # ----------------------------------------------------

        if error:

            saved_file = Path(file_path)

            if saved_file.exists():
                saved_file.unlink()

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error,
            )

    except HTTPException:
        raise

    # --------------------------------------------------------
    # FILE VALIDATION ERROR
    # --------------------------------------------------------

    except ValueError as exc:

        # If validation fails after a file was created,
        # remove the file.
        if file_path:
            saved_file = Path(file_path)

            if saved_file.exists():
                saved_file.unlink()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    # --------------------------------------------------------
    # DATABASE ERROR
    # --------------------------------------------------------

    except SQLAlchemyError:

        if file_path:
            saved_file = Path(file_path)

            if saved_file.exists():
                saved_file.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while saving media",
        )

    # --------------------------------------------------------
    # UNEXPECTED ERROR
    # --------------------------------------------------------

    except Exception:

        if file_path:
            saved_file = Path(file_path)

            if saved_file.exists():
                saved_file.unlink()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload media",
        )

    # ========================================================
    # MEDIA URL
    # ========================================================

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


# ============================================================
# GET ALL MEDIA
# ============================================================

@router.get(
    "",
    response_model=list[MediaResponse],
)
def get_all_media_items(
    db: Session = Depends(get_db),
):
    media_items = get_all_media(db)

    return [
        media_to_response(media)
        for media in media_items
    ]