import os
import uuid
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.schema import Lead, Outreach, OutreachState, Notification, AppConfig
from app.services import outreach_service, enrichment
from app.services.email_sender import send_email
from app.services.acie.pipeline import run_pipeline
from app.services.acie.compliance import can_send
from app.services.acie.channel import select_channel
from app.services.acie.learn import record_outcome

AUTOMATION_FLAG = "outreach_automation_enabled"


# --------------------------------------------------------------------------- #
# Maintenance
# --------------------------------------------------------------------------- #
def _cleanup_orphans(db: Session):
    """Delete OutreachState rows whose lead no longer exists."""
    valid_lead_ids = {l.id for l in db.query(Lead.id).all()}
    orphans = [
        s.lead_id for s in db.query(OutreachState).all()
        if s.lead_id not in valid_lead_ids
    ]
    if orphans:
        db.query(OutreachState).filter(OutreachState.lead_id.in_(orphans)).delete(
            synchronize_session=False
        )
        db.commit()


# --------------------------------------------------------------------------- #
# Config helpers
# --------------------------------------------------------------------------- #
def _get_config(db: Session, key: str, default: str) -> str:
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    return row.value if row else default


def _set_config(db: Session, key: str, value: str):
    row = db.query(AppConfig).filter(AppConfig.key == key).first()
    if row:
        row.value = value
    else:
        db.add(AppConfig(key=key, value=value))
    db.commit()


def is_enabled(db: Session) -> bool:
    return _get_config(db, AUTOMATION_FLAG, "true").lower() == "true"


def set_enabled(db: Session, enabled: bool):
    _set_config(db, AUTOMATION_FLAG, "true" if enabled else "false")


# --------------------------------------------------------------------------- #
# State management
# --------------------------------------------------------------------------- #
def get_or_enroll(db: Session, lead_id: str) -> OutreachState:
    st = db.query(OutreachState).filter(OutreachState.lead_id == lead_id).first()
    if not st:
        st = OutreachState(
            lead_id=lead_id, enrolled=True, current_step=-1,
            status="active", next_due_at=datetime.utcnow(),
        )
        db.add(st)
        db.flush()
    return st


def enroll(db: Session, lead_id: str | None = None):
    if lead_id:
        st = db.query(OutreachState).filter(OutreachState.lead_id == lead_id).first()
        if not st:
            db.add(OutreachState(
                lead_id=lead_id, enrolled=True, current_step=-1,
                status="active", next_due_at=datetime.utcnow(),
            ))
        else:
            st.enrolled = True
            st.status = "active"
        db.commit()
        return {"enrolled": lead_id}

    count = 0
    for lead in db.query(Lead).all():
        if not db.query(OutreachState).filter(OutreachState.lead_id == lead.id).first():
            db.add(OutreachState(
                lead_id=lead.id, enrolled=True, current_step=-1,
                status="active", next_due_at=datetime.utcnow(),
            ))
            count += 1
    db.commit()
    return {"enrolled": "all", "added": count}


def set_paused(db: Session, lead_id: str, paused: bool):
    st = db.query(OutreachState).filter(OutreachState.lead_id == lead_id).first()
    if not st:
        st = OutreachState(
            lead_id=lead_id,
            enrolled=not paused,
            current_step=-1,
            status="paused" if paused else "active",
            next_due_at=datetime.utcnow(),
        )
        db.add(st)
    else:
        st.status = "paused" if paused else "active"
        st.enrolled = not paused
    db.commit()
    return {"lead_id": lead_id, "status": st.status}


# --------------------------------------------------------------------------- #
# Scheduling
# --------------------------------------------------------------------------- #
def compute_next_due(state: OutreachState, cadence, now: datetime | None = None) -> datetime | None:
    now = now or datetime.utcnow()
    if state.last_sent_at is None or state.current_step < 0:
        return now  # Day 0 is due immediately
    if state.current_step >= len(cadence) - 1:
        return None
    cur_day = cadence[state.current_step]["day"]
    nxt_day = cadence[state.current_step + 1]["day"]
    gap = max(0, nxt_day - cur_day)
    return state.last_sent_at + timedelta(days=gap)


# --------------------------------------------------------------------------- #
# Sending a single step
# --------------------------------------------------------------------------- #
def send_step(db: Session, lead: Lead, step_index: int, custom_note: str = ""):
    # Run ACIE pipeline to get the decision object
    decision = run_pipeline(db, lead)
    intel_decision = decision.get("decision", {})
    
    # ACIE compliance gate - MANDATORY
    gate = can_send(db, lead.id)
    if not gate["allow"]:
        return {"ok": False, "reason": f"gate_blocked:{gate['reasons']}", "channel": None}

    # ACIE channel selection - use the ACIE-recommended channel
    # CADENCE provides step goal/label, ACIE provides the verified channel
    msg = outreach_service.build_dynamic_message(lead, step_index, custom_note)
    channel = intel_decision.get("channel") or "email"
    target_email = intel_decision.get("email") or lead.email
    company = lead.company or lead.client_name or "client"
    now = datetime.utcnow()

    if channel == "email":
        if not target_email or not outreach_service.is_email_deliverable(target_email):
            return {"ok": False, "reason": "no_valid_email_after_acie", "channel": channel}
        res = send_email(target_email, msg["subject"], msg["body_text"], msg["body_html"])
        status = "sent" if res["sent"] else ("simulated" if res["simulated"] else "failed")
        simulated = res["simulated"]
        reason = res.get("reason", "")
    else:
        # Phone/LinkedIn: logged as manual action (no API yet)
        status = "logged"
        simulated = False
        reason = f"Channel '{channel}' tracked as outreach action (complete manually)."

    rec = Outreach(
        id=f"out-{uuid.uuid4().hex[:12]}",
        lead_id=lead.id,
        client_name=lead.client_name,
        company=company,
        email=target_email,
        channel=channel,
        step=step_index,
        step_label=msg["step_label"],
        subject=msg["subject"],
        body_text=msg["body_text"],
        status=status,
        simulated=simulated,
        sent_at=now if status in ("sent", "simulated", "logged") else None,
    )
    db.add(rec)
    db.add(Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        type="system",
        title="Outreach sent" if status != "failed" else "Outreach failed",
        message=f"{company} via {channel} ({msg['step_label']}): {status}",
        priority="low",
        created_at=now,
    ))

    # Record ACIE feedback for learning
    record_outcome(db, lead.id, channel, status, 
                   provider=intel_decision.get("provider", ""), 
                   detail=reason, 
                   confidence=intel_decision.get("confidence", 0.0))

    return {"ok": True, "status": status, "channel": channel, "simulated": simulated, "reason": reason}


# --------------------------------------------------------------------------- #
# Main worker
# --------------------------------------------------------------------------- #
def process_due_outreach(db: Session, limit: int = 25) -> dict:
    if not is_enabled(db):
        return {"skipped": True, "reason": "automation disabled"}

    cadence = outreach_service.CADENCE
    now = datetime.utcnow()

    # Auto-enroll any lead that doesn't yet have automation state.
    existing = {s.lead_id for s in db.query(OutreachState).all()}
    for lead in db.query(Lead).all():
        if lead.id not in existing:
            db.add(OutreachState(
                lead_id=lead.id, enrolled=True, current_step=-1,
                status="active", next_due_at=now,
            ))
            # Run ACIE on new enrollments so we have confidence + channel ready
            try:
                run_pipeline(db, lead)
            except Exception:
                pass
    db.commit()

    # Drop orphaned OutreachState rows whose lead no longer exists.
    _cleanup_orphans(db)
    states = (
        db.query(OutreachState)
        .filter(OutreachState.enrolled == True)
        .all()
    )

    summary = {
        "processed": 0, "sent": 0, "simulated": 0, "logged": 0,
        "failed": 0, "skipped_invalid": 0, "completed": 0, "errors": 0, "due_later": 0,
    }
    processed = 0
    for st in states:
        if processed >= limit:
            break
        if not st.enrolled:
            continue

        lead = db.query(Lead).filter(Lead.id == st.lead_id).first()

        # Parked leads: ACIE gate will handle validity check in send_step.
        # Just re-run pipeline to refresh confidence if stale.
        if st.status == "needs_email":
            if lead:
                try:
                    run_pipeline(db, lead, force=True)
                except Exception:
                    pass
            # If ACIE still says no, stay parked
            gate = can_send(db, st.lead_id)
            if not gate["allow"]:
                continue
            st.status = "active"
            st.next_due_at = now
            db.commit()

        if st.status != "active":
            continue

        if lead is None:
            st.status = "completed"
            db.commit()
            summary["completed"] += 1
            continue

        if st.next_due_at is None:
            st.next_due_at = compute_next_due(st, cadence, now)
            db.commit()
        if st.next_due_at and st.next_due_at > now:
            summary["due_later"] += 1
            continue

        nxt = st.current_step + 1
        if nxt >= len(cadence):
            st.status = "completed"
            db.commit()
            summary["completed"] += 1
            continue

        try:
            result = send_step(db, lead, nxt)
        except Exception:
            summary["errors"] += 1
            st.next_due_at = now + timedelta(hours=6)
            db.commit()
            continue

        if not result.get("ok"):
            # No valid address or the send actually failed (e.g. SMTP "address not found").
            # Park the lead instead of hammering the same bad address on every run.
            st.status = "needs_email"
            st.next_due_at = None
            summary["skipped_invalid"] += 1
            db.commit()
            continue

        st.current_step = nxt
        st.last_sent_at = now
        st.next_due_at = compute_next_due(st, cadence, now)
        summary["processed"] += 1
        s = result.get("status")
        if s == "sent":
            summary["sent"] += 1
        elif s == "simulated":
            summary["simulated"] += 1
        elif s == "logged":
            summary["logged"] += 1
        elif s == "failed":
            summary["failed"] += 1
        if st.current_step >= len(cadence) - 1:
            st.status = "completed"
            summary["completed"] += 1
        db.commit()
        processed += 1

    return summary


# --------------------------------------------------------------------------- #
# Status
# --------------------------------------------------------------------------- #
def status(db: Session) -> dict:
    _cleanup_orphans(db)
    states = db.query(OutreachState).all()
    by_status: dict[str, int] = {}
    for s in states:
        by_status[s.status] = by_status.get(s.status, 0) + 1
    now = datetime.utcnow()
    due_now = sum(
        1 for s in states
        if s.status == "active" and s.enrolled
        and (s.next_due_at is None or s.next_due_at <= now)
    )
    total_leads = db.query(Lead).count()
    enrolled = sum(1 for s in states if s.enrolled)
    return {
        "enabled": is_enabled(db),
        "total_leads": total_leads,
        "enrolled": enrolled,
        "by_status": by_status,
        "due_now": due_now,
        "cadence_length": len(outreach_service.CADENCE),
    }
