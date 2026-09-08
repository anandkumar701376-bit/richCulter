from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.cultural_item import CulturalItemResponse
from app.services.search_service import search_cultural_items


router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


@router.get(
    "",
    response_model=list[CulturalItemResponse],
)
def search(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
):
    return search_cultural_items(db, q)