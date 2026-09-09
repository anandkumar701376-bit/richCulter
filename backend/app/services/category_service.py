import uuid

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_all_categories(db: Session):
    return (
        db.query(Category)
        .order_by(Category.name)
        .all()
    )


def get_category_by_id(db: Session, category_id: uuid.UUID):
    return (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

def create_category(db: Session, category_data: CategoryCreate):
    category = Category(
        name=category_data.name,
        description=category_data.description,
    )

    db.add(category)

    try:
        db.commit()
        db.refresh(category)
        return category, None

    except IntegrityError:
        db.rollback()
        return None, "Category with this name already exists"

def update_category(
    db: Session,
    category_id: uuid.UUID,
    category_data: CategoryUpdate,
):
    category = get_category_by_id(db, category_id)

    if category is None:
        return None

    update_data = category_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category


def delete_category(db: Session, category_id: uuid.UUID):
    category = get_category_by_id(db, category_id)

    if category is None:
        return False

    db.delete(category)
    db.commit()

    return True