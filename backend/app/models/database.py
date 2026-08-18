from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    # Vercel serverless: use in-memory SQLite
    DATABASE_URL = "sqlite://"
    connect_args = {}
elif DATABASE_URL.startswith("sqlite"):
    DATABASE_URL = "sqlite:///./mbpw.db"
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

_seeded = False


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_if_needed():
    global _seeded
    if _seeded:
        return
    from app.models.seed import seed_all
    db = SessionLocal()
    try:
        result = seed_all(db)
        if not result.get("skipped"):
            _seeded = True
    finally:
        db.close()
        _seeded = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
