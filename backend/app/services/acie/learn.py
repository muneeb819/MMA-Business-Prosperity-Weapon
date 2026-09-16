"""Feedback Intelligence / Learning Engine.

Collects send outcomes (open / reply / bounce / unsubscribe / no-response),
maintains per-provider performance (evidence quality), adjusts the decision
engine's effective provider reliability, drives re-verification/rescore, and
transitions lifecycle on outcomes.

This is a lightweight, deterministic learning model (running inside a single
serverless function) — it observes outcomes and decays trust in providers that
under-deliver, without external ML infra.
"""

from __future__ import annotations

from typing import List, Optional
from datetime import datetime, timedelta, timezone

from app.models.schema import ContactIntel, ProviderPerformance, OutreachFeedback

# Each provider's delivered evidence type -> performance key
KIND_EVENT = {
    "email": ("deliver", "bounce"),
    "phone": ("deliver", "bounce"),
}


def record_outcome(db, lead_id: str, channel: str, outcome: str,
                   provider: str = "", detail: str = "", confidence: float = 0.0) -> None:
    import uuid
    from app.models.schema import OutreachFeedback
    fb = OutreachFeedback(
        id=f"fb-{uuid.uuid4().hex[:12]}",
        lead_id=lead_id, channel=channel, outcome=outcome,
        provider=provider, detail=detail or "",
        confidence_at_time=confidence,
    )
    db.add(fb)

    intel = db.query(ContactIntel).filter(ContactIntel.lead_id == lead_id).first()
    if intel:
        if outcome == "bounce":
            intel.bounce_count = (intel.bounce_count or 0) + 1
            intel.lifecycle = "BOUNCED"
            intel.supply_status = "bounced"
            intel.next_verification = datetime.utcnow() + timedelta(days=3)
        elif outcome in ("unsubscribe", "opt_out"):
            intel.lifecycle = "UNSUBSCRIBED"
            intel.supply_status = "opted_out"
        elif outcome in ("reply_positive", "reply_negative"):
            intel.lifecycle = "REPLIED"
            intel.supply_status = "ok"
        elif outcome == "replied":
            intel.lifecycle = "REPLIED"
        elif outcome in ("sent", "opened"):
            intel.last_contacted = datetime.utcnow()
        elif outcome == "job_change":
            intel.lifecycle = "JOB_CHANGE"
        db.commit()
    db.commit()

    if provider:
        _update_provider_performance(db, provider, outcome)


def _update_provider_performance(db, provider: str, outcome: str) -> None:
    if outcome in ("bounce", "invalid", "verify_fail"):
        return _bump(db, provider, "bounce")
    if outcome in ("reply_positive", "reply_negative", "opened", "deliver"):
        return _bump(db, provider, "deliver")


def _bump(db, provider: str, event_type: str, amount: float = 1.0) -> None:
    row = db.query(ProviderPerformance).filter(
        ProviderPerformance.provider == provider,
        ProviderPerformance.event_type == event_type,
    ).first()
    if not row:
        row = ProviderPerformance(provider=provider, event_type=event_type, count=0, weighted=0.0)
        db.add(row)
    row.count = (row.count or 0) + 1
    row.weighted = (row.weighted or 0) + amount
    db.commit()


def provider_reliability(db, provider: str) -> float:
    """0..1 reliability for a provider from deliver vs bounce ratio (decay)."""
    try:
        d = db.query(ProviderPerformance).filter(
            ProviderPerformance.provider == provider,
            ProviderPerformance.event_type == "deliver",
        ).first()
        b = db.query(ProviderPerformance).filter(
            ProviderPerformance.provider == provider,
            ProviderPerformance.event_type == "bounce",
        ).first()
        deliver = (d.weighted if d else 0)
        bounce = (b.weighted if b else 0)
        if deliver == 0 and bounce == 0:
            return 0.5
        ratio = deliver / max(1.0, deliver + bounce)
        # newer observation decay: weight recent events more
        if bounce >= 3:
            ratio = max(0.0, ratio - 0.15)
        return round(ratio, 3)
    except Exception:
        return 0.5


def effective_reliability(db, providers: List[str]) -> float:
    if not providers:
        return 0.5
    rels = [provider_reliability(db, p) for p in providers]
    return round(sum(rels) / len(rels), 3)


def due_for_reverify(intel: ContactIntel) -> bool:
    return bool(intel.next_verification and intel.next_verification <= datetime.utcnow())


def maybe_requeue_stale(db, window_days: int = 120) -> int:
    """Mark stale contacts and schedule re-verification."""
    cutoff = datetime.utcnow() - timedelta(days=window_days)
    rows = db.query(ContactIntel).filter(
        ContactIntel.last_contacted.op("<")(cutoff),
        ContactIntel.supply_status == "ok",
    ).all()
    for r in rows:
        r.lifecycle = "STALE"
        r.next_verification = datetime.utcnow() + timedelta(days=1)
        db.add(r)
    db.commit()
    return len(rows)
