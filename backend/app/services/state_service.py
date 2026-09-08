from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.state import State


def get_all_states(db: Session) -> list[State]:
    result = db.execute(
        select(State).order_by(State.name)
    )
    return list(result.scalars().all())


def get_state_by_id(
    db: Session,
    state_id: UUID,
) -> State | None:
    result = db.execute(
        select(State).where(State.id == state_id)
    )
    return result.scalar_one_or_none()