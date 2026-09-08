import uuid

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.cultural_item import CulturalItem


def search_cultural_items(
    db: Session,
    query: str | None = None,
    state_id: uuid.UUID | None = None,
    category_id: uuid.UUID | None = None,
):
    items_query = db.query(CulturalItem)

    if query:
        search_term = f"%{query}%"

        items_query = items_query.filter(
            or_(
                CulturalItem.title.ilike(search_term),
                CulturalItem.description.ilike(search_term),
            )
        )

    if state_id:
        items_query = items_query.filter(
            CulturalItem.state_id == state_id
        )

    if category_id:
        items_query = items_query.filter(
            CulturalItem.category_id == category_id
        )

    return items_query.order_by(CulturalItem.title).all()