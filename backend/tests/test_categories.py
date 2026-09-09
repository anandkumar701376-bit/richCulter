from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_categories():
    response = client.get("/api/categories")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0


def test_get_category_by_id():
    response = client.get("/api/categories")

    assert response.status_code == 200

    categories = response.json()
    category_id = categories[0]["id"]

    response = client.get(
        f"/api/categories/{category_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == category_id


def test_get_nonexistent_category():
    invalid_id = str(uuid4())

    response = client.get(
        f"/api/categories/{invalid_id}"
    )

    assert response.status_code == 404


def test_create_category():
    unique_name = f"Test Category {uuid4().hex[:8]}"

    response = client.post(
        "/api/categories",
        json={
            "name": unique_name,
            "description": "Automated test category",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == unique_name

    category_id = data["id"]

    # Cleanup
    delete_response = client.delete(
        f"/api/categories/{category_id}"
    )

    assert delete_response.status_code == 204


def test_update_category():
    unique_name = f"Update Category {uuid4().hex[:8]}"

    create_response = client.post(
        "/api/categories",
        json={
            "name": unique_name,
            "description": "Before update",
        },
    )

    assert create_response.status_code == 201

    category_id = create_response.json()["id"]

    updated_name = f"Updated Category {uuid4().hex[:8]}"

    update_response = client.put(
        f"/api/categories/{category_id}",
        json={
            "name": updated_name,
            "description": "After update",
        },
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["id"] == category_id
    assert data["name"] == updated_name
    assert data["description"] == "After update"

    # Cleanup
    delete_response = client.delete(
        f"/api/categories/{category_id}"
    )

    assert delete_response.status_code == 204


def test_delete_nonexistent_category():
    invalid_id = str(uuid4())

    response = client.delete(
        f"/api/categories/{invalid_id}"
    )

    assert response.status_code == 404
    

def test_create_duplicate_category():
    unique_name = f"Duplicate Category {uuid4().hex[:8]}"

    first_response = client.post(
        "/api/categories",
        json={
            "name": unique_name,
            "description": "Duplicate test",
        },
    )

    assert first_response.status_code == 201

    category_id = first_response.json()["id"]

    duplicate_response = client.post(
        "/api/categories",
        json={
            "name": unique_name,
            "description": "Duplicate test",
        },
    )

    assert duplicate_response.status_code == 409
    assert "already exists" in duplicate_response.json()["detail"]

    # Cleanup
    delete_response = client.delete(
        f"/api/categories/{category_id}"
    )

    assert delete_response.status_code == 204