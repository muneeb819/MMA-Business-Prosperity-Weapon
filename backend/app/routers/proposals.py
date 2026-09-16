import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.models.database import get_db
from app.models.schema import Proposal, Lead, Notification

router = APIRouter()


class ProposalBase(BaseModel):
    leadId: str
    title: str
    cover_letter: str = ""
    introduction: str = ""
    technical_plan: str = ""
    timeline: str = ""
    cost_estimate: str = ""
    portfolio_suggestions: List[str] = []
    call_to_action: str = ""


class ProposalUpdate(BaseModel):
    leadId: Optional[str] = None
    title: Optional[str] = None
    cover_letter: Optional[str] = None
    introduction: Optional[str] = None
    technical_plan: Optional[str] = None
    timeline: Optional[str] = None
    cost_estimate: Optional[str] = None
    portfolio_suggestions: Optional[List[str]] = None
    call_to_action: Optional[str] = None


class ProposalResponse(BaseModel):
    id: str
    leadId: str
    title: str
    cover_letter: str = ""
    introduction: str = ""
    technical_plan: str = ""
    timeline: str = ""
    cost_estimate: str = ""
    portfolio_suggestions: List[str] = []
    call_to_action: str = ""
    win_probability: float = 0
    status: str = "draft"
    created_at: Optional[str] = None
    submitted_at: Optional[str] = None

    class Config:
        from_attributes = True


class GenerateRequest(BaseModel):
    leadId: str = ""
    tone: str = "professional"
    instructions: str = ""
    leadData: Optional[dict] = None


class SendEmailRequest(BaseModel):
    recipient_email: str
    subject: str = ""
    message: str = ""


class DirectEmailRequest(BaseModel):
    recipient_email: str
    subject: str
    body_text: str = ""
    body_html: str = ""


@router.post("/send-direct")
async def send_direct_email(request: DirectEmailRequest):
    sent = _send_smtp_email(
        recipient=request.recipient_email,
        subject=request.subject,
        body_html=request.body_html or f"<pre>{request.body_text}</pre>",
        body_text=request.body_text,
    )
    if sent:
        return {"success": True, "recipient": request.recipient_email, "method": "smtp"}
    else:
        mailto_url = f"mailto:{request.recipient_email}?subject={request.subject}&body={request.body_text}"
        return {"success": False, "method": "mailto", "mailto_url": mailto_url, "reason": "SMTP not configured"}


def _create_notification(db: Session, notif_type: str, title: str, message: str, priority: str = "medium", lead_id: str = None):
    notif = Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        type=notif_type,
        title=title,
        message=message,
        lead_id=lead_id,
        read=False,
        priority=priority,
        created_at=datetime.utcnow(),
    )
    db.add(notif)
    db.commit()


def _proposal_to_dict(prop: Proposal) -> dict:
    lead = prop.lead if prop.lead_id else None
    return {
        "id": prop.id,
        "leadId": prop.lead_id or "",
        "title": prop.title,
        "clientName": (lead.client_name or "Client") if lead else "Client",
        "company": (lead.company or "Company") if lead else "Company",
        "coverLetter": prop.cover_letter or "",
        "introduction": prop.introduction or "",
        "technicalPlan": prop.technical_plan or "",
        "timeline": prop.timeline or "",
        "costEstimate": prop.cost_estimate or "",
        "portfolioSuggestions": prop.portfolio_suggestions or [],
        "callToAction": prop.call_to_action or "",
        "winProbability": prop.win_probability or 0,
        "budget": ((lead.budget_min or 0) + (lead.budget_max or 0)) / 2 if lead else 0,
        "status": prop.status or "draft",
        "createdAt": prop.created_at.isoformat() if prop.created_at else None,
        "submittedAt": prop.submitted_at.isoformat() if prop.submitted_at else None,
        "sections": {
            "coverLetter": prop.cover_letter or "",
            "introduction": prop.introduction or "",
            "technicalPlan": prop.technical_plan or "",
            "costEstimate": prop.cost_estimate or "",
            "callToAction": prop.call_to_action or "",
        },
    }


@router.get("/")
def get_proposals(
    status: Optional[str] = None,
    lead_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Proposal)

    if status:
        query = query.filter(Proposal.status == status)
    if lead_id:
        query = query.filter(Proposal.lead_id == lead_id)

    proposals = query.order_by(Proposal.created_at.desc()).offset(skip).limit(limit).all()
    return [_proposal_to_dict(p) for p in proposals]


@router.get("/{proposal_id}")
def get_proposal(proposal_id: str, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return _proposal_to_dict(prop)


@router.post("/", status_code=201)
def create_proposal(proposal: ProposalBase, db: Session = Depends(get_db)):
    db_prop = Proposal(
        id=str(uuid.uuid4()),
        lead_id=proposal.leadId,
        title=proposal.title,
        cover_letter=proposal.cover_letter,
        introduction=proposal.introduction,
        technical_plan=proposal.technical_plan,
        timeline=proposal.timeline,
        cost_estimate=proposal.cost_estimate,
        portfolio_suggestions=proposal.portfolio_suggestions,
        call_to_action=proposal.call_to_action,
        status="draft",
        created_at=datetime.utcnow(),
    )
    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return _proposal_to_dict(db_prop)


@router.put("/{proposal_id}")
def update_proposal(proposal_id: str, proposal: ProposalUpdate, db: Session = Depends(get_db)):
    db_prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    if proposal.leadId is not None:
        db_prop.lead_id = proposal.leadId
    if proposal.title is not None:
        db_prop.title = proposal.title
    if proposal.cover_letter is not None:
        db_prop.cover_letter = proposal.cover_letter
    if proposal.introduction is not None:
        db_prop.introduction = proposal.introduction
    if proposal.technical_plan is not None:
        db_prop.technical_plan = proposal.technical_plan
    if proposal.timeline is not None:
        db_prop.timeline = proposal.timeline
    if proposal.cost_estimate is not None:
        db_prop.cost_estimate = proposal.cost_estimate
    if proposal.portfolio_suggestions is not None:
        db_prop.portfolio_suggestions = proposal.portfolio_suggestions
    if proposal.call_to_action is not None:
        db_prop.call_to_action = proposal.call_to_action

    db.commit()
    db.refresh(db_prop)
    return _proposal_to_dict(db_prop)


@router.delete("/{proposal_id}")
def delete_proposal(proposal_id: str, db: Session = Depends(get_db)):
    db_prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    db.delete(db_prop)
    db.commit()
    return {"message": "Proposal deleted successfully"}


@router.post("/{proposal_id}/submit")
def submit_proposal(proposal_id: str, db: Session = Depends(get_db)):
    db_prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    db_prop.status = "submitted"
    db_prop.submitted_at = datetime.utcnow()

    db_lead = db.query(Lead).filter(Lead.id == db_prop.lead_id).first()
    if db_lead and db_lead.status not in ("won", "lost"):
        db_lead.status = "proposal_sent"

    db.commit()
    db.refresh(db_prop)
    return _proposal_to_dict(db_prop)


@router.post("/{proposal_id}/duplicate", status_code=201)
def duplicate_proposal(proposal_id: str, db: Session = Depends(get_db)):
    db_prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    new_prop = Proposal(
        id=str(uuid.uuid4()),
        lead_id=db_prop.lead_id,
        title=f"{db_prop.title} (Copy)",
        cover_letter=db_prop.cover_letter,
        introduction=db_prop.introduction,
        technical_plan=db_prop.technical_plan,
        timeline=db_prop.timeline,
        cost_estimate=db_prop.cost_estimate,
        portfolio_suggestions=list(db_prop.portfolio_suggestions or []),
        call_to_action=db_prop.call_to_action,
        win_probability=db_prop.win_probability,
        status="draft",
        created_at=datetime.utcnow(),
    )
    db.add(new_prop)
    db.commit()
    db.refresh(new_prop)
    return _proposal_to_dict(new_prop)


@router.post("/generate", status_code=201)
async def generate_proposal(request: GenerateRequest, db: Session = Depends(get_db)):
    lead_data = None

    if request.leadData:
        ld = request.leadData
        budget = ld.get("budget", {})
        if isinstance(budget, dict):
            budget_min = budget.get("min", 0) or 0
            budget_max = budget.get("max", 0) or 0
        else:
            budget_min = 0
            budget_max = float(budget) if budget else 0
        lead_data = {
            "title": ld.get("title", "Project"),
            "description": ld.get("description", ""),
            "budget_min": budget_min,
            "budget_max": budget_max,
            "client_name": ld.get("clientName", ld.get("client_name", "Client")),
            "company": ld.get("company", "Company"),
            "technologies": ld.get("technologies", []),
            "country": ld.get("country", "Global"),
            "competition": ld.get("competition", 0),
        }
    elif request.leadId:
        db_lead = db.query(Lead).filter(Lead.id == request.leadId).first()
        if db_lead:
            lead_data = {
                "title": db_lead.title,
                "description": db_lead.description or "",
                "budget_min": db_lead.budget_min or 0,
                "budget_max": db_lead.budget_max or 0,
                "client_name": db_lead.client_name or "Client",
                "company": db_lead.company or "Company",
                "technologies": db_lead.technologies or [],
                "country": db_lead.country or "Global",
                "competition": db_lead.competition or 0,
            }

    if not lead_data:
        raise HTTPException(status_code=400, detail="No lead data provided. Send leadData or a valid leadId.")

    from app.services.ai_service import ai_service
    generated = await ai_service.generate_proposal(lead_data, tone=request.tone, instructions=request.instructions)

    lead_id = request.leadId or ""
    if not lead_id and "db_lead" in dir() and db_lead:
        lead_id = db_lead.id

    title = generated.get("title", f"Proposal for {lead_data.get('title', 'Project')}")

    try:
        new_prop = Proposal(
            id=str(uuid.uuid4()),
            lead_id=lead_id,
            title=title,
            cover_letter=generated.get("cover_letter", ""),
            introduction=generated.get("introduction", ""),
            technical_plan=generated.get("technical_plan", ""),
            timeline=generated.get("timeline", ""),
            cost_estimate=generated.get("cost_estimate", ""),
            portfolio_suggestions=generated.get("portfolio_suggestions", []),
            call_to_action=generated.get("call_to_action", ""),
            win_probability=generated.get("win_probability", 0),
            status="draft",
            created_at=datetime.utcnow(),
        )
        db.add(new_prop)
        db.commit()
        db.refresh(new_prop)
        result = _proposal_to_dict(new_prop)
    except Exception:
        result = {
            "id": f"prop-{uuid.uuid4().hex[:12]}",
            "leadId": lead_id,
            "title": title,
            "clientName": lead_data.get("client_name", "Client"),
            "company": lead_data.get("company", "Company"),
            "coverLetter": generated.get("cover_letter", ""),
            "introduction": generated.get("introduction", ""),
            "technicalPlan": generated.get("technical_plan", ""),
            "timeline": generated.get("timeline", ""),
            "costEstimate": generated.get("cost_estimate", ""),
            "portfolioSuggestions": generated.get("portfolio_suggestions", []),
            "callToAction": generated.get("call_to_action", ""),
            "winProbability": generated.get("win_probability", 0),
            "budget": (lead_data.get("budget_min", 0) + lead_data.get("budget_max", 0)) / 2,
            "status": "draft",
            "createdAt": datetime.utcnow().isoformat(),
            "submittedAt": None,
            "sections": {
                "coverLetter": generated.get("cover_letter", ""),
                "introduction": generated.get("introduction", ""),
                "technicalPlan": generated.get("technical_plan", ""),
                "costEstimate": generated.get("cost_estimate", ""),
                "callToAction": generated.get("call_to_action", ""),
            },
        }

    try:
        _create_notification(
            db, "high_value", "Proposal Generated",
            f"New proposal created: {title}",
            priority="high", lead_id=lead_id,
        )
    except Exception:
        pass

    return result


@router.post("/{proposal_id}/send-email")
async def send_proposal_email(proposal_id: str, request: SendEmailRequest, db: Session = Depends(get_db)):
    db_prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    db_lead = db.query(Lead).filter(Lead.id == db_prop.lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Associated lead not found")

    from app.services.ai_service import ai_service

    lead_data = {
        "title": db_lead.title,
        "description": db_lead.description,
        "budget_min": db_lead.budget_min,
        "budget_max": db_lead.budget_max,
        "client_name": db_lead.client_name,
        "company": db_lead.company,
        "technologies": db_lead.technologies or [],
        "country": db_lead.country,
        "competition": db_lead.competition,
    }
    proposal_data = {
        "title": db_prop.title,
        "timeline": db_prop.timeline,
        "cost_estimate": db_prop.cost_estimate,
        "win_probability": db_prop.win_probability,
    }

    email_content = await ai_service.generate_proposal_email(
        lead_data=lead_data,
        proposal_data=proposal_data,
        tone="professional",
        custom_message=request.message,
    )

    subject = request.subject or email_content.get("subject", f"Proposal for {db_lead.title}")
    body_html = _build_email_html(
        email_content.get("salutation", f"Dear {db_lead.client_name},"),
        email_content.get("body", ""),
        email_content.get("closing", ""),
        email_content.get("signature", ""),
        db_prop,
        db_lead,
    )
    body_text = f"{email_content.get('salutation', '')}\n\n{email_content.get('body', '')}\n\n{email_content.get('closing', '')}\n\n{email_content.get('signature', '')}"

    sent = _send_smtp_email(
        recipient=request.recipient_email,
        subject=subject,
        body_html=body_html,
        body_text=body_text,
    )

    if sent:
        _create_notification(
            db, "system", "Proposal Email Sent",
            f"Proposal '{db_prop.title}' emailed to {request.recipient_email}",
            priority="high", lead_id=db_prop.lead_id,
        )
    else:
        _create_notification(
            db, "system", "Email Delivery Failed",
            f"Could not send proposal email to {request.recipient_email}. SMTP not configured.",
            priority="medium", lead_id=db_prop.lead_id,
        )

    return {
        "success": sent,
        "recipient": request.recipient_email,
        "subject": subject,
        "emailContent": email_content,
        "proposalId": proposal_id,
    }


def _build_email_html(salutation: str, body: str, closing: str, signature: str, proposal: Proposal, lead: Lead) -> str:
    sections_html = ""
    for label, field in [
        ("Cover Letter", proposal.cover_letter),
        ("Introduction", proposal.introduction),
        ("Technical Approach", proposal.technical_plan),
        ("Cost Estimate", proposal.cost_estimate),
        ("Call to Action", proposal.call_to_action),
    ]:
        if field:
            sections_html += f"""
            <tr>
                <td style="padding:8px 0 4px;font-size:13px;font-weight:600;color:#6366f1;border-bottom:1px solid #e5e7eb">{label}</td>
            </tr>
            <tr>
                <td style="padding:4px 0 12px;font-size:12px;color:#374151;white-space:pre-wrap;line-height:1.6">{field}</td>
            </tr>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
<tr><td style="padding:32px 32px 16px;background:linear-gradient(135deg,#312e81,#6366f1)">
<h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:700">Proposal: {proposal.title}</h1>
<p style="margin:6px 0 0;font-size:13px;color:#93c5fd">{lead.client_name} &middot; {lead.company}</p>
</td></tr>
<tr><td style="padding:24px 32px 8px">
<p style="margin:0;font-size:14px;color:#1f2937;line-height:1.6">{salutation}</p>
<p style="margin:12px 0 0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap">{body}</p>
</td></tr>
<tr><td style="padding:16px 32px 8px">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb">
<tr><td style="padding:12px 16px">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:12px;color:#6b7280;padding:2px 0">Timeline</td><td style="font-size:12px;color:#1f2937;text-align:right;padding:2px 0">{proposal.timeline or 'TBD'}</td></tr>
<tr><td style="font-size:12px;color:#6b7280;padding:2px 0">Budget</td><td style="font-size:12px;color:#059669;text-align:right;padding:2px 0;font-weight:600">{proposal.cost_estimate or f'${lead.budget_min or 0:,.0f} - ${lead.budget_max or 0:,.0f}'}</td></tr>
<tr><td style="font-size:12px;color:#6b7280;padding:2px 0">Win Probability</td><td style="font-size:12px;color:#1f2937;text-align:right;padding:2px 0">{proposal.win_probability or 50}%</td></tr>
</table>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:8px 32px">
<table width="100%" cellpadding="0" cellspacing="0">
{sections_html}
</table>
</td></tr>
<tr><td style="padding:8px 32px 24px">
<p style="margin:0;font-size:13px;color:#374151;line-height:1.6;white-space:pre-wrap">{closing}</p>
<p style="margin:12px 0 0;font-size:12px;color:#6b7280;white-space:pre-wrap">{signature}</p>
</td></tr>
<tr><td style="padding:16px 32px;background:#f3f4f6;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af">
Generated by MMA Business Prosperity Weapon &middot; {datetime.utcnow().strftime('%Y-%m-%d')}
</td></tr>
</table>
</td></tr></table>
</body>
</html>"""


def _send_smtp_email(recipient: str, subject: str, body_html: str, body_text: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_from = os.getenv("SMTP_FROM_EMAIL", "noreply@mbpw.ai")
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "MMA Business Prosperity Weapon")

    if not smtp_host or not smtp_user or not smtp_password:
        import logging
        logging.getLogger(__name__).warning(
            "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD env vars."
        )
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{smtp_from_name} <{smtp_from}>"
    msg["To"] = recipient

    msg.attach(MIMEText(body_text, "plain", "utf-8"))
    msg.attach(MIMEText(body_html, "html", "utf-8"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_from, [recipient], msg.as_string())
        return True
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"SMTP send failed: {e}")
        return False
