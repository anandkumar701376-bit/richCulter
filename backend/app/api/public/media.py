import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.media import MediaCreate, MediaResponse
from app.services.media_service import (
    create_media,
    get_media_for_item,
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