import uuid

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SourceCreate(BaseModel):
    cultural_item_id: uuid.UUID
    name: str
    url: str | None = None
    description: str | None = None


class SourceUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    description: str | None = None


class SourceResponse(BaseModel):
    id: uuid.UUID
    cultural_item_id: uuid.UUID
    name: str
    url: str | None = None
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)