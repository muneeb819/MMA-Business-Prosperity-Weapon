from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
import os


def _resolve_database_url() -> str:
    # 1) Explicit override (preferred for self-hosted / custom Postgres).
    url = os.getenv("DATABASE_URL", "").strip()
    if url:
        return url
    # 2) Vercel Postgres integration env vars (auto-injected when a DB is linked).
    for key in ("POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "POSTGRES_PRISMA_URL"):
        url = os.getenv(key, "").strip()
        if url:
            return url
    return ""


RAW = _resolve_database_url()

if not RAW:
    # Ephemeral in-memory SQLite (Vercel default when no DB is configured).
    DATABASE_URL = "sqlite://"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
elif RAW.startswith("sqlite"):
    DATABASE_URL = "sqlite:///./mbpw.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    # Normalize postgres:// -> postgresql:// for SQLAlchemy.
    DATABASE_URL = RAW.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
