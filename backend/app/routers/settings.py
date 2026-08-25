from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.models.database import get_db
from app.models.schema import AppConfig

router = APIRouter()

KEYS = ["hunter_api_key", "apollo_api_key"]


class SettingsUpdate(BaseModel):
    hunter_api_key: Optional[str] = None
    apollo_api_key: Optional[str] = None


def _mask(value: str) -> str:
    if not value:
        return ""
    return ("*" * max(0, len(value) - 4)) + value[-4:]


@router.get("/")
def get_settings(db: Session = Depends(get_db)):
    out = {}
    for k in KEYS:
        row = db.query(AppConfig).filter(AppConfig.key == k).first()
        v = row.value if row else ""
        out[k] = {"set": bool(v), "masked": _mask(v) if v else ""}
    return out


@router.put("/")
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    for k in KEYS:
        v = getattr(payload, k)
        if v is None:
            continue
        row = db.query(AppConfig).filter(AppConfig.key == k).first()
        if not row:
            row = AppConfig(key=k)
            db.add(row)
        row.value = v
    db.commit()
    return {"ok": True}
