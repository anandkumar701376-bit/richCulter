import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MediaBase(BaseModel):
    cultural_item_id: uuid.UUID
    media_type: str
    url: str | None = None
    storage_type: str = "external"
    storage_key: str | None = None
    title: str | None = None


class MediaCreate(MediaBase):
    pass

class MediaResponse(MediaBase):
    id: uuid.UUID
    created_at: datetime
    media_url: str | None = None

    model_config = ConfigDict(from_attributes=True)

class MediaUpdate(BaseModel):
    cultural_item_id: uuid.UUID | None = None
    media_type: str | None = None
    url: str | None = None
    storage_type: str | None = None
    storage_key: str | None = None
    title: str | None = None