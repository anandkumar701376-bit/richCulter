import uuid

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.media import Media
from app.models.cultural_item import CulturalItem
from app.schemas.media import MediaCreate

from app.services.media_storage_service import get_media_url


def get_all_media(db: Session):
    return (
        db.query(Media)
        .order_by(Media.created_at.desc())
        .all()
    )


def get_media_for_item(
    db: Session,
    cultural_item_id: uuid.UUID,
):
    return (
        db.query(Media)
        .filter(Media.cultural_item_id == cultural_item_id)
        .all()
    )


def get_media_by_id(
    db: Session,
    media_id: uuid.UUID,
):
    return (
        db.query(Media)
        .filter(Media.id == media_id)
        .first()
    )


def create_media(
    db: Session,
    media_data: MediaCreate,
):
    # Check whether cultural item exists
    item = (
        db.query(CulturalItem)
        .filter(
            CulturalItem.id == media_data.cultural_item_id
        )
        .first()
    )

    if item is None:
        return None, "Cultural item not found"

    media = Media(
        cultural_item_id=media_data.cultural_item_id,
        media_type=media_data.media_type,
        storage_type=media_data.storage_type,
        storage_key=media_data.storage_key,
        url=media_data.url,
        title=media_data.title,

        # Attribution
        author=media_data.author,
        license=media_data.license,
        license_url=media_data.license_url,
        source_url=media_data.source_url,
    )

    try:
        db.add(media)
        db.commit()
        db.refresh(media)

    except SQLAlchemyError:
        db.rollback()
        raise

    return media, None


def update_media(
    db: Session,
    media_id: uuid.UUID,
    media_data,
):
    media = get_media_by_id(
        db,
        media_id,
    )

    if media is None:
        return None, "Media not found"

    # If cultural_item_id is being changed, validate it
    if media_data.cultural_item_id is not None:
        item = (
            db.query(CulturalItem)
            .filter(
                CulturalItem.id
                == media_data.cultural_item_id
            )
            .first()
        )

        if item is None:
            return None, "Cultural item not found"

    update_data = media_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(media, field, value)

    try:
        db.commit()
        db.refresh(media)

    except SQLAlchemyError:
        db.rollback()
        raise

    return media, None


def delete_media(
    db: Session,
    media_id: uuid.UUID,
):
    media = get_media_by_id(
        db,
        media_id,
    )

    if media is None:
        return False

    try:
        db.delete(media)
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise

    return True


def media_to_response(media: Media):
    return {
        "id": media.id,
        "cultural_item_id": media.cultural_item_id,
        "media_type": media.media_type,
        "url": media.url,
        "storage_type": media.storage_type,
        "storage_key": media.storage_key,
        "title": media.title,

        # Attribution
        "author": media.author,
        "license": media.license,
        "license_url": media.license_url,
        "source_url": media.source_url,

        "created_at": media.created_at,

        "media_url": get_media_url(
            storage_type=media.storage_type,
            storage_key=media.storage_key,
            url=media.url,
        ),
    }