"""Database URL resolution and SQLAlchemy engine setup.

Development keeps a convenient in-memory SQLite fallback. Production must use
an explicitly configured durable PostgreSQL database; silently accepting the
in-memory fallback would lose data between serverless invocations.
"""

from collections.abc import Mapping
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool


def is_production(environ: Mapping[str, str] | None = None) -> bool:
    """Return whether this process is running in a production deployment."""
    env = os.environ if environ is None else environ
    return (
        env.get("ENVIRONMENT", "").strip().lower() in {"prod", "production"}
        or env.get("VERCEL_ENV", "").strip().lower() == "production"
    )


def _resolve_database_url(environ: Mapping[str, str] | None = None) -> str:
    """Resolve explicit or provider-injected database URLs.

    The function accepts a mapping so production safety can be unit tested
    without mutating process-wide environment variables.
    """
    env = os.environ if environ is None else environ
    for key in ("DATABASE_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "POSTGRES_PRISMA_URL"):
        url = env.get(key, "").strip()
        if url:
            if is_production(env) and url.lower().startswith("sqlite"):
                raise RuntimeError(
                    "Production requires a durable PostgreSQL DATABASE_URL; SQLite is not supported."
                )
            return url

    if is_production(env):
        raise RuntimeError(
            "DATABASE_URL (or a supported managed PostgreSQL URL) must be configured in production. "
            "Refusing to start with ephemeral in-memory SQLite."
        )
    return ""


RAW = _resolve_database_url()
if RAW:
    # Normalize legacy provider URL schemes and preserve explicit SQLite paths
    # for development/test use.
    DATABASE_URL = RAW.replace("postgres://", "postgresql://", 1)
    if DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        if DATABASE_URL in {"sqlite://", "sqlite:///:memory:"}:
            engine = create_engine(
                DATABASE_URL,
                connect_args=connect_args,
                poolclass=StaticPool,
            )
        else:
            engine = create_engine(DATABASE_URL, connect_args=connect_args)
    else:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    # Local development only. Production is rejected above if no URL exists.
    DATABASE_URL = "sqlite://"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def create_tables() -> None:
    """Create tables for local development and tests.

    Production schema changes are applied only through Alembic migrations.
    """
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
