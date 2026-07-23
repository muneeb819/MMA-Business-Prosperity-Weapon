from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class LeadBase(BaseModel):
    title: str
    description: str
    client_name: str
    company: str
    email: str
    phone: str
    country: str
    budget_min: float
    budget_max: float
    deadline: str
    technologies: List[str]
    skills: List[str]
    platform: str
    job_type: str
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

class LeadResponse(LeadBase):
    id: str
    found_at: str
    analyzed_at: Optional[str] = None

@router.get("/", response_model=List[LeadResponse])
async def get_leads(
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    country: Optional[str] = None,
    technology: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    """Get all leads with optional filters."""
    return []

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str):
    """Get a specific lead by ID."""
    raise HTTPException(status_code=404, detail="Lead not found")

@router.post("/", response_model=LeadResponse)
async def create_lead(lead: LeadBase):
    """Create a new lead."""
    return {**lead.model_dump(), "id": "new-lead-id", "found_at": "2024-01-01T00:00:00Z"}

@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(lead_id: str, lead: LeadBase):
    """Update a lead."""
    return {**lead.model_dump(), "id": lead_id, "found_at": "2024-01-01T00:00:00Z"}

@router.delete("/{lead_id}")
async def delete_lead(lead_id: str):
    """Delete a lead."""
    return {"message": "Lead deleted successfully"}

@router.post("/{lead_id}/analyze")
async def analyze_lead(lead_id: str):
    """Trigger AI analysis for a lead."""
    return {
        "message": "Analysis started",
        "lead_id": lead_id,
        "agent": "lead_analyzer",
        "estimated_time": "30 seconds",
    }

@router.get("/stats/summary")
async def get_lead_stats():
    """Get lead statistics summary."""
    return {
        "total": 347,
        "new": 15,
        "analyzing": 8,
        "qualified": 42,
        "proposal_sent": 23,
        "won": 18,
        "lost": 5,
    }
