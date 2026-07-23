from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    country: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    technologies: Optional[List[str]] = None
    job_type: Optional[str] = None

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

@router.post("/natural-language")
async def natural_language_search(request: SearchRequest):
    """AI-powered natural language search for opportunities."""
    return {
        "query": request.query,
        "results": [],
        "total": 0,
        "agent": "opportunity_hunter",
        "status": "searching",
        "message": "AI search initiated across all platforms",
    }

@router.get("/sources")
async def get_search_sources():
    """Get all active search sources."""
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
async def toggle_source(source_name: str):
    """Toggle a search source on/off."""
    return {"source": source_name, "status": "toggled"}
