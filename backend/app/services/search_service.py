import uuid

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.cultural_item import CulturalItem
from app.models.state import State
from app.models.category import Category


def search_cultural_items(
    db: Session,
    query: str | None = None,
    state_id: uuid.UUID | None = None,
    category_id: uuid.UUID | None = None,
    page: int = 1,
    limit: int = 20,
):
    items_query = (
        db.query(CulturalItem)
        .join(State, CulturalItem.state_id == State.id)
        .join(Category, CulturalItem.category_id == Category.id)
    )

    # ---------------------------------------------
    # TEXT SEARCH
    # ---------------------------------------------

    if query:
        search_term = f"%{query.strip()}%"

        items_query = items_query.filter(
            or_(
                CulturalItem.title.ilike(search_term),
                CulturalItem.description.ilike(search_term),
                State.name.ilike(search_term),
                State.code.ilike(search_term),
                Category.name.ilike(search_term),
            )
        )

    # ---------------------------------------------
    # STATE FILTER
    # ---------------------------------------------

    if state_id:
        items_query = items_query.filter(
            CulturalItem.state_id == state_id
        )

    # ---------------------------------------------
    # CATEGORY FILTER
    # ---------------------------------------------

    if category_id:
        items_query = items_query.filter(
            CulturalItem.category_id == category_id
        )

    # ---------------------------------------------
    # TOTAL RESULTS
    # ---------------------------------------------

    total = items_query.count()

    # ---------------------------------------------
    # PAGINATION
    # ---------------------------------------------

    offset = (page - 1) * limit

    items = (
        items_query
        .order_by(CulturalItem.title)
        .offset(offset)
        .limit(limit)
        .all()
    )

    return items, total