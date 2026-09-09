import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.state import (
    StateCreate,
    StateUpdate,
    StateResponse,
)

from app.services.state_service import (
    get_all_states,
    get_state_by_id,
    create_state,
    update_state,
    delete_state,
)


router = APIRouter(
    tags=["States"],
)


@router.get("", response_model=list[StateResponse])
def read_states(
    db: Session = Depends(get_db),
):
    return get_all_states(db)


@router.get("/{state_id}", response_model=StateResponse)
def read_state(
    state_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    state = get_state_by_id(db, state_id)

    if state is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="State not found",
        )

    return state


@router.post(
    "",
    response_model=StateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_state_item(
    state_data: StateCreate,
    db: Session = Depends(get_db),
):
    state, error = create_state(db, state_data)

    if error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=error,
        )

    return state

@router.put(
    "/{state_id}",
    response_model=StateResponse,
)
def update_state_item(
    state_id: uuid.UUID,
    state_data: StateUpdate,
    db: Session = Depends(get_db),
):
    state = update_state(db, state_id, state_data)

    if state is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="State not found",
        )

    return state


@router.delete(
    "/{state_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_state_item(
    state_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    deleted = delete_state(db, state_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="State not found",
        )

    return None