from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.public import router as public_router
from app.core.config import MEDIA_ROOT




app = FastAPI(
    title="Culture API",
    description="Indian Cultural Heritage Platform API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.29.234:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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