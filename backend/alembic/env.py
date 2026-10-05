from logging.config import fileConfig
from pathlib import Path
import os
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

from app.models.database import Base, is_production  # noqa: E402
import app.models.schema  # noqa: F401,E402 — register business tables
import app.routers.auth  # noqa: F401,E402 — register users/sessions/audit logs

# Use the same provider-aware URL resolution as the application. For local
# migration work, use the persistent ./mbpw.db file rather than an in-memory DB.
url = os.getenv("DATABASE_URL", "").strip()
if not url:
    for key in ("POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "POSTGRES_PRISMA_URL"):
        url = os.getenv(key, "").strip()
        if url:
            break
if not url:
    if is_production():
        # Importing app.models.database already rejects this case; keep the
        # migration command's requirement explicit as a second guard.
        raise RuntimeError("DATABASE_URL is required to run production migrations.")
    url = "sqlite:///./mbpw.db"
url = url.replace("postgres://", "postgresql://", 1)
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
