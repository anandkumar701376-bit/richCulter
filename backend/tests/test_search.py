from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_search_cultural_items():
    response = client.get("/api/search")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)


def test_search_no_results():
    response = client.get(
        "/api/search",
        params={"q": "THIS_SHOULD_NOT_EXIST_123456"},
    )

    assert response.status_code == 200
    assert response.json() == []