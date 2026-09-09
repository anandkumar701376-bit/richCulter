import uuid

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StateBase(BaseModel):
    name: str
    code: str
    description: str | None = None


class StateCreate(StateBase):
    pass


class StateUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None


class StateResponse(StateBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)