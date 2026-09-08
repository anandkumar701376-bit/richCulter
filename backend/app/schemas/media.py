import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MediaBase(BaseModel):
    cultural_item_id: uuid.UUID
    media_type: str
    url: str
    title: str | None = None


class MediaCreate(MediaBase):
    pass


class MediaResponse(MediaBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
    

class MediaUpdate(BaseModel):
    media_type: str | None = None
    url: str | None = None
    title: str | None = None