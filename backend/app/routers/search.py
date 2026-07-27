from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from pydantic import BaseModel
from app.models.database import get_db
from app.models.schema import Lead

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    country: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    technologies: Optional[List[str]] = None
    job_type: Optional[str] = None
    sort_by: Optional[str] = "relevance"


class SearchResult(BaseModel):
    id: str
    title: str
    description: str
    company: str
    country: str
    budget_min: float
    budget_max: float
    technologies: List[str]
    success_probability: float
    url: str
    source: str


def _lead_to_search_result(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "title": lead.title,
        "description": lead.description or "",
        "company": lead.company or "",
        "country": lead.country or "",
        "budget_min": lead.budget_min or 0,
        "budget_max": lead.budget_max or 0,
        "technologies": lead.technologies or [],
        "success_probability": lead.success_probability or 0,
        "url": lead.url or "",
        "source": lead.platform or "",
    }


@router.post("/natural-language")
def natural_language_search(request: SearchRequest, db: Session = Depends(get_db)):
    query = db.query(Lead)
    search_term = f"%{request.query}%"
    query = query.filter(
        or_(
            Lead.title.ilike(search_term),
            Lead.description.ilike(search_term),
            Lead.client_name.ilike(search_term),
            Lead.company.ilike(search_term),
            Lead.notes.ilike(search_term),
        )
    )

    if request.country:
        query = query.filter(Lead.country == request.country)
    if request.budget_min is not None:
        query = query.filter(Lead.budget_max >= request.budget_min)
    if request.budget_max is not None:
        query = query.filter(Lead.budget_min <= request.budget_max)
    if request.technologies:
        for tech in request.technologies:
            query = query.filter(Lead.technologies.any(tech))
    if request.job_type:
        query = query.filter(Lead.job_type == request.job_type)

    if request.sort_by == "budget":
        query = query.order_by(Lead.budget_max.desc())
    elif request.sort_by == "date":
        query = query.order_by(Lead.found_at.desc())
    elif request.sort_by == "probability":
        query = query.order_by(Lead.success_probability.desc())
    else:
        query = query.order_by(
            Lead.success_probability.desc(), Lead.found_at.desc()
        )

    leads = query.limit(50).all()

    return {
        "query": request.query,
        "results": [_lead_to_search_result(l) for l in leads],
        "total": len(leads),
        "agent": "opportunity_hunter",
        "status": "completed",
        "message": f"Found {len(leads)} matching opportunities",
    }


@router.get("/sources")
def get_search_sources():
    return {
        "sources": [
            {"name": "LinkedIn Jobs", "status": "active", "found": 89},
            {"name": "Indeed", "status": "active", "found": 67},
            {"name": "Upwork", "status": "active", "found": 56},
            {"name": "Freelancer", "status": "active", "found": 38},
            {"name": "Google Search", "status": "active", "found": 156},
        ]
    }


@router.post("/sources/{source_name}/toggle")
def toggle_source(source_name: str):
    return {"source": source_name, "status": "toggled"}
