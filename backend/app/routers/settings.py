from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.models.database import get_db
from app.models.schema import AppConfig
from app.services import llm_providers
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
    import urllib.request
    import urllib.error
    import json as _json

    hunter, apollo = _resolve_keys(payload)
    result = {}

    if apollo:
        try:
            qb = _json.dumps({
                "api_key": apollo,
                "organization_name": "Stripe",
                "person_titles": ["CEO"],
                "page": 1,
                "per_page": 5,
            }).encode()
            req = urllib.request.Request(
                "https://api.apollo.io/v1/mixed_people/search",
                data=qb,
                headers={"X-Api-Key": apollo, "Content-Type": "application/json"},
                method="POST",
            )
            try:
                resp = urllib.request.urlopen(req, timeout=15)
                data = _json.loads(resp.read())
                people = data.get("people") or []
                if people:
                    p = people[0]
                    email = p.get("email")
                    if not email and isinstance(p.get("contact_emails"), list) and p["contact_emails"]:
                        email = p["contact_emails"][0]
                    result["apollo"] = {"ok": bool(email), "email": email}
                else:
                    result["apollo"] = {"ok": False, "error": "no_people"}
            except urllib.error.HTTPError as he:
                msg = he.read().decode("utf-8", "ignore")
                ec = None
                try:
                    ec = _json.loads(msg).get("error_code")
                except Exception:
                    pass
                if ec == "API_INACCESSIBLE" or he.code == 403:
                    result["apollo"] = {
                        "ok": False,
                        "error": "plan_limited",
                        "message": "Apollo Free plan blocks email lookup. Add a Hunter key or upgrade Apollo.",
                    }
                elif he.code == 401:
                    result["apollo"] = {"ok": False, "error": "invalid_key"}
                else:
                    result["apollo"] = {"ok": False, "error": f"http_{he.code}"}
        except Exception as e:  # noqa: BLE001
            result["apollo"] = {"ok": False, "error": str(e)}
    else:
        result["apollo"] = {"ok": False, "error": "no_key"}

    if hunter:
        try:
            h = _hunter_lookup(guess_domain("Stripe"), hunter)
            result["hunter"] = {"ok": bool(h), "email": h}
        except urllib.error.HTTPError as he:
            if he.code == 401:
                result["hunter"] = {"ok": False, "error": "invalid_key"}
            elif he.code == 429:
                result["hunter"] = {"ok": False, "error": "quota_exceeded"}
            else:
                result["hunter"] = {"ok": False, "error": f"http_{he.code}"}
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


# --- LLM provider settings ---------------------------------------------------
# Settings → AI Model Provider: pick any supported LLM vendor, paste its API
# key, optionally override model / base URL, and run a live connectivity test.
# Keys are stored server-side in app_config and never returned in full.

class LLMSettingsUpdate(BaseModel):
    provider: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None
    base_url: Optional[str] = None


@router.get("/llm")
def get_llm_settings():
    return llm_providers.public_settings()


@router.put("/llm")
def update_llm_settings(payload: LLMSettingsUpdate):
    try:
        return llm_providers.save_settings(
            provider=payload.provider,
            api_key=payload.api_key,
            model=payload.model,
            base_url=payload.base_url,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def _friendly_llm_error(exc: Exception) -> str:
    text = str(exc)
    lowered = text.lower()
    if "api key" in lowered or "unauthorized" in lowered or "401" in text or "authentication" in lowered:
        return "invalid_key"
    if "429" in text or "rate limit" in lowered or "quota" in lowered:
        return "quota_exceeded"
    if "connect" in lowered or "timed out" in lowered or "timeout" in lowered or "name or service" in lowered or "temporary failure" in lowered or "getaddrinfo" in lowered:
        return "network_unreachable"
    if "model" in lowered and ("not found" in lowered or "invalid" in lowered or "unknown" in lowered):
        return "model_not_found"
    return "error"


@router.post("/llm/test")
async def test_llm_settings(payload: LLMSettingsUpdate):
    import time as _time

    cfg = llm_providers.resolve_provider(
        payload.provider,
        api_key=payload.api_key,
        model=payload.model,
        base_url=payload.base_url,
    )
    base = {
        "provider": cfg["provider"],
        "label": cfg["label"],
        "model": cfg["model"],
        "baseUrl": cfg["base_url"],
    }
    if cfg.get("requires_key", True) and not cfg.get("api_key"):
        return {
            **base,
            "ok": False,
            "error": "no_key",
            "message": "No API key configured for this provider yet.",
        }

    from app.services.ai_service import AIService

    svc = AIService()
    started = _time.time()
    try:
        reply = await svc._chat_with(
            cfg,
            "You are a connectivity test bot. Reply with exactly one word: ready",
            "ping",
            temperature=0.0,
        )
        return {
            **base,
            "ok": True,
            "latency_ms": round((_time.time() - started) * 1000),
            "reply": (reply or "").strip()[:120],
        }
    except Exception as e:  # noqa: BLE001 - surfaced to the UI verbatim
        return {
            **base,
            "ok": False,
            "error": _friendly_llm_error(e),
            "message": str(e)[:400],
        }
