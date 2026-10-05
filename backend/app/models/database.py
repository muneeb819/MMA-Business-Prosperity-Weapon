"""Database URL resolution and SQLAlchemy engine setup.

Development keeps a convenient in-memory SQLite fallback. Production requires
an explicitly configured durable PostgreSQL or Microsoft SQL Server database;
silently accepting the in-memory fallback would lose data between serverless
invocations.
"""

from collections.abc import Mapping
import os

from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

SQLSERVER_DEFAULT_DATABASE = "MMA_Business_Prosperity_Weapon"


def is_production(environ: Mapping[str, str] | None = None) -> bool:
    """Return whether this process is running in a production deployment."""
    env = os.environ if environ is None else environ
    return (
        env.get("ENVIRONMENT", "").strip().lower() in {"prod", "production"}
        or env.get("VERCEL_ENV", "").strip().lower() == "production"
    )


def _normalize_database_url(url: str) -> str:
    """Normalize common SQLAlchemy URL aliases without exposing credentials."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    if url.startswith("mssql://"):
        # This project ships pymssql; do not fall through to the pyodbc default.
        return url.replace("mssql://", "mssql+pymssql://", 1)
    return url


def _build_sqlserver_url(environ: Mapping[str, str]) -> str:
    """Build a correctly escaped pymssql URL from provider environment values."""
    host = environ.get("SQLSERVER_HOST", "").strip()
    username = environ.get("SQLSERVER_USER", "")
    password = environ.get("SQLSERVER_PASSWORD", "")
    database = environ.get("SQLSERVER_DATABASE", SQLSERVER_DEFAULT_DATABASE).strip()
    configured = any(
        environ.get(key, "").strip()
        for key in ("SQLSERVER_HOST", "SQLSERVER_USER", "SQLSERVER_PASSWORD", "SQLSERVER_DATABASE")
    )
    if not configured:
        return ""

    missing = [
        key
        for key, value in (
            ("SQLSERVER_HOST", host),
            ("SQLSERVER_USER", username),
            ("SQLSERVER_PASSWORD", password),
            ("SQLSERVER_DATABASE", database),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(
            "Incomplete SQL Server configuration; set " + ", ".join(missing) +
            " in the deployment's secure environment."
        )

    try:
        port = int(environ.get("SQLSERVER_PORT", "1433"))
    except ValueError as exc:
        raise RuntimeError("SQLSERVER_PORT must be a valid TCP port number.") from exc
    if not 1 <= port <= 65535:
        raise RuntimeError("SQLSERVER_PORT must be between 1 and 65535.")

    encryption = environ.get("SQLSERVER_ENCRYPTION", "require").strip().lower()
    if encryption not in {"require", "request", "off"}:
        raise RuntimeError("SQLSERVER_ENCRYPTION must be require, request, or off.")
    if is_production(environ) and encryption != "require":
        raise RuntimeError("Production SQL Server connections require SQLSERVER_ENCRYPTION=require.")

    url = URL.create(
        "mssql+pymssql",
        username=username,
        password=password,
        host=host,
        port=port,
        database=database,
        query={"charset": environ.get("SQLSERVER_CHARSET", "utf8"), "encryption": encryption},
    )
    return url.render_as_string(hide_password=False)


def _resolve_database_url(environ: Mapping[str, str] | None = None) -> str:
    """Resolve explicit or provider-injected database URLs.

    The function accepts a mapping so production safety can be unit tested
    without mutating process-wide environment variables. An explicit
    `DATABASE_URL` wins; otherwise split SQLSERVER_* settings are preferred
    over any provider-injected PostgreSQL variables.
    """
    env = os.environ if environ is None else environ
    url = env.get("DATABASE_URL", "").strip()
    if not url:
        url = _build_sqlserver_url(env)
    if not url:
        for key in ("POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "POSTGRES_PRISMA_URL"):
            url = env.get(key, "").strip()
            if url:
                break

    if url:
        url = _normalize_database_url(url)
        parsed = make_url(url)
        if is_production(env):
            driver = parsed.drivername
            is_durable_supported = (
                driver in {"postgresql", "postgresql+psycopg2"}
                or driver == "mssql+pymssql"
            )
            if not is_durable_supported:
                raise RuntimeError(
                    "Production DATABASE_URL must use synchronous PostgreSQL "
                    "(postgresql or postgresql+psycopg2) or Microsoft SQL Server "
                    "(mssql+pymssql); SQLite and unsupported drivers are refused."
                )
            if driver == "mssql+pymssql":
                if not all((parsed.host, parsed.database, parsed.username, parsed.password)):
                    raise RuntimeError(
                        "Production SQL Server DATABASE_URL must include a host, database, "
                        "SQL login, and password. Configure SQL authentication in the secret store."
                    )
                if parsed.query.get("encryption", "").lower() != "require":
                    raise RuntimeError(
                        "Production SQL Server DATABASE_URL must set encryption=require."
                    )
        return url

    if is_production(env):
        raise RuntimeError(
            "Production requires DATABASE_URL, a supported managed PostgreSQL URL, or complete "
            "SQLSERVER_HOST/SQLSERVER_USER/SQLSERVER_PASSWORD settings. Refusing to start with SQLite."
        )
    return ""


RAW = _resolve_database_url()
if RAW:
    DATABASE_URL = _normalize_database_url(RAW)
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
    elif DATABASE_URL.startswith("mssql+pymssql://"):
        # SQL Server may close idle serverless connections; recycle pooled
        # connections before its usual idle timeout and verify them on checkout.
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=900)
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
