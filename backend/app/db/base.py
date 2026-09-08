from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models so SQLAlchemy metadata knows about them
from app.models.category import Category
from app.models.cultural_item import CulturalItem
from app.models.media import Media
from app.models.source import Source
from app.models.state import State