from datetime import datetime
import uuid

from pydantic import BaseModel, ConfigDict


from app.schemas.media import MediaResponse
from app.schemas.source import SourceResponse


class CulturalItemBase(BaseModel):
    state_id: uuid.UUID
    category_id: uuid.UUID
    title: str
    description: str | None = None


class CulturalItemCreate(CulturalItemBase):
    pass


class CulturalItemResponse(CulturalItemBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)\


class CulturalItemDetailsResponse(CulturalItemResponse):
    media: list[MediaResponse] = []
    sources: list[SourceResponse] = []
    

class CulturalItemUpdate(BaseModel):
    state_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    title: str | None = None
    description: str | None = None