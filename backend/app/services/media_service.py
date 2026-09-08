import uuid

from sqlalchemy.orm import Session

from app.models.media import Media
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
    media = Media(
        cultural_item_id=media_data.cultural_item_id,
        media_type=media_data.media_type,
        url=media_data.url,
        title=media_data.title,
    )

    db.add(media)
    db.commit()
    db.refresh(media)

    return media


def update_media(db: Session, media_id: uuid.UUID, media_data):
    media = get_media_by_id(db, media_id)

    if media is None:
        return None

    update_data = media_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(media, field, value)

    db.commit()
    db.refresh(media)

    return media


def delete_media(db: Session, media_id: uuid.UUID):
    media = get_media_by_id(db, media_id)

    if media is None:
        return False

    db.delete(media)
    db.commit()

    return True