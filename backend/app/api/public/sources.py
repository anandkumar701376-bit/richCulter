import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.source import (
    SourceCreate,
    SourceUpdate,
    SourceResponse,
)

from app.services.source_service import (
    create_source,
    get_sources_for_item,
    get_source_by_id,
    update_source,
    delete_source,
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

@router.put("/{source_id}", response_model=SourceResponse)
def update_source_item(
    source_id: uuid.UUID,
    source_data: SourceUpdate,
    db: Session = Depends(get_db),
):
    source = update_source(db, source_id, source_data)

    if source is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found",
        )

    return source


@router.delete("/{source_id}", status_code=204)
def delete_source_item(
    source_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    deleted = delete_source(db, source_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found",
        )

    return None