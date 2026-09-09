import uuid

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.state import State
from app.schemas.state import StateCreate, StateUpdate



def get_all_states(db: Session):
    return (
        db.query(State)
        .order_by(State.name)
        .all()
    )


def get_state_by_id(db: Session, state_id: uuid.UUID):
    return (
        db.query(State)
        .filter(State.id == state_id)
        .first()
    )


def create_state(db: Session, state_data: StateCreate):
    state = State(
        name=state_data.name,
        code=state_data.code,
        description=state_data.description,
    )

    db.add(state)

    try:
        db.commit()
        db.refresh(state)
        return state, None

    except IntegrityError as exc:
        db.rollback()

        error_message = str(exc.orig)

        if "states_name_key" in error_message:
            return None, "State with this name already exists"

        if "states_code_key" in error_message:
            return None, "State with this code already exists"

        return None, "State already exists"

def update_state(
    db: Session,
    state_id: uuid.UUID,
    state_data: StateUpdate,
):
    state = get_state_by_id(db, state_id)

    if state is None:
        return None

    update_data = state_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(state, field, value)

    db.commit()
    db.refresh(state)

    return state


def delete_state(db: Session, state_id: uuid.UUID):
    state = get_state_by_id(db, state_id)

    if state is None:
        return False

    db.delete(state)
    db.commit()

    return True