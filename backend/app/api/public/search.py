import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.cultural_item import (
    CulturalItemListResponse,
)

from app.services.search_service import search_cultural_items


router = APIRouter(
    tags=["Search"],
)


@router.get(
    "",
    response_model=CulturalItemListResponse,
)
def search_items(
    q: str | None = None,
    state_id: uuid.UUID | None = None,
    category_id: uuid.UUID | None = None,
    page: int = Query(
        default=1,
        ge=1,
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    items, total = search_cultural_items(
        db,
        query=q,
        state_id=state_id,
        category_id=category_id,
        page=page,
        limit=limit,
    )

    pages = (total + limit - 1) // limit

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": pages,
    }