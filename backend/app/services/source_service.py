import uuid

from sqlalchemy.orm import Session

from app.models.source import Source
from app.schemas.source import SourceCreate


def get_sources_for_item(
    db: Session,
    cultural_item_id: uuid.UUID,
):
    return (
        db.query(Source)
        .filter(Source.cultural_item_id == cultural_item_id)
        .all()
    )


def create_source(
    db: Session,
    source_data: SourceCreate,
):
    source = Source(
        cultural_item_id=source_data.cultural_item_id,
        name=source_data.name,
        url=source_data.url,
        description=source_data.description,
    )

    db.add(source)
    db.commit()
    db.refresh(source)

    return source