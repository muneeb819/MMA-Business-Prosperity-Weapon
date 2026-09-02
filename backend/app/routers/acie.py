"""ACIE Router — /api/acie/* endpoints for the contact intelligence engine."""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.database import SessionLocal
from app.models.schema import Lead, ContactIntel, ProviderPerformance, OutreachFeedback
from app.services.acie.pipeline import run_pipeline
from app.services.acie.compliance import can_send
from app.services.acie.learn import record_outcome, provider_reliability, due_for_reverify
from app.services.acie.providers.registry import configured_status
from app.routers.auth import get_current_user

router = APIRouter(tags=["acie"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/run/{lead_id}")
def acie_run(lead_id: str, force: bool = Query(False), db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(404, "Lead not found")
    return run_pipeline(db, lead, force=force)


@router.get("/decision/{lead_id}")
def acie_decision(lead_id: str, db: Session = Depends(get_db)):
    intel = db.query(ContactIntel).filter(ContactIntel.lead_id == lead_id).first()
    if not intel:
        raise HTTPException(404, "No ACIE record for lead")
    return {
        "lead_id": intel.lead_id,
        "company": intel.company,
        "email": intel.email,
        "phone": intel.phone,
        "channel": intel.channel,
        "confidence": intel.contact_confidence,
        "lifecycle": intel.lifecycle,
        "supply_status": intel.supply_status,
        "verification_status": intel.verification_status,
        "tier": "HIGH" if intel.contact_confidence >= 90 else ("MEDIUM" if intel.contact_confidence >= 75 else "LOW"),
        "gate_pass": intel.supply_status == "ok",
        "next_verification": intel.next_verification,
        "profile": intel.profile,
    }


@router.post("/feedback")
def acie_feedback(
    lead_id: str,
    channel: str,
    outcome: str,
    provider: str = "",
    detail: str = "",
    db: Session = Depends(get_db),
):
    intel = db.query(ContactIntel).filter(ContactIntel.lead_id == lead_id).first()
    conf = intel.contact_confidence if intel else 0.0
    record_outcome(db, lead_id, channel, outcome, provider, detail, conf)
    return {"status": "recorded"}


@router.get("/gate/{lead_id}")
def acie_gate(lead_id: str, db: Session = Depends(get_db)):
    return can_send(db, lead_id)


@router.get("/providers/status")
def acie_providers_status():
    return configured_status()


@router.get("/providers/performance")
def acie_providers_performance(db: Session = Depends(get_db)):
    rows = db.query(ProviderPerformance).all()
    out = {}
    for r in rows:
        out.setdefault(r.provider, {})[r.event_type] = {"count": r.count, "weighted": r.weighted}
    return {"performance": out}


@router.get("/due-reverify")
def acie_due_reverify(db: Session = Depends(get_db)):
    rows = db.query(ContactIntel).filter(ContactIntel.next_verification.isnot(None)).all()
    due = [r.lead_id for r in rows if due_for_reverify(r)]
    return {"due_count": len(due), "lead_ids": due}