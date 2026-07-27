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
async def natural_language_search(request: SearchRequest, db: Session = Depends(get_db)):
    from app.services.ai_service import ai_service

    interpretation = await ai_service.natural_language_search(request.query)

    filters = interpretation.get("filters", {})
    keywords = interpretation.get("search_keywords", [request.query])

    query = db.query(Lead)

    keyword_conditions = []
    for kw in keywords:
        term = f"%{kw}%"
        keyword_conditions.append(Lead.title.ilike(term))
        keyword_conditions.append(Lead.description.ilike(term))
        keyword_conditions.append(Lead.client_name.ilike(term))
        keyword_conditions.append(Lead.company.ilike(term))

    if keyword_conditions:
        query = query.filter(or_(*keyword_conditions))

    ai_country = filters.get("country")
    if request.country:
        query = query.filter(Lead.country == request.country)
    elif ai_country:
        query = query.filter(Lead.country.ilike(f"%{ai_country}%"))

    ai_budget_min = filters.get("budget_min")
    ai_budget_max = filters.get("budget_max")
    if request.budget_min is not None:
        query = query.filter(Lead.budget_max >= request.budget_min)
    elif ai_budget_min is not None:
        query = query.filter(Lead.budget_max >= ai_budget_min)
    if request.budget_max is not None:
        query = query.filter(Lead.budget_min <= request.budget_max)
    elif ai_budget_max is not None:
        query = query.filter(Lead.budget_min <= ai_budget_max)

    ai_techs = filters.get("technologies", [])
    all_techs = (request.technologies or []) + ai_techs
    for tech in all_techs:
        query = query.filter(Lead.technologies.any(tech))

    ai_job_type = filters.get("job_type")
    if request.job_type:
        query = query.filter(Lead.job_type == request.job_type)
    elif ai_job_type:
        query = query.filter(Lead.job_type.ilike(f"%{ai_job_type}%"))

    if request.sort_by == "budget":
        query = query.order_by(Lead.budget_max.desc())
    elif request.sort_by == "date":
        query = query.order_by(Lead.found_at.desc())
    elif request.sort_by == "probability":
        query = query.order_by(Lead.success_probability.desc())
    else:
        query = query.order_by(Lead.success_probability.desc(), Lead.found_at.desc())

    leads = query.limit(50).all()

    return {
        "query": request.query,
        "interpreted_query": interpretation.get("interpreted_query", request.query),
        "results": [_lead_to_search_result(l) for l in leads],
        "total": len(leads),
        "agent": "opportunity_hunter",
        "status": "completed",
        "message": f"Found {len(leads)} matching opportunities",
        "ai_interpretation": {
            "understanding": interpretation.get("interpreted_query", request.query),
            "keywords_used": keywords,
            "filters_applied": filters,
            "suggestions": interpretation.get("suggestions", []),
            "strategy": interpretation.get("search_strategy", ""),
        },
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
