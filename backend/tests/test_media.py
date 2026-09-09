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


def test_get_media_for_nonexistent_cultural_item():
    response = client.get(
        f"/api/media/cultural-item/{INVALID_UUID}"
    )

    assert response.status_code == 200
    assert response.json() == []


def test_create_media_invalid_cultural_item():
    response = client.post(
        "/api/media",
        json={
            "cultural_item_id": INVALID_UUID,
            "media_type": "image",
            "url": "https://example.com/test.jpg",
            "title": "Test",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Cultural item not found"


def test_create_media():
    cultural_item_id = get_existing_cultural_item_id()

    response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": "https://example.com/test-media.jpg",
            "title": "Automated Test Media",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["cultural_item_id"] == cultural_item_id
    assert data["media_type"] == "image"
    assert data["url"] == "https://example.com/test-media.jpg"

    return data["id"]


def test_get_media_by_id():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": "https://example.com/get-test.jpg",
            "title": "Get Test Media",
        },
    )

    assert create_response.status_code == 201

    media_id = create_response.json()["id"]

    response = client.get(
        f"/api/media/{media_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == media_id

    # Cleanup
    delete_response = client.delete(
        f"/api/media/{media_id}"
    )

    assert delete_response.status_code == 204


def test_update_media():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": "https://example.com/before.jpg",
            "title": "Before Update",
        },
    )

    assert create_response.status_code == 201

    media_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/media/{media_id}",
        json={
            "url": "https://example.com/after.jpg",
            "title": "After Update",
        },
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["id"] == media_id
    assert data["url"] == "https://example.com/after.jpg"
    assert data["title"] == "After Update"

    # Cleanup
    delete_response = client.delete(
        f"/api/media/{media_id}"
    )

    assert delete_response.status_code == 204


def test_delete_media():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": "https://example.com/delete-test.jpg",
            "title": "Delete Test Media",
        },
    )

    assert create_response.status_code == 201

    media_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/api/media/{media_id}"
    )

    assert delete_response.status_code == 204

    get_response = client.get(
        f"/api/media/{media_id}"
    )

    assert get_response.status_code == 404


def test_update_media_invalid_cultural_item():
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": "https://example.com/invalid-parent.jpg",
            "title": "Invalid Parent Test",
        },
    )

    assert create_response.status_code == 201

    media_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/media/{media_id}",
        json={
            "cultural_item_id": INVALID_UUID,
        },
    )

    assert update_response.status_code == 404
    assert update_response.json()["detail"] == "Cultural item not found"

    # Cleanup
    delete_response = client.delete(
        f"/api/media/{media_id}"
    )

    assert delete_response.status_code == 204


def test_delete_nonexistent_media():
    response = client.delete(
        f"/api/media/{INVALID_UUID}"
    )

    assert response.status_code == 404