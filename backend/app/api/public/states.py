from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.state import StateResponse
from app.services.state_service import (
    get_all_states,
    get_state_by_id,
)


router = APIRouter(
    prefix="/states",
    tags=["States"],
)


@router.get(
    "",
    response_model=list[StateResponse],
)
def read_states(
    db: Session = Depends(get_db),
):
    return get_all_states(db)


@router.get(
    "/{state_id}",
    response_model=StateResponse,
)
def read_state(
    state_id: UUID,
    db: Session = Depends(get_db),
):
    state = get_state_by_id(db, state_id)

    if state is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="State not found",
        )

    return state