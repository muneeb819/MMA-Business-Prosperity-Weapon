from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class ProposalBase(BaseModel):
    lead_id: str
    title: str
    cover_letter: str
    introduction: str
    technical_plan: str
    timeline: str
    cost_estimate: str
    portfolio_suggestions: List[str]
    call_to_action: str

class ProposalResponse(ProposalBase):
    id: str
    win_probability: float = 0
    status: str = "draft"
    created_at: str
    submitted_at: Optional[str] = None

@router.get("/", response_model=List[ProposalResponse])
async def get_proposals(status: Optional[str] = None):
    """Get all proposals."""
    return []

@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(proposal_id: str):
    """Get a specific proposal."""
    raise HTTPException(status_code=404, detail="Proposal not found")

@router.post("/generate")
async def generate_proposal(lead_id: str, tone: str = "professional"):
    """Generate a proposal using AI."""
    return {
        "message": "Proposal generation started",
        "lead_id": lead_id,
        "tone": tone,
        "agent": "proposal_generator",
        "estimated_time": "60 seconds",
    }

@router.post("/{proposal_id}/submit")
async def submit_proposal(proposal_id: str):
    """Submit a proposal."""
    return {"message": "Proposal submitted", "proposal_id": proposal_id}

@router.put("/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(proposal_id: str, proposal: ProposalBase):
    """Update a proposal."""
    return {**proposal.model_dump(), "id": proposal_id, "created_at": "2024-01-01T00:00:00Z"}
