from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.models.database import get_db
from app.models.schema import Lead, Outreach, Notification
from app.services.email_sender import send_email
from app.services import outreach_service
from app.services import enrichment

router = APIRouter()


def _lead_to_dict(lead: Lead) -> dict:
    tags = lead.tags or []
    src = next((t.split("enriched:")[1] for t in tags if t.startswith("enriched:")), None)
    return {
        "id": lead.id,
        "title": lead.title,
        "client_name": lead.client_name,
        "company": lead.company,
        "email": lead.email,
        "phone": lead.phone,
        "country": lead.country,
        "technologies": lead.technologies or [],
        "budget_max": lead.budget_max,
        "status": lead.status,
        "email_source": src,
        "email_verified": src == "hunter",
    }


@router.get("/cadence")
def get_cadence():
    return {"cadence": outreach_service.CADENCE}


@router.get("/leads")
def outreach_leads(db: Session = Depends(get_db)):
    leads = db.query(Lead).order_by(Lead.found_at.desc()).limit(200).all()
    result = []
    for l in leads:
        rec = (
            db.query(Outreach)
            .filter(Outreach.lead_id == l.id)
            .order_by(Outreach.step.desc())
            .first()
        )
        d = _lead_to_dict(l)
        d["outreach_status"] = rec.status if rec else "not_contacted"
        d["last_step"] = rec.step if rec else -1
        d["has_email"] = bool(l.email and "@" in l.email)
        result.append(d)
    return result


@router.post("/enrich/{lead_id}")
def enrich_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    company = lead.company or lead.client_name
    res = enrichment.enrich(company, verify=True)
    if res["email"]:
        lead.email = res["email"]
        tag = f"enriched:{res['source']}"
        if tag not in (lead.tags or []):
            lead.tags = (lead.tags or []) + [tag]
        db.commit()
    return {"id": lead.id, "company": company, **res}


@router.post("/enrich-all")
def enrich_all(db: Session = Depends(get_db)):
    leads = db.query(Lead).filter((Lead.email == None) | (Lead.email == "")).all()
    enriched = 0
    for l in leads:
        res = enrichment.enrich(l.company or l.client_name, verify=True)
        if res["email"]:
            l.email = res["email"]
            tag = f"enriched:{res['source']}"
            if tag not in (l.tags or []):
                l.tags = (l.tags or []) + [tag]
            enriched += 1
    db.commit()
    return {"enriched": enriched, "checked": len(leads)}


@router.post("/preview")
def preview(data: dict, db: Session = Depends(get_db)):
    lead_id = data.get("lead_id")
    step = int(data.get("step", 0))
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return outreach_service.build_message(_lead_to_dict(lead), step, data.get("custom_note", ""))


@router.post("/send")
def send(data: dict, db: Session = Depends(get_db)):
    lead_id = data.get("lead_id")
    step = int(data.get("step", 0))
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    msg = outreach_service.build_message(_lead_to_dict(lead), step, data.get("custom_note", ""))
    channel = msg["channel"]
    company = lead.company or lead.client_name or "client"

    status = "simulated"
    simulated = True
    reason = ""

    if channel == "email":
        if not (lead.email and "@" in lead.email):
            raise HTTPException(
                status_code=400,
                detail="No verified email for this lead. Add a contact email before sending.",
            )
        res = send_email(lead.email, msg["subject"], msg["body_text"], msg["body_html"])
        status = "sent" if res["sent"] else ("simulated" if res["simulated"] else "failed")
        simulated = res["simulated"]
        reason = res.get("reason", "")
    else:
        # LinkedIn / WhatsApp are tracked as outreach actions (connect/engage).
        status = "logged"
        reason = (
            f"Channel '{channel}' is tracked as an outreach action. "
            f"Wire your {channel} integration to deliver."
        )

    rec = Outreach(
        id=f"out-{uuid.uuid4().hex[:12]}",
        lead_id=lead.id,
        client_name=lead.client_name,
        company=company,
        email=lead.email,
        channel=channel,
        step=step,
        step_label=msg["step_label"],
        subject=msg["subject"],
        body_text=msg["body_text"],
        status=status,
        simulated=simulated,
        sent_at=datetime.utcnow() if status in ("sent", "simulated", "logged") else None,
    )
    db.add(rec)

    db.add(
        Notification(
            id=f"notif-{uuid.uuid4().hex[:12]}",
            type="system",
            title="Outreach sent" if status != "failed" else "Outreach failed",
            message=f"{company} via {channel} ({msg['step_label']}): {status}",
            priority="low",
            created_at=datetime.utcnow(),
        )
    )
    db.commit()
    return {"id": rec.id, "status": status, "simulated": simulated, "reason": reason, "message": msg}


@router.get("/records")
def records(db: Session = Depends(get_db)):
    recs = db.query(Outreach).order_by(Outreach.created_at.desc()).limit(200).all()
    return [
        {
            "id": r.id,
            "lead_id": r.lead_id,
            "company": r.company,
            "client_name": r.client_name,
            "channel": r.channel,
            "step_label": r.step_label,
            "status": r.status,
            "simulated": r.simulated,
            "subject": r.subject,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None,
            "replied_at": r.replied_at.isoformat() if r.replied_at else None,
        }
        for r in recs
    ]


@router.post("/{outreach_id}/reply")
def mark_reply(outreach_id: str, db: Session = Depends(get_db)):
    r = db.query(Outreach).filter(Outreach.id == outreach_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Record not found")
    r.status = "replied"
    r.replied_at = datetime.utcnow()
    db.commit()
    return {"id": r.id, "status": "replied"}


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    recs = db.query(Outreach).all()
    return {
        "total": len(recs),
        "sent": sum(1 for r in recs if r.status == "sent"),
        "simulated": sum(1 for r in recs if r.status == "simulated"),
        "logged": sum(1 for r in recs if r.status == "logged"),
        "replied": sum(1 for r in recs if r.status == "replied"),
        "failed": sum(1 for r in recs if r.status == "failed"),
    }
