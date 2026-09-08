from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.cultural_item import (
    CulturalItemResponse,
    CulturalItemCreate,
    CulturalItemDetailsResponse,
)

from app.services.cultural_item_service import (
    get_cultural_item_by_id,
    get_cultural_items,
    create_cultural_item,
    get_cultural_item_details,
)


router = APIRouter(
    prefix="/cultural-items",
    tags=["Cultural Items"],
)


@router.get(
    "",
    response_model=list[CulturalItemResponse],
)
def read_cultural_items(
    state_id: UUID | None = None,
    category_id: UUID | None = None,
    db: Session = Depends(get_db),
):
    return get_cultural_items(
        db,
        state_id=state_id,
        category_id=category_id,
    )


@router.get(
    "/{item_id}/details",
    response_model=CulturalItemDetailsResponse,
)
def get_item_details(
    item_id: UUID,
    db: Session = Depends(get_db),
):
    item = get_cultural_item_details(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultural item not found",
        )

    return item


@router.get(
    "/{item_id}",
    response_model=CulturalItemResponse,
)
def read_cultural_item(
    item_id: UUID,
    db: Session = Depends(get_db),
):
    item = get_cultural_item_by_id(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultural item not found",
        )

    return item


@router.post(
    "",
    response_model=CulturalItemResponse,
    status_code=201,
)
def create_item(
    item_data: CulturalItemCreate,
    db: Session = Depends(get_db),
):
    return create_cultural_item(db, item_data)