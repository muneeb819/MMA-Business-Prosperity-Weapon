import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
from app.models.database import create_tables, is_production
from app.models.seed import _ensure_admin_user
from app.models.database import SessionLocal
from mangum import Mangum

_BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))


def _apply_schema() -> None:
    """Bring the database up to date before the first request.

    Production serverless has no release step that could run `alembic upgrade`,
    so migrations run here on cold start (idempotent: Alembic no-ops when the
    schema is already current). A direct `create_tables()` pass follows so any
    table that exists only in the models is never missing at runtime. Local
    development skips Alembic and creates tables directly, as before.
    """
    if is_production():
        try:
            from alembic import command
            from alembic.config import Config

            cfg = Config(os.path.join(_BACKEND_DIR, "alembic.ini"))
            command.upgrade(cfg, "head")
        except Exception as exc:  # pragma: no cover - defensive bootstrap
            print(f"alembic upgrade failed ({exc!r}); applying create_tables()", file=sys.stderr)
    create_tables()


def _ensure_admin() -> None:
    """Create the first superadmin when ADMIN_INITIAL_PASSWORD is configured.

    Idempotent: an existing admin is left untouched. Runs in every environment
    so a fresh production database can actually be logged into.
    """
    try:
        db = SessionLocal()
        try:
            _ensure_admin_user(db)
        finally:
            db.close()
    except Exception as exc:  # pragma: no cover - bootstrap must not crash the app
        print(f"admin bootstrap skipped: {exc!r}", file=sys.stderr)


_apply_schema()
_ensure_admin()

handler = Mangum(app, lifespan="off")
