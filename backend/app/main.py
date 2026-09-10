from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.public import router as public_router
from app.core.config import MEDIA_ROOT


app = FastAPI(
    title="Culture API",
    description="Indian Cultural Heritage Platform API",
    version="1.0.0",
)


app.mount(
    "/media",
    StaticFiles(directory=MEDIA_ROOT),
    name="media",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(
    public_router,
)