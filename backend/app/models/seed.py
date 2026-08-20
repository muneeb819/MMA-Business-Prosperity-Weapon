from datetime import datetime
from sqlalchemy.orm import Session


def _ensure_admin_user(db: Session):
    from app.routers.auth import UserModel
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    admin = db.query(UserModel).filter(UserModel.email == "admin@mbpw.com").first()
    if not admin:
        import uuid
        admin = UserModel(
            id=str(uuid.uuid4()),
            email="admin@mbpw.com",
            name="Admin",
            role="superadmin",
            hashed_password=pwd_context.hash("admin123"),
            is_active=True,
            created_at=datetime.utcnow(),
        )
        db.add(admin)
        db.commit()


def seed_all(db: Session) -> dict:
    _ensure_admin_user(db)
    return {"message": "Admin user ensured", "skipped": True}
