from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.models.database import get_db
from app.models.schema import AppConfig
from app.services.enrichment import _apollo_lookup, _hunter_lookup, guess_domain

router = APIRouter()

KEYS = ["hunter_api_key", "apollo_api_key"]


class SettingsUpdate(BaseModel):
    hunter_api_key: Optional[str] = None
    apollo_api_key: Optional[str] = None


class SettingsTest(BaseModel):
    hunter_api_key: Optional[str] = None
    apollo_api_key: Optional[str] = None


def _resolve_keys(payload: SettingsTest):
    import os

    hunter = payload.hunter_api_key or os.getenv("HUNTER_API_KEY", "")
    apollo = payload.apollo_api_key or os.getenv("APOLLO_API_KEY", "")
    try:
        from app.models.database import SessionLocal

        db = SessionLocal()
        try:
            for key in ("hunter_api_key", "apollo_api_key"):
                row = db.query(AppConfig).filter(AppConfig.key == key).first()
                if row and row.value:
                    if key == "hunter_api_key" and not hunter:
                        hunter = row.value
                    if key == "apollo_api_key" and not apollo:
                        apollo = row.value
        finally:
            db.close()
    except Exception:  # noqa: BLE001
        pass
    return hunter, apollo


@router.post("/test")
def test_settings(payload: SettingsTest):
    hunter, apollo = _resolve_keys(payload)
    result = {}
    if apollo:
        try:
            a = _apollo_lookup("Stripe", apollo, "CEO")
            result["apollo"] = {"ok": bool(a), "email": (a or {}).get("email")}
        except Exception as e:  # noqa: BLE001
            result["apollo"] = {"ok": False, "error": str(e)}
    else:
        result["apollo"] = {"ok": False, "error": "no_key"}

    if hunter:
        try:
            h = _hunter_lookup(guess_domain("Stripe"), hunter)
            result["hunter"] = {"ok": bool(h), "email": h}
        except Exception as e:  # noqa: BLE001
            result["hunter"] = {"ok": False, "error": str(e)}
    else:
        result["hunter"] = {"ok": False, "error": "no_key"}
    return result


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
