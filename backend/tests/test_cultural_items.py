from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

INVALID_UUID = "00000000-0000-0000-0000-000000000001"


def get_existing_state_id():
    response = client.get("/api/states")
    assert response.status_code == 200

    states = response.json()
    assert len(states) > 0

    return states[0]["id"]


def get_existing_category_id():
    response = client.get("/api/categories")
    assert response.status_code == 200

    categories = response.json()
    assert len(categories) > 0

    return categories[0]["id"]


def test_get_cultural_items():
    response = client.get("/api/cultural-items")

    assert response.status_code == 200

    data = response.json()

    assert "items" in data
    assert "page" in data
    assert "limit" in data
    assert "total" in data
    assert "pages" in data

    assert data["page"] == 1
    assert data["limit"] == 20
    assert isinstance(data["items"], list)


def test_get_cultural_items_with_pagination():
    response = client.get(
        "/api/cultural-items?page=1&limit=1"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["limit"] == 1
    assert data["total"] >= 0
    assert data["pages"] >= 0
    assert len(data["items"]) <= 1


def test_get_cultural_items_invalid_page():
    response = client.get(
        "/api/cultural-items?page=0&limit=20"
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "page must be greater than or equal to 1"
    )


def test_get_cultural_items_invalid_limit():
    response = client.get(
        "/api/cultural-items?page=1&limit=101"
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "limit must be between 1 and 100"
    )


def test_create_cultural_item_invalid_state():
    category_id = get_existing_category_id()

    response = client.post(
        "/api/cultural-items",
        json={
            "state_id": INVALID_UUID,
            "category_id": category_id,
            "title": "Invalid State Test",
            "description": "Testing invalid state",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "State not found"


def test_create_cultural_item_invalid_category():
    state_id = get_existing_state_id()

    response = client.post(
        "/api/cultural-items",
        json={
            "state_id": state_id,
            "category_id": INVALID_UUID,
            "title": "Invalid Category Test",
            "description": "Testing invalid category",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Category not found"


def test_update_nonexistent_cultural_item():
    response = client.put(
        f"/api/cultural-items/{INVALID_UUID}",
        json={
            "title": "Updated Title",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Cultural item not found"