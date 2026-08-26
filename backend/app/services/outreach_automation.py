import os
import uuid
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.schema import Lead, Outreach, OutreachState, Notification, AppConfig
from app.services import outreach_service, enrichment
from app.services.email_sender import send_email

AUTOMATION_FLAG = "outreach_automation_enabled"


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
    msg = outreach_service.build_dynamic_message(lead, step_index, custom_note)
    channel = msg["channel"]
    company = lead.company or lead.client_name or "client"
    now = datetime.utcnow()

    if channel == "email":
        if not (lead.email and "@" in lead.email):
            res = enrichment.enrich(
                lead.company or lead.client_name, verify=True, smtp=False, web=True
            )
            if res.get("email"):
                lead.email = res["email"]
                tag = f"enriched:{res['source']}"
                if tag not in (lead.tags or []):
                    lead.tags = (lead.tags or []) + [tag]
                db.commit()
        if not (lead.email and "@" in lead.email):
            return {"ok": False, "reason": "no_email", "channel": channel}

        res = send_email(lead.email, msg["subject"], msg["body_text"], msg["body_html"])
        status = "sent" if res["sent"] else ("simulated" if res["simulated"] else "failed")
        simulated = res["simulated"]
        reason = res.get("reason", "")
    else:
        # LinkedIn / WhatsApp are logged as manual outreach actions (no API wired yet).
        status = "logged"
        simulated = False
        reason = f"Channel '{channel}' tracked as an outreach action (complete manually)."

    rec = Outreach(
        id=f"out-{uuid.uuid4().hex[:12]}",
        lead_id=lead.id,
        client_name=lead.client_name,
        company=company,
        email=lead.email,
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
    db.commit()

    states = (
        db.query(OutreachState)
        .filter(OutreachState.enrolled == True, OutreachState.status == "active")
        .all()
    )
    summary = {
        "processed": 0, "sent": 0, "simulated": 0, "logged": 0,
        "failed": 0, "skipped_noemail": 0, "completed": 0, "errors": 0, "due_later": 0,
    }
    processed = 0
    for st in states:
        if processed >= limit:
            break
        if st.status != "active" or not st.enrolled:
            continue
        if st.next_due_at is None:
            st.next_due_at = compute_next_due(st, cadence, now)
            db.commit()
        if st.next_due_at and st.next_due_at > now:
            summary["due_later"] += 1
            continue

        lead = db.query(Lead).filter(Lead.id == st.lead_id).first()
        if not lead:
            st.status = "completed"
            db.commit()
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
            if result.get("reason") == "no_email":
                summary["skipped_noemail"] += 1
                st.next_due_at = now + timedelta(days=1)
                db.commit()
                continue
            summary["errors"] += 1
            st.next_due_at = now + timedelta(hours=6)
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
