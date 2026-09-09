import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.cultural_item import CulturalItemResponse

from app.services.search_service import search_cultural_items


router = APIRouter(
    tags=["Search"],
)


@router.get(
    "",
    response_model=list[CulturalItemResponse],
)
def search_items(
    q: str | None = None,
    state_id: uuid.UUID | None = None,
    category_id: uuid.UUID | None = None,
    db: Session = Depends(get_db),
):
    return search_cultural_items(
        db,
        query=q,
        state_id=state_id,
        category_id=category_id,
    )