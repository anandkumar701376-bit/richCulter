import uuid

from sqlalchemy.orm import Session

from app.models.cultural_item import CulturalItem
from app.schemas.cultural_item import CulturalItemCreate
from app.schemas.cultural_item import CulturalItemCreate, CulturalItemUpdate

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
    

def update_cultural_item(
    db: Session,
    cultural_item_id: uuid.UUID,
    item_data: CulturalItemUpdate,
):
    item = get_cultural_item_by_id(db, cultural_item_id)

    if item is None:
        return None

    if item_data.state_id is not None:
        item.state_id = item_data.state_id

    if item_data.category_id is not None:
        item.category_id = item_data.category_id

    if item_data.title is not None:
        item.title = item_data.title

    if item_data.description is not None:
        item.description = item_data.description

    db.commit()
    db.refresh(item)

    return item



def delete_cultural_item(
    db: Session,
    cultural_item_id: uuid.UUID,
):
    item = get_cultural_item_by_id(db, cultural_item_id)

    if item is None:
        return False

    db.delete(item)
    db.commit()

    return True