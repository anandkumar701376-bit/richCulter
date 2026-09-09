import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

from app.services.category_service import (
    get_all_categories,
    get_category_by_id,
    create_category,
    update_category,
    delete_category,
)


router = APIRouter(
    tags=["Categories"],
)

@router.get("", response_model=list[CategoryResponse])
def read_categories(
    db: Session = Depends(get_db),
):
    return get_all_categories(db)


@router.get("/{category_id}", response_model=CategoryResponse)
def read_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    category = get_category_by_id(db, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category_item(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
):
    category, error = create_category(
        db,
        category_data,
    )

    if error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=error,
        )

    return category
@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_category_item(
    category_id: uuid.UUID,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
):
    category = update_category(db, category_id, category_data)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_category_item(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    deleted = delete_category(db, category_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return None