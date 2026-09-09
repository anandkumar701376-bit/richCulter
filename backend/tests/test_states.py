from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_states():
    response = client.get("/api/states")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0


def test_get_state_by_id():
    response = client.get("/api/states")

    assert response.status_code == 200

    states = response.json()
    state_id = states[0]["id"]

    response = client.get(f"/api/states/{state_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == state_id


def test_get_nonexistent_state():
    invalid_id = str(uuid4())

    response = client.get(f"/api/states/{invalid_id}")

    assert response.status_code == 404


def test_create_state():
    unique_code = f"T{uuid4().hex[:8]}"

    response = client.post(
        "/api/states",
        json={
            "name": f"Test State {unique_code}",
            "code": unique_code,
            "description": "Automated test state",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["code"] == unique_code

    # Save ID so we can clean it up.
    state_id = data["id"]

    delete_response = client.delete(
        f"/api/states/{state_id}"
    )

    assert delete_response.status_code == 204


def test_update_state():
    unique_code = f"U{uuid4().hex[:8]}" 

    create_response = client.post(
        "/api/states",
        json={
            "name": f"Update State {unique_code}",
            "code": unique_code,
            "description": "Before update",
        },
    )

    assert create_response.status_code == 201

    state_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/states/{state_id}",
        json={
            "name": f"Updated State {unique_code}",
            "description": "After update",
        },
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["id"] == state_id
    assert data["name"] == f"Updated State {unique_code}"
    assert data["description"] == "After update"

    # Cleanup
    delete_response = client.delete(
        f"/api/states/{state_id}"
    )

    assert delete_response.status_code == 204


def test_delete_nonexistent_state():
    invalid_id = str(uuid4())

    response = client.delete(
        f"/api/states/{invalid_id}"
    )

    assert response.status_code == 404
    

def test_create_duplicate_state():
    unique_code = f"D{uuid4().hex[:8]}"
    unique_name = f"Duplicate State {uuid4().hex[:8]}"

    first_response = client.post(
        "/api/states",
        json={
            "name": unique_name,
            "code": unique_code,
            "description": "Duplicate test",
        },
    )

    assert first_response.status_code == 201

    state_id = first_response.json()["id"]

    # Try creating the same state again.
    duplicate_response = client.post(
        "/api/states",
        json={
            "name": unique_name,
            "code": unique_code,
            "description": "Duplicate test",
        },
    )

    assert duplicate_response.status_code == 409
    assert "already exists" in duplicate_response.json()["detail"]

    # Cleanup
    delete_response = client.delete(
        f"/api/states/{state_id}"
    )

    assert delete_response.status_code == 204