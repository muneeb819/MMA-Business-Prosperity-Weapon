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
