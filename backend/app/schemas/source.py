import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SourceBase(BaseModel):
    cultural_item_id: uuid.UUID
    name: str
    url: str | None = None
    description: str | None = None


class SourceCreate(SourceBase):
    pass


class SourceResponse(SourceBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)