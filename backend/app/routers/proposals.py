from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.models.database import get_db
from app.models.schema import Proposal, Lead

router = APIRouter()


class ProposalBase(BaseModel):
    lead_id: str
    title: str
    cover_letter: str = ""
    introduction: str = ""
    technical_plan: str = ""
    timeline: str = ""
    cost_estimate: str = ""
    portfolio_suggestions: List[str] = []
    call_to_action: str = ""


class ProposalResponse(BaseModel):
    id: str
    lead_id: str
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
    lead_id: str
    tone: str = "professional"


def _proposal_to_dict(prop: Proposal) -> dict:
    return {
        "id": prop.id,
        "lead_id": prop.lead_id or "",
        "title": prop.title,
        "cover_letter": prop.cover_letter or "",
        "introduction": prop.introduction or "",
        "technical_plan": prop.technical_plan or "",
        "timeline": prop.timeline or "",
        "cost_estimate": prop.cost_estimate or "",
        "portfolio_suggestions": prop.portfolio_suggestions or [],
        "call_to_action": prop.call_to_action or "",
        "win_probability": prop.win_probability or 0,
        "status": prop.status or "draft",
        "created_at": prop.created_at.isoformat() if prop.created_at else None,
        "submitted_at": prop.submitted_at.isoformat() if prop.submitted_at else None,
    }


@router.get("/", response_model=List[ProposalResponse])
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


@router.get("/{proposal_id}", response_model=ProposalResponse)
def get_proposal(proposal_id: str, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return _proposal_to_dict(prop)


@router.post("/", response_model=ProposalResponse, status_code=201)
def create_proposal(proposal: ProposalBase, db: Session = Depends(get_db)):
    db_prop = Proposal(
        id=str(uuid.uuid4()),
        lead_id=proposal.lead_id,
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


@router.put("/{proposal_id}", response_model=ProposalResponse)
def update_proposal(proposal_id: str, proposal: ProposalBase, db: Session = Depends(get_db)):
    db_prop = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    db_prop.lead_id = proposal.lead_id
    db_prop.title = proposal.title
    db_prop.cover_letter = proposal.cover_letter
    db_prop.introduction = proposal.introduction
    db_prop.technical_plan = proposal.technical_plan
    db_prop.timeline = proposal.timeline
    db_prop.cost_estimate = proposal.cost_estimate
    db_prop.portfolio_suggestions = proposal.portfolio_suggestions
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


@router.post("/{proposal_id}/submit", response_model=ProposalResponse)
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


@router.post("/{proposal_id}/duplicate", response_model=ProposalResponse, status_code=201)
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


@router.post("/generate", response_model=ProposalResponse, status_code=201)
async def generate_proposal(request: GenerateRequest, db: Session = Depends(get_db)):
    db_lead = db.query(Lead).filter(Lead.id == request.lead_id).first()
    if not db_lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    from app.services.ai_service import ai_service
    generated = await ai_service.generate_proposal(
        {
            "title": db_lead.title,
            "description": db_lead.description,
            "budget_min": db_lead.budget_min,
            "budget_max": db_lead.budget_max,
            "client_name": db_lead.client_name,
            "company": db_lead.company,
            "technologies": db_lead.technologies,
        },
        tone=request.tone,
    )

    new_prop = Proposal(
        id=str(uuid.uuid4()),
        lead_id=request.lead_id,
        title=generated.get("title", f"Proposal for {db_lead.title}"),
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
    return _proposal_to_dict(new_prop)
