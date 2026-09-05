from fastapi import FastAPI

app = FastAPI(
    title="Rich Culture API",
    description="API for Indian cultural heritage",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "Rich Culture API is running!"
    }