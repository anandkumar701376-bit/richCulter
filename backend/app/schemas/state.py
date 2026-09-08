from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StateBase(BaseModel):
    name: str
    code: str
    description: str | None = None


class StateResponse(StateBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)