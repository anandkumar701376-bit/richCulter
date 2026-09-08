import uuid

from sqlalchemy.orm import Session

from app.models.cultural_item import CulturalItem
from app.schemas.cultural_item import CulturalItemCreate


def get_cultural_items(
    db: Session,
    state_id: uuid.UUID | None = None,
    category_id: uuid.UUID | None = None,
):
    query = db.query(CulturalItem)

    if state_id:
        query = query.filter(CulturalItem.state_id == state_id)

    if category_id:
        query = query.filter(CulturalItem.category_id == category_id)

    return query.all()


def get_cultural_item_by_id(
    db: Session,
    cultural_item_id: uuid.UUID,
):
    return (
        db.query(CulturalItem)
        .filter(CulturalItem.id == cultural_item_id)
        .first()
    )


def create_cultural_item(
    db: Session,
    item_data: CulturalItemCreate,
):
    item = CulturalItem(
        state_id=item_data.state_id,
        category_id=item_data.category_id,
        title=item_data.title,
        description=item_data.description,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item

def get_cultural_item_details(
    db: Session,
    cultural_item_id: uuid.UUID,
):
    return (
        db.query(CulturalItem)
        .filter(CulturalItem.id == cultural_item_id)
        .first()
    )