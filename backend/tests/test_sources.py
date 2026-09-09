from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

INVALID_UUID = "00000000-0000-0000-0000-000000000001"


def get_existing_cultural_item_id():
    response = client.get("/api/cultural-items")

    assert response.status_code == 200

    items = response.json()

    assert len(items) > 0

    return items[0]["id"]


def test_get_sources_for_nonexistent_cultural_item():
    response = client.get(
        f"/api/sources/cultural-item/{INVALID_UUID}"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_create_source_invalid_cultural_item():
    response = client.post(
        "/api/sources",
        json={
            "cultural_item_id": INVALID_UUID,
            "name": "Test Source",
            "url": "https://example.com",
            "description": "Validation test",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Cultural item not found"


def test_create_source():
    cultural_item_id = get_existing_cultural_item_id()

    response = client.post(
        "/api/sources",
        json={
            "cultural_item_id": cultural_item_id,
            "name": "Automated Test Source",
            "url": "https://example.com/source",
            "description": "Source test",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["cultural_item_id"] == cultural_item_id
    assert data["name"] == "Automated Test Source"

    source_id = data["id"]

    # Cleanup
    delete_response = client.delete(
        f"/api/sources/{source_id}"
    )

    assert delete_response.status_code == 204


def test_get_source_by_id():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/sources",
        json={
            "cultural_item_id": cultural_item_id,
            "name": "Get Test Source",
            "url": "https://example.com/get",
            "description": "Get test",
        },
    )

    assert create_response.status_code == 201

    source_id = create_response.json()["id"]

    response = client.get(
        f"/api/sources/{source_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == source_id

    # Cleanup
    delete_response = client.delete(
        f"/api/sources/{source_id}"
    )

    assert delete_response.status_code == 204


def test_update_source():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/sources",
        json={
            "cultural_item_id": cultural_item_id,
            "name": "Before Update",
            "url": "https://example.com/before",
            "description": "Before",
        },
    )

    assert create_response.status_code == 201

    source_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/sources/{source_id}",
        json={
            "name": "After Update",
            "url": "https://example.com/after",
            "description": "After",
        },
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["id"] == source_id
    assert data["name"] == "After Update"
    assert data["url"] == "https://example.com/after"
    assert data["description"] == "After"

    # Cleanup
    delete_response = client.delete(
        f"/api/sources/{source_id}"
    )

    assert delete_response.status_code == 204


def test_update_source_invalid_cultural_item():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/sources",
        json={
            "cultural_item_id": cultural_item_id,
            "name": "Invalid Parent Test",
            "url": "https://example.com/invalid",
            "description": "Invalid parent test",
        },
    )

    assert create_response.status_code == 201

    source_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/sources/{source_id}",
        json={
            "cultural_item_id": INVALID_UUID,
        },
    )

    assert update_response.status_code == 404
    assert update_response.json()["detail"] == "Cultural item not found"

    # Cleanup
    delete_response = client.delete(
        f"/api/sources/{source_id}"
    )

    assert delete_response.status_code == 204


def test_delete_source():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/sources",
        json={
            "cultural_item_id": cultural_item_id,
            "name": "Delete Test Source",
            "url": "https://example.com/delete",
            "description": "Delete test",
        },
    )

    assert create_response.status_code == 201

    source_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/api/sources/{source_id}"
    )

    assert delete_response.status_code == 204

    get_response = client.get(
        f"/api/sources/{source_id}"
    )

    assert get_response.status_code == 404


def test_delete_nonexistent_source():
    response = client.delete(
        f"/api/sources/{INVALID_UUID}"
    )

    assert response.status_code == 404