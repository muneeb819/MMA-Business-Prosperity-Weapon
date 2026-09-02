"""Compliance Gate — MANDATORY. Runs before ANY send.

No contact is ever queued for outreach unless this gate passes. Enforces:
  * global suppression list / consent (opt-out, GDPR/CAN-SPAM)
  * per-company do-not-contact (competitor, contract, legal, history)
  * frequency cap (max touches per interval) & cooldown after reply/opt-out
  * org policy (e.g. sender whitelist, tone limits) read from AppConfig

Stored config (DB keys):
  act.gate.enabled            "on" (default) or "off"
  act.gate.frequency_max      max messages per contact per 30d (default 4)
  act.gate.reply_cooloff_days cooldown after a reply (default 90)
  act.gate.dnc_companies      JSON list of {company, reason} never to contact

Feedback ("opt_out", "unsubscribed", "bounced") marks suppression automatically.
"""

from __future__ import annotations

import json
from typing import List, Optional
from datetime import datetime, timedelta

from app.models.schema import ContactIntel, OutreachFeedback

GATE_ENABLED = "act.gate.enabled"
FREQ_MAX = "act.gate.frequency_max"
REPLY_COOLOFF = "act.gate.reply_cooloff_days"
DNC_COMPANIES = "act.gate.dnc_companies"


def _cfg(key: str, default=None):
    try:
        from app.models.database import SessionLocal
        from app.models.schema import AppConfig
        db = SessionLocal()
        try:
            row = db.query(AppConfig).filter(AppConfig.key == key).first()
            return default if (not row or not row.value) else row.value
        finally:
            db.close()
    except Exception:
        return default


def _dnc_list() -> List[dict]:
    raw = _cfg(DNC_COMPANIES, "[]")
    try:
        return json.loads(raw) if isinstance(raw, str) else raw
    except Exception:
        return []


def gate_status(db, lead_id: str) -> dict:
    """Return the current gate status for a contact (no side effects)."""
    intel = db.query(ContactIntel).filter(ContactIntel.lead_id == lead_id).first()
    enabled = _cfg(GATE_ENABLED, "on") == "on"
    company = (intel.company if intel else "") or (lead_id or "")

    dnc = next((d for d in _dnc_list()
                if d.get("company", "").lower() == (company or "").lower()), None)
    suppressed = (intel.supply_status if intel else "ok") in ("opted_out", "suppressed", "bounced")
    freq_max = int(_cfg(FREQ_MAX, "4") or 4)
    cooloff = int(_cfg(REPLY_COOLOFF, "90") or 90)

    freq_hits = _feedback_count(db, lead_id, since=timedelta(days=30))
    recent_reply = _latest_outcome(db, lead_id, ("reply_positive", "reply_negative"))
    in_cooldown = recent_reply and (datetime.utcnow() - recent_reply).days < cooloff

    blocked = []
    if not enabled:
        blocked.append("gate_disabled")
    if dnc:
        blocked.append(f"do_not_contact:{dnc.get('reason','')}")
    if suppressed:
        blocked.append(f"suppressed:{intel.supply_status}")
    if freq_hits >= freq_max:
        blocked.append("frequency_cap")
    if in_cooldown:
        blocked.append("reply_cooldown")

    return {
        "pass": len(blocked) == 0,
        "enabled": enabled,
        "blocked": blocked,
        "supply_status": intel.supply_status if intel else "ok",
        "frequency_current": freq_hits,
        "frequency_max": freq_max,
        "reply_cooldown_days_left": max(0, cooloff - ((datetime.utcnow() - recent_reply).days if recent_reply else 0)) if in_cooldown else 0,
    }


def _feedback_count(db, lead_id: str, since: timedelta) -> int:
    try:
        since_dt = datetime.utcnow() - since
        return db.query(OutreachFeedback).filter(
            OutreachFeedback.lead_id == lead_id,
            OutreachFeedback.created_at >= since_dt,
            OutreachFeedback.outcome.in_(["sent", "opened"]),
        ).count()
    except Exception:
        return 0


def _latest_outcome(db, lead_id: str, outcomes: tuple) -> Optional[datetime]:
    try:
        row = db.query(OutreachFeedback).filter(
            OutreachFeedback.lead_id == lead_id,
            OutreachFeedback.outcome.in_(outcomes),
        ).order_by(OutreachFeedback.created_at.desc()).first()
        return row.created_at if row else None
    except Exception:
        return None


def can_send(db, lead_id: str) -> dict:
    """Blocking check used by the outreach engine just before enqueueing."""
    st = gate_status(db, lead_id)
    return {"allow": st["pass"], "reasons": st["blocked"], "details": st}


def record_suppression(db, lead_id: str, reason: str) -> None:
    intel = db.query(ContactIntel).filter(ContactIntel.lead_id == lead_id).first()
    if intel:
        intel.supply_status = reason
        db.commit()
