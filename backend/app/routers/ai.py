from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.models.database import get_db
from app.models.schema import Lead

router = APIRouter()


@router.get("/status")
def ai_status():
    from app.services.ai_service import ai_service
    return {
        "available": ai_service._is_available(),
        "model": ai_service.model,
        "api_key_set": bool(ai_service.api_key),
        "fallback_mode": not ai_service._is_available(),
    }


@router.get("/insights")
async def get_ai_insights(db: Session = Depends(get_db)):
    from app.services.ai_service import ai_service

    leads = db.query(Lead).order_by(Lead.found_at.desc()).limit(20).all()
    leads_data = [
        {
            "title": l.title,
            "description": l.description or "",
            "budget_max": l.budget_max or 0,
            "budget_min": l.budget_min or 0,
            "status": l.status or "new",
            "success_probability": l.success_probability or 50,
            "country": l.country or "",
            "technologies": l.technologies or [],
            "urgency": l.urgency or "medium",
        }
        for l in leads
    ]

    insights = await ai_service.generate_opportunity_insights(leads_data)
    return insights


class NaturalLanguageQuery(BaseModel):
    query: str


@router.post("/interpret")
async def interpret_query(request: NaturalLanguageQuery):
    from app.services.ai_service import ai_service
    result = await ai_service.natural_language_search(request.query)
    return result


@router.get("/briefing")
async def get_daily_briefing(db: Session = Depends(get_db)):
    from app.services.ai_service import ai_service
    leads = db.query(Lead).order_by(Lead.found_at.desc()).limit(50).all()
    leads_data = [
        {
            "title": l.title,
            "client_name": l.client_name or "",
            "company": l.company or "",
            "budget_max": l.budget_max or 0,
            "budget_min": l.budget_min or 0,
            "status": l.status or "new",
            "successProbability": l.success_probability or 50,
            "urgency": l.urgency or "medium",
            "deadline": l.deadline or "",
        }
        for l in leads
    ]
    briefing = await ai_service.generate_daily_briefing(leads_data)
    return briefing


class QualityCheckRequest(BaseModel):
    title: str = ""
    cover_letter: str = ""
    introduction: str = ""
    technical_plan: str = ""
    timeline: str = ""
    cost_estimate: str = ""
    call_to_action: str = ""
    portfolio_suggestions: List[str] = []


@router.post("/check-quality")
async def check_proposal_quality(request: QualityCheckRequest):
    from app.services.ai_service import ai_service
    result = await ai_service.check_proposal_quality(request.model_dump())
    return result


@router.get("/leads/{lead_id}/decision")
async def analyze_lead_decision(lead_id: str, db: Session = Depends(get_db)):
    from app.services.ai_service import ai_service
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead_data = {
        "title": lead.title,
        "client_name": lead.client_name or "",
        "company": lead.company or "",
        "country": lead.country or "",
        "budget_max": lead.budget_max or 0,
        "budget_min": lead.budget_min or 0,
        "status": lead.status or "new",
        "successProbability": lead.success_probability or 50,
        "competition": lead.competition or 5,
        "technologies": lead.technologies or [],
        "urgency": lead.urgency or "medium",
    }
    result = await ai_service.analyze_lead_decision(lead_data)
    return result
