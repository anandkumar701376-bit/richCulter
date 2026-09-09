import uuid

from sqlalchemy.orm import Session

from app.models.source import Source
from app.models.cultural_item import CulturalItem
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
    # Check whether cultural item exists
    item = (
        db.query(CulturalItem)
        .filter(CulturalItem.id == source_data.cultural_item_id)
        .first()
    )

    if item is None:
        return None, "Cultural item not found"

    source = Source(
        cultural_item_id=source_data.cultural_item_id,
        name=source_data.name,
        url=source_data.url,
        description=source_data.description,
    )

    db.add(source)
    db.commit()
    db.refresh(source)

    return source, None


def update_source(db: Session, source_id: uuid.UUID, source_data):
    source = get_source_by_id(db, source_id)

    if source is None:
        return None, "Source not found"

    # Validate cultural item if it is being changed
    if source_data.cultural_item_id is not None:
        item = (
            db.query(CulturalItem)
            .filter(
                CulturalItem.id == source_data.cultural_item_id
            )
            .first()
        )

        if item is None:
            return None, "Cultural item not found"

    update_data = source_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(source, field, value)

    db.commit()
    db.refresh(source)

    return source, None


def delete_source(db: Session, source_id: uuid.UUID):
    source = get_source_by_id(db, source_id)

    if source is None:
        return False

    db.delete(source)
    db.commit()

    return True