from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryResponse


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.get(
    "",
    response_model=list[CategoryResponse],
)
def read_categories(
    db: Session = Depends(get_db),
):
    result = db.execute(
        select(Category).order_by(Category.name)
    )

    return list(result.scalars().all())