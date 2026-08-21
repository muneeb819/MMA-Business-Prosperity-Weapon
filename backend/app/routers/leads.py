from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.models.database import get_db
from app.models.schema import Lead, Notification

router = APIRouter()


class LeadBase(BaseModel):
    title: str
    description: str = ""
    clientName: str = ""
    company: str = ""
    email: str = ""
    phone: str = ""
    country: str = ""
    budgetMin: float = 0
    budgetMax: float = 0
    deadline: str = ""
    technologies: List[str] = []
    skills: List[str] = []
    platform: str = ""
    jobType: str = ""
    status: str = "new"
    urgency: str = "medium"
    difficulty: float = 50
    successProbability: float = 50
    riskLevel: str = "medium"
    expectedRevenue: float = 0
    competition: int = 0
    projectSize: str = "medium"
    paymentMethod: str = "Escrow"
    clientHistory: str = ""
    url: str = ""
    notes: str = ""
    tags: List[str] = []


class LeadResponse(BaseModel):
    id: str
    title: str
    description: str = ""
    clientName: str = ""
    company: str = ""
    email: str = ""
    phone: str = ""
    country: str = ""
    budgetMin: float = 0
    budgetMax: float = 0
    deadline: str = ""
    technologies: List[str] = []
    skills: List[str] = []
    platform: str = ""
    job_type: str = ""
    status: str = "new"
    urgency: str = "medium"
    difficulty: float = 50
    success_probability: float = 50
    risk_level: str = "medium"
    expected_revenue: float = 0
    competition: int = 0
    project_size: str = "medium"
    payment_method: str = "Escrow"
    client_history: str = ""
    url: str = ""
    notes: str = ""
    tags: List[str] = []
    found_at: Optional[str] = None
    analyzed_at: Optional[str] = None

    class Config:
        from_attributes = True


class LeadStats(BaseModel):
    total: int
    new: int
    analyzing: int
    qualified: int
    proposal_sent: int
    won: int
    lost: int


def _lead_to_dict(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "title": lead.title,
        "description": lead.description or "",
        "clientName": lead.client_name or "",
        "company": lead.company or "",
        "email": lead.email or "",
        "phone": lead.phone or "",
        "country": lead.country or "",
        "budget": {"min": lead.budget_min or 0, "max": lead.budget_max or 0},
        "deadline": lead.deadline or "",
        "technologies": lead.technologies or [],
        "skills": lead.skills or [],
        "platform": lead.platform or "",
        "jobType": lead.job_type or "",
        "status": lead.status or "new",
        "urgency": lead.urgency or "medium",
        "difficulty": lead.difficulty or 50,
        "successProbability": lead.success_probability or 50,
        "riskLevel": lead.risk_level or "medium",
        "expectedRevenue": lead.expected_revenue or 0,
        "competition": lead.competition or 0,
        "projectSize": lead.project_size or "medium",
        "paymentMethod": lead.payment_method or "Escrow",
        "clientHistory": lead.client_history or "",
        "url": lead.url or "",
        "notes": lead.notes or "",
        "tags": lead.tags or [],
        "foundAt": lead.found_at.isoformat() if lead.found_at else None,
        "analyzedAt": lead.analyzed_at.isoformat() if lead.analyzed_at else None,
        "proposalId": "",
    }


@router.get("/")
def get_leads(
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    country: Optional[str] = None,
    technology: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Lead)

    if status:
        query = query.filter(Lead.status == status)
    if urgency:
        query = query.filter(Lead.urgency == urgency)
    if country:
        query = query.filter(Lead.country == country)
    if technology:
        try:
            query = query.filter(Lead.technologies.any(technology))
        except Exception:
            all_leads = query.all()
            query = db.query(Lead).filter(Lead.id.in_([
                l.id for l in all_leads
                if l.technologies and technology in l.technologies
            ]))
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Lead.title.ilike(search_term),
                Lead.description.ilike(search_term),
                Lead.client_name.ilike(search_term),
                Lead.company.ilike(search_term),
            )
        )

    leads = query.order_by(Lead.found_at.desc()).offset(skip).limit(limit).all()
    return [_lead_to_dict(l) for l in leads]


@router.get("/stats/summary", response_model=LeadStats)
def get_lead_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Lead.id)).scalar() or 0
    new = db.query(func.count(Lead.id)).filter(Lead.status == "new").scalar() or 0
    analyzing = db.query(func.count(Lead.id)).filter(Lead.status == "analyzing").scalar() or 0
    qualified = db.query(func.count(Lead.id)).filter(Lead.status == "qualified").scalar() or 0
    proposal_sent = db.query(func.count(Lead.id)).filter(Lead.status == "proposal_sent").scalar() or 0
    won = db.query(func.count(Lead.id)).filter(Lead.status == "won").scalar() or 0
    lost = db.query(func.count(Lead.id)).filter(Lead.status == "lost").scalar() or 0

    return {
        "total": total,
        "new": new,
        "analyzing": analyzing,
        "qualified": qualified,
        "proposal_sent": proposal_sent,
        "won": won,
        "lost": lost,
    }


@router.get("/{lead_id}")
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return _lead_to_dict(lead)


@router.post("/", status_code=201)
def create_lead(lead: LeadBase, db: Session = Depends(get_db)):
    import uuid
    db_lead = Lead(
        id=str(uuid.uuid4()),
        title=lead.title,
        description=lead.description,
        client_name=lead.clientName,
        company=lead.company,
        email=lead.email,
        phone=lead.phone,
        country=lead.country,
        budget_min=lead.budgetMin,
        budget_max=lead.budgetMax,
        deadline=lead.deadline,
        technologies=lead.technologies,
        skills=lead.skills,
        platform=lead.platform,
        job_type=lead.jobType,
        status=lead.status,
        urgency=lead.urgency,
        difficulty=lead.difficulty,
        success_probability=lead.successProbability,
        risk_level=lead.riskLevel,
        expected_revenue=lead.expectedRevenue,
        competition=lead.competition,
        project_size=lead.projectSize,
        payment_method=lead.paymentMethod,
        client_history=lead.clientHistory,
        url=lead.url,
        notes=lead.notes,
        tags=lead.tags,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return _lead_to_dict(db_lead)


@router.put("/{lead_id}")
def update_lead(lead_id: str, lead: LeadBase, db: Session = Depends(get_db)):
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db_lead.title = lead.title
    db_lead.description = lead.description
    db_lead.client_name = lead.clientName
    db_lead.company = lead.company
    db_lead.email = lead.email
    db_lead.phone = lead.phone
    db_lead.country = lead.country
    db_lead.budget_min = lead.budgetMin
    db_lead.budget_max = lead.budgetMax
    db_lead.deadline = lead.deadline
    db_lead.technologies = lead.technologies
    db_lead.skills = lead.skills
    db_lead.platform = lead.platform
    db_lead.job_type = lead.jobType
    db_lead.status = lead.status
    db_lead.urgency = lead.urgency
    db_lead.difficulty = lead.difficulty
    db_lead.success_probability = lead.successProbability
    db_lead.risk_level = lead.riskLevel
    db_lead.expected_revenue = lead.expectedRevenue
    db_lead.competition = lead.competition
    db_lead.project_size = lead.projectSize
    db_lead.payment_method = lead.paymentMethod
    db_lead.client_history = lead.clientHistory
    db_lead.url = lead.url
    db_lead.notes = lead.notes
    db_lead.tags = lead.tags

    db.commit()
    db.refresh(db_lead)
    return _lead_to_dict(db_lead)


@router.delete("/{lead_id}")
def delete_lead(lead_id: str, db: Session = Depends(get_db)):
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(db_lead)
    db.commit()
    return {"message": "Lead deleted successfully"}


@router.put("/{lead_id}/archive")
def toggle_archive_lead(lead_id: str, db: Session = Depends(get_db)):
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if db_lead.status == "archived":
        db_lead.status = "new"
    else:
        db_lead.status = "archived"

    db.commit()
    db.refresh(db_lead)
    return _lead_to_dict(db_lead)


@router.post("/{lead_id}/analyze")
async def analyze_lead(lead_id: str, db: Session = Depends(get_db)):
    db_lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    from app.services.ai_service import ai_service
    analysis = await ai_service.analyze_lead({
        "title": db_lead.title,
        "description": db_lead.description,
        "budget_min": db_lead.budget_min,
        "budget_max": db_lead.budget_max,
        "country": db_lead.country,
        "technologies": db_lead.technologies or [],
        "platform": db_lead.platform,
        "job_type": db_lead.job_type,
        "client_name": db_lead.client_name,
        "company": db_lead.company,
        "competition": db_lead.competition,
    })

    db_lead.success_probability = analysis.get("success_probability", db_lead.success_probability)
    db_lead.difficulty = analysis.get("difficulty", db_lead.difficulty)
    db_lead.risk_level = analysis.get("risk_level", db_lead.risk_level)
    db_lead.expected_revenue = analysis.get("expected_revenue", db_lead.expected_revenue)
    db_lead.status = "qualified"
    db_lead.notes = analysis.get("recommendation", db_lead.notes or "")

    existing_tags = list(db_lead.tags or [])
    new_tags = analysis.get("tags", [])
    for t in new_tags:
        if t not in existing_tags:
            existing_tags.append(t)
    db_lead.tags = existing_tags

    from datetime import datetime
    db_lead.analyzed_at = datetime.utcnow()

    db.commit()
    db.refresh(db_lead)

    notif = Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        type="system",
        title="Lead Analyzed",
        message=f"Lead '{db_lead.title}' analyzed. Success probability: {analysis.get('success_probability', 0)}%",
        lead_id=lead_id,
        read=False,
        priority="medium",
        created_at=datetime.utcnow(),
    )
    db.add(notif)
    db.commit()

    return {
        "message": "Analysis completed",
        "lead_id": lead_id,
        "analysis": analysis,
    }
