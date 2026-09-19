from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)

INVALID_UUID = "00000000-0000-0000-0000-000000000001"

TEST_IMAGE_URL = (
    "https://example.com/test-image.jpg"
)


def get_existing_cultural_item_id():
    response = client.get("/api/cultural-items")

    assert response.status_code == 200

    data = response.json()

    items = data["items"]

    assert len(items) > 0

    return items[0]["id"]


def test_create_media_invalid_cultural_item():
    response = client.post(
        "/api/media",
        json={
            "cultural_item_id": INVALID_UUID,
            "media_type": "image",
            "url": TEST_IMAGE_URL,
            "storage_type": "external",
            "storage_key": None,
            "title": "Test",
        },
    )

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Cultural item not found"


@patch(
    "app.api.public.media.validate_external_image_url",
    new_callable=AsyncMock,
)
def test_create_media(mock_validate):
    cultural_item_id = get_existing_cultural_item_id()

    response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": TEST_IMAGE_URL,
            "storage_type": "external",
            "storage_key": None,
            "title": "Automated Test Media",
            "author": "Test Author",
            "license": "Test License",
            "license_url": "https://example.com/license",
            "source_url": "https://example.com/source",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["cultural_item_id"] == cultural_item_id
    assert data["media_type"] == "image"
    assert data["storage_type"] == "external"
    assert data["url"] == TEST_IMAGE_URL
    assert data["media_url"] == TEST_IMAGE_URL
    assert data["title"] == "Automated Test Media"

    assert data["author"] == "Test Author"
    assert data["license"] == "Test License"
    assert data["license_url"] == "https://example.com/license"
    assert data["source_url"] == "https://example.com/source"

    mock_validate.assert_awaited_once_with(TEST_IMAGE_URL)


@patch(
    "app.api.public.media.validate_external_image_url",
    new_callable=AsyncMock,
)
def test_get_media_by_id(mock_validate):
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": TEST_IMAGE_URL,
            "storage_type": "external",
            "storage_key": None,
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
    assert data["cultural_item_id"] == cultural_item_id
    assert data["url"] == TEST_IMAGE_URL
    assert data["media_url"] == TEST_IMAGE_URL


@patch(
    "app.api.public.media.validate_external_image_url",
    new_callable=AsyncMock,
)
def test_update_media(mock_validate):
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": TEST_IMAGE_URL,
            "storage_type": "external",
            "storage_key": None,
            "title": "Before Update",
        },
    )

    assert create_response.status_code == 201

    media_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/media/{media_id}",
        json={
            "title": "After Update",
        },
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["id"] == media_id
    assert data["title"] == "After Update"


@patch(
    "app.api.public.media.validate_external_image_url",
    new_callable=AsyncMock,
)
def test_update_media_invalid_cultural_item(mock_validate):
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": TEST_IMAGE_URL,
            "storage_type": "external",
            "storage_key": None,
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

    data = update_response.json()

    assert data["detail"] == "Cultural item not found"


@patch(
    "app.api.public.media.validate_external_image_url",
    new_callable=AsyncMock,
)
def test_delete_media(mock_validate):
    cultural_item_id = get_existing_cultural_item_id()

    create_response = client.post(
        "/api/media",
        json={
            "cultural_item_id": cultural_item_id,
            "media_type": "image",
            "url": TEST_IMAGE_URL,
            "storage_type": "external",
            "storage_key": None,
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