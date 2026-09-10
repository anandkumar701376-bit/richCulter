from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db


from app.schemas.cultural_item import (
    CulturalItemResponse,
    CulturalItemCreate,
    CulturalItemUpdate,
    CulturalItemDetailsResponse,
    CulturalItemListResponse,
)


from app.services.cultural_item_service import (
    get_cultural_item_by_id,
    get_cultural_items,
    create_cultural_item,
    get_cultural_item_details,
    update_cultural_item,
    delete_cultural_item,
)

router = APIRouter(
    tags=["Cultural Items"],
)



@router.get(
    "",
    response_model=CulturalItemListResponse,
)
def read_cultural_items(
    state_id: UUID | None = None,
    category_id: UUID | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="page must be greater than or equal to 1",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="limit must be between 1 and 100",
        )

    items, total = get_cultural_items(
        db,
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
    status_code=status.HTTP_201_CREATED,
)
def create_item(
    item_data: CulturalItemCreate,
    db: Session = Depends(get_db),
):
    item, error = create_cultural_item(db, item_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error,
        )

    return item


@router.put(
    "/{item_id}",
    response_model=CulturalItemResponse,
)
def update_item(
    item_id: UUID,
    item_data: CulturalItemUpdate,
    db: Session = Depends(get_db),
):
    item, error = update_cultural_item(
        db,
        item_id,
        item_data,
    )

    if error:
        if error == "Cultural item not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error,
            )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error,
        )

    return item

@router.delete(
    "/{item_id}",
    status_code=204,
)
def delete_item(
    item_id: UUID,
    db: Session = Depends(get_db),
):
    deleted = delete_cultural_item(db, item_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cultural item not found",
        )

    return None