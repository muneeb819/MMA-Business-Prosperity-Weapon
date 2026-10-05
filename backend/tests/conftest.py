"""Shared isolated API/database fixtures for the backend test suite."""

import os
from pathlib import Path
import sys

# Keep tests on an isolated in-memory database and make backend imports stable
# from both the repository root and backend/.
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.pop("VERCEL_ENV", None)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.database import Base, engine


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(reset_database):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def db(reset_database):
    from app.models.database import SessionLocal

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
