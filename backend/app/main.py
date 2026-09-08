from fastapi import FastAPI


from app.api.public import router as public_router
app = FastAPI(
    title="Culture API",
    description="Indian Cultural Heritage Platform API",
    version="1.0.0",
)

app.include_router(
    public_router,
)