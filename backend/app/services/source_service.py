import uuid

from sqlalchemy.orm import Session

from app.models.source import Source
from app.schemas.source import SourceCreate


def get_sources_for_item(db: Session, cultural_item_id: uuid.UUID):
    return (
        db.query(Source)
        .filter(Source.cultural_item_id == cultural_item_id)
        .all()
    )


def get_source_by_id(db: Session, source_id: uuid.UUID):
    return (
        db.query(Source)
        .filter(Source.id == source_id)
        .first()
    )


def create_source(db: Session, source_data: SourceCreate):
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


def update_source(db: Session, source_id: uuid.UUID, source_data):
    source = get_source_by_id(db, source_id)

    if source is None:
        return None

    update_data = source_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(source, field, value)

    db.commit()
    db.refresh(source)

    return source


def delete_source(db: Session, source_id: uuid.UUID):
    source = get_source_by_id(db, source_id)

    if source is None:
        return False

    db.delete(source)
    db.commit()

    return True