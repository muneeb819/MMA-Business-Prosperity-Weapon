import os
from datetime import datetime
from sqlalchemy.orm import Session


def _ensure_admin_user(db: Session):
    """Create the initial superadmin account if none exists yet.

    The password is NEVER a hardcoded default: it must be supplied via the
    ADMIN_INITIAL_PASSWORD environment variable. If it is not set, admin
    bootstrap is skipped entirely (an operator must create the first user
    via /api/auth/register and promote them through the admin API instead).
    """
    from app.routers.auth import UserModel
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    admin_email = os.getenv("ADMIN_EMAIL", "admin@mbpw.com")
    admin_password = os.getenv("ADMIN_INITIAL_PASSWORD")

    admin = db.query(UserModel).filter(UserModel.email == admin_email).first()
    if admin:
        return

    if not admin_password:
        # No default credentials are ever created. Set ADMIN_INITIAL_PASSWORD
        # (a strong, unique secret) in the environment to bootstrap the first
        # superadmin account.
        return

    import uuid
    admin = UserModel(
        id=str(uuid.uuid4()),
        email=admin_email,
        name="Admin",
        role="superadmin",
        hashed_password=pwd_context.hash(admin_password),
        is_active=True,
        created_at=datetime.utcnow(),
    )
    db.add(admin)
    db.commit()


def seed_all(db: Session) -> dict:
    _ensure_admin_user(db)
    return {"message": "Admin user ensured (if ADMIN_INITIAL_PASSWORD was set)", "skipped": True}
