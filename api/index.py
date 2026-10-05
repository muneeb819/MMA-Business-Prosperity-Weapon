import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app
from app.models.database import create_tables, is_production
from app.models.seed import _ensure_admin_user
from app.models.database import SessionLocal
from mangum import Mangum

# Migrations run as a release step in production. Keep table creation and
# optional admin seeding as a local-development convenience only.
if not is_production():
    create_tables()
    try:
        db = SessionLocal()
        try:
            _ensure_admin_user(db)
        finally:
            db.close()
    except Exception:
        pass

handler = Mangum(app, lifespan="off")
