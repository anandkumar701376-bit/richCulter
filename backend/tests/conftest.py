import os
import uuid

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.db.session import get_db
from app.main import app

load_dotenv()

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

if not TEST_DATABASE_URL:
    raise RuntimeError("TEST_DATABASE_URL is not set")

test_engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True,
)

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    # Import all models before creating tables.
    from app.models import (
        category,
        cultural_item,
        media,
        source,
        state,
    )

    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()

    try:
        # Import models used for test seed data.
        from app.models.category import Category
        from app.models.state import State

        # Seed one state.
        test_state = State(
            id=uuid.uuid4(),
            name="Test State",
            code="TS",
            description="State used for automated tests.",
        )

        # Seed categories required by the existing tests.
        test_categories = [
            Category(
                id=uuid.uuid4(),
                name="Test Heritage",
                description="Test heritage category.",
            ),
            Category(
                id=uuid.uuid4(),
                name="Test Festival",
                description="Test festival category.",
            ),
            Category(
                id=uuid.uuid4(),
                name="Test Arts",
                description="Test arts category.",
            ),
        ]

        db.add(test_state)
        db.add_all(test_categories)
        db.commit()

    finally:
        db.close()

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()

    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()