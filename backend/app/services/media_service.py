import uuid

from sqlalchemy.orm import Session

from app.models.media import Media
from app.schemas.media import MediaCreate


def get_media_for_item(
    db: Session,
    cultural_item_id: uuid.UUID,
):
    return (
        db.query(Media)
        .filter(Media.cultural_item_id == cultural_item_id)
        .all()
    )


def create_media(
    db: Session,
    media_data: MediaCreate,
):
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