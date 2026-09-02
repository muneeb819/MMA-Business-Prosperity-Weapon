from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import os

from app.models.database import get_db
from app.models.schema import Lead, Outreach, Notification, OutreachState
from app.services.email_sender import send_email
from app.services import outreach_service
from app.services import enrichment
from app.services import outreach_automation
from app.services.acie.pipeline import run_pipeline
from app.services.outreach_service import _lead_to_dict, build_dynamic_message

router = APIRouter()


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
        st = db.query(OutreachState).filter(OutreachState.lead_id == l.id).first()
        d["automation"] = {
            "enrolled": st.enrolled if st else True,
            "current_step": st.current_step if st else -1,
            "status": st.status if st else "active",
            "next_due_at": st.next_due_at.isoformat() if st and st.next_due_at else None,
        }
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

    msg = build_dynamic_message(lead, step, data.get("custom_note", ""))
    channel = msg["channel"]
    company = lead.company or lead.client_name or "client"

    status = "simulated"
    simulated = True
    reason = ""

    if channel == "email":
        if not outreach_service.is_email_deliverable(lead.email):
            raise HTTPException(
                status_code=400,
                detail="Cannot send: the lead's email address is not valid or not deliverable "
                       "(no MX record). Enrich the lead to find a real contact email first.",
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


# --------------------------------------------------------------------------- #
# Automated outreach engine
# --------------------------------------------------------------------------- #
@router.get("/cron")
def cron_run(request: Request, db: Session = Depends(get_db)):
    """Vercel Cron target (GET). Processes all due cadence steps. Optionally guarded
    by CRON_SECRET (set in env) via ?secret= or Authorization: Bearer <secret>."""
    secret = os.getenv("CRON_SECRET", "")
    if secret:
        provided = request.query_params.get("secret") or request.headers.get(
            "authorization", ""
        ).replace("Bearer ", "")
        if provided != secret:
            raise HTTPException(status_code=401, detail="Unauthorized")
    summary = outreach_automation.process_due_outreach(db)
    return {"ok": True, "summary": summary}


@router.post("/automation/run")
def automation_run(data: dict = None, db: Session = Depends(get_db)):
    limit = int((data or {}).get("limit", 25))
    summary = outreach_automation.process_due_outreach(db, limit=limit)
    return {"summary": summary}


@router.get("/automation/status")
def automation_status(db: Session = Depends(get_db)):
    return outreach_automation.status(db)


@router.post("/automation/enroll")
def automation_enroll(data: dict, db: Session = Depends(get_db)):
    return outreach_automation.enroll(db, data.get("lead_id"))


@router.post("/automation/pause")
def automation_pause(data: dict, db: Session = Depends(get_db)):
    return outreach_automation.set_paused(db, data.get("lead_id"), True)


@router.post("/automation/resume")
def automation_resume(data: dict, db: Session = Depends(get_db)):
    return outreach_automation.set_paused(db, data.get("lead_id"), False)


@router.post("/automation/settings")
def automation_settings(data: dict, db: Session = Depends(get_db)):
    enabled = bool(data.get("enabled", True))
    outreach_automation.set_enabled(db, enabled)
    return {"enabled": enabled}


# --------------------------------------------------------------------------- #
# WeWorkRemotely Client Outreach Agent
# --------------------------------------------------------------------------- #
# Discovers client companies on WeWorkRemotely (every live posting = a company
# actively hiring, i.e. a warm prospect for our services), resolves a real,
# verified company email, auto-enrolls each into the outreach cadence and
# fires the first touch now. This is a REAL outreach agent built on the
# existing enrichment + email engine (not a simulation).
# --------------------------------------------------------------------------- #
@router.post("/agent/weworkremotely/run")
def wework_agent_run(data: dict = None, db: Session = Depends(get_db)):
    import asyncio
    from app.services.sync import sync_source

    limit = int((data or {}).get("limit", 20))

    # 1) Discover client companies from We Work Remotely (creates/updates Leads).
    #    This is the fast step (single RSS fetch + dedupe insert). Heavy email
    #    enrichment + sending runs in the daily cron (longer 60s window) via the
    #    existing process_due_outreach engine, so this endpoint stays under the
    #    ~10s Vercel serverless limit.
    try:
        result = asyncio.get_event_loop().run_until_complete(
            sync_source("weworkremotely", db, limit=limit)
        )
    except RuntimeError:
        loop = asyncio.new_event_loop()
        result = loop.run_until_complete(sync_source("weworkremotely", db, limit=limit))
        loop.close()

    if "error" in result and result.get("fetched", 0) == 0:
        return {"ok": False, "error": result["error"]}

    # 2) Enroll every We Work Remotely client (idempotent) so the automation
    #    engine picks them up on the next cron run. Run ACIE pipeline on each
    #    so confidence/channel/gate are ready.
    wwr_leads = (
        db.query(Lead)
        .filter(Lead.platform == "weworkremotely")
        .order_by(Lead.found_at.desc())
        .limit(limit)
        .all()
    )
    enrolled = 0
    already = 0
    acie_scored = 0
    for lead in wwr_leads:
        st = db.query(OutreachState).filter(OutreachState.lead_id == lead.id).first()
        if st and st.enrolled:
            already += 1
        else:
            outreach_automation.get_or_enroll(db, lead.id)
            enrolled += 1
        # Run ACIE pipeline (fast path - uses free providers)
        try:
            run_pipeline(db, lead)
            acie_scored += 1
        except Exception:
            pass
    db.commit()

    return {
        "ok": True,
        "agent": "WeWorkRemotely Client Outreach Agent",
        "source": "weworkremotely",
        "sync": result,
        "summary": {
            "found": len(wwr_leads),
            "new": result.get("new", 0),
            "updated": result.get("updated", 0),
            "enrolled_now": enrolled,
            "already_enrolled": already,
            "acie_scored": acie_scored,
            "note": "Email enrichment + 4-step outreach send automatically on the daily cron (09:00 UTC). ACIE gates all sends.",
        },
    }


@router.post("/agent/weworkremotely/enrich")
def wework_agent_enrich(data: dict = None, db: Session = Depends(get_db)):
    """Enrich a SMALL batch (fits the ~10s limit) of We Work Remotely clients that
    still lack a verify-able company email. The daily cron does the rest."""
    batch = int((data or {}).get("batch", 4))
    wwr_leads = (
        db.query(Lead)
        .filter(Lead.platform == "weworkremotely")
        .order_by(Lead.found_at.asc())
        .limit(200)
        .all()
    )
    targets = [
        l for l in wwr_leads
        if not outreach_service.is_sendable_email(l.email, l)
    ]
    enriched = 0
    verified = 0
    for lead in targets[:batch]:
        company = lead.company or lead.client_name
        try:
            res = enrichment.enrich(company, verify=True, smtp=False, web=True)
            ne = res.get("email")
            ns = res.get("source")
        except Exception:
            ne, ns = None, None
        if ne and ns != "heuristic" and outreach_service.is_email_deliverable(ne):
            lead.email = ne
            tag = f"enriched:{ns}"
            if tag not in (lead.tags or []):
                lead.tags = (lead.tags or []) + [tag]
            enriched += 1
            if outreach_service.is_lead_email_verified(lead):
                verified += 1
    db.commit()
    return {
        "ok": True,
        "targets_remaining": len(targets) - enriched,
        "enriched": enriched,
        "verified": verified,
    }


@router.get("/agent/weworkremotely/status")
def wework_agent_status(db: Session = Depends(get_db)):
    wwr_leads = (
        db.query(Lead)
        .filter(Lead.platform == "weworkremotely")
        .order_by(Lead.found_at.desc())
        .limit(100)
        .all()
    )
    items = []
    ready = 0
    enrolled = 0
    for l in wwr_leads:
        sendable = outreach_service.is_sendable_email(l.email, l)
        st = db.query(OutreachState).filter(OutreachState.lead_id == l.id).first()
        is_enrolled = st.enrolled if st else False
        if sendable:
            ready += 1
        if is_enrolled:
            enrolled += 1
        items.append(
            {
                "id": l.id,
                "company": l.company or l.client_name,
                "title": l.title,
                "email": l.email or "",
                "sendable": sendable,
                "enrolled": is_enrolled,
                "current_step": st.current_step if st else -1,
                "status": st.status if st else "not_enrolled",
            }
        )
    return {
        "agent": "WeWorkRemotely Client Outreach Agent",
        "source": "weworkremotely",
        "companies": len(items),
        "with_valid_email": ready,
        "enrolled": enrolled,
        "items": items,
    }


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
