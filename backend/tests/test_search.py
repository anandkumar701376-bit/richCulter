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


def get_existing_cultural_item():
    response = client.get("/api/cultural-items")

    assert response.status_code == 200

    items = response.json()["items"]

    assert len(items) > 0

    return items[0]


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


def test_search_by_existing_title():
    item = get_existing_cultural_item()

    response = client.get(
        "/api/search",
        params={"q": item["title"]},
    )

    assert response.status_code == 200

    results = response.json()

    assert isinstance(results, list)

    assert any(
        result["id"] == item["id"]
        for result in results
    )


def test_search_by_description():
    item = get_existing_cultural_item()

    if not item.get("description"):
        return

    search_text = item["description"][:10]

    response = client.get(
        "/api/search",
        params={"q": search_text},
    )

    assert response.status_code == 200

    results = response.json()

    assert isinstance(results, list)

    assert any(
        result["id"] == item["id"]
        for result in results
    )


def test_search_by_state():
    state_id = get_existing_state_id()

    response = client.get(
        "/api/search",
        params={"state_id": state_id},
    )

    assert response.status_code == 200

    results = response.json()

    assert isinstance(results, list)

    for result in results:
        assert result["state_id"] == state_id


def test_search_by_category():
    category_id = get_existing_category_id()

    response = client.get(
        "/api/search",
        params={"category_id": category_id},
    )

    assert response.status_code == 200

    results = response.json()

    assert isinstance(results, list)

    for result in results:
        assert result["category_id"] == category_id


def test_search_by_state_and_category():
    state_id = get_existing_state_id()
    category_id = get_existing_category_id()

    response = client.get(
        "/api/search",
        params={
            "state_id": state_id,
            "category_id": category_id,
        },
    )

    assert response.status_code == 200

    results = response.json()

    assert isinstance(results, list)

    for result in results:
        assert result["state_id"] == state_id
        assert result["category_id"] == category_id


def test_search_by_query_and_state():
    item = get_existing_cultural_item()

    response = client.get(
        "/api/search",
        params={
            "q": item["title"],
            "state_id": item["state_id"],
        },
    )

    assert response.status_code == 200

    results = response.json()

    assert isinstance(results, list)

    for result in results:
        assert result["state_id"] == item["state_id"]


def test_search_by_query_and_category():
    item = get_existing_cultural_item()

    response = client.get(
        "/api/search",
        params={
            "q": item["title"],
            "category_id": item["category_id"],
        },
    )

    assert response.status_code == 200

    results = response.json()

    assert isinstance(results, list)

    for result in results:
        assert result["category_id"] == item["category_id"]


def test_search_invalid_state():
    response = client.get(
        "/api/search",
        params={"state_id": INVALID_UUID},
    )

    assert response.status_code == 200
    assert response.json() == []


def test_search_invalid_category():
    response = client.get(
        "/api/search",
        params={"category_id": INVALID_UUID},
    )

    assert response.status_code == 200
    assert response.json() == []