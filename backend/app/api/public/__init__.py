from fastapi import APIRouter
from app.api.public import states
from app.api.public import categories
from app.api.public import cultural_items
from app.api.public import media
from app.api.public import search
from app.api.public import sources



router = APIRouter(prefix="/api")
router = APIRouter(prefix="/api")

router.include_router(states.router, prefix="/states", tags=["States"])
router.include_router(categories.router, prefix="/categories", tags=["Categories"])
router.include_router(cultural_items.router, prefix="/cultural-items", tags=["Cultural Items"])
router.include_router(media.router, prefix="/media", tags=["Media"])
router.include_router(search.router, prefix="/search", tags=["Search"])
router.include_router(sources.router, prefix="/sources", tags=["Sources"])