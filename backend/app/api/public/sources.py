import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.source import SourceCreate, SourceResponse
from app.services.source_service import (
    create_source,
    get_sources_for_item,
)

router = APIRouter()


@router.post(
    "",
    response_model=SourceResponse,
    status_code=201,
)
def create_source_item(
    source_data: SourceCreate,
    db: Session = Depends(get_db),
):
    return create_source(db, source_data)


@router.get(
    "/cultural-item/{cultural_item_id}",
    response_model=list[SourceResponse],
)
def get_item_sources(
    cultural_item_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    return get_sources_for_item(db, cultural_item_id)