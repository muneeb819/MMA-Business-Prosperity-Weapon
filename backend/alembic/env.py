from logging.config import fileConfig
from pathlib import Path
import sys

from alembic import context
from sqlalchemy import engine_from_config, pool

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Ensure the backend package is importable whether Alembic is invoked from the
# repository root or from backend/.
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.models.database import Base, _normalize_database_url, _resolve_database_url, is_production  # noqa: E402
import app.models.schema  # noqa: F401,E402 — register business tables
import app.routers.auth  # noqa: F401,E402 — register users/sessions/audit logs

# Use the application's resolver so Alembic honors either DATABASE_URL or
# the secure SQLSERVER_* environment settings. For local work, use a persistent
# SQLite file rather than the in-memory application fallback.
url = _resolve_database_url()
if not url:
    if is_production():
        raise RuntimeError("A durable database URL is required for production migrations.")
    url = "sqlite:///./mbpw.db"
url = _normalize_database_url(url)
config.set_main_option("sqlalchemy.url", url.replace("%", "%%"))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
