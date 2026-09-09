import uuid

from sqlalchemy.orm import Session

from app.models.media import Media
from app.models.cultural_item import CulturalItem
from app.schemas.media import MediaCreate


def get_media_for_item(db: Session, cultural_item_id: uuid.UUID):
    return (
        db.query(Media)
        .filter(Media.cultural_item_id == cultural_item_id)
        .all()
    )


def get_media_by_id(db: Session, media_id: uuid.UUID):
    return (
        db.query(Media)
        .filter(Media.id == media_id)
        .first()
    )


def create_media(db: Session, media_data: MediaCreate):
    # Check whether cultural item exists
    item = (
        db.query(CulturalItem)
        .filter(CulturalItem.id == media_data.cultural_item_id)
        .first()
    )

    if item is None:
        return None, "Cultural item not found"

    media = Media(
        cultural_item_id=media_data.cultural_item_id,
        media_type=media_data.media_type,
        url=media_data.url,
        title=media_data.title,
    )

    db.add(media)
    db.commit()
    db.refresh(media)

    return media, None


def update_media(db: Session, media_id: uuid.UUID, media_data):
    media = get_media_by_id(db, media_id)

    if media is None:
        return None, "Media not found"

    # If cultural_item_id is being changed, validate it
    if media_data.cultural_item_id is not None:
        item = (
            db.query(CulturalItem)
            .filter(CulturalItem.id == media_data.cultural_item_id)
            .first()
        )

        if item is None:
            return None, "Cultural item not found"

    update_data = media_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(media, field, value)

    db.commit()
    db.refresh(media)

    return media, None


def delete_media(db: Session, media_id: uuid.UUID):
    media = get_media_by_id(db, media_id)

    if media is None:
        return False

    db.delete(media)
    db.commit()

    return True