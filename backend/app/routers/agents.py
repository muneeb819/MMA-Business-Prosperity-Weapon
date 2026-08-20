from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.schema import AgentLog

router = APIRouter()

AGENT_DEFINITIONS = [
    {
        "id": "agent-1",
        "name": "Global Opportunity Hunter",
        "type": "opportunity_hunter",
        "description": "Continuously searches worldwide job boards, platforms, and websites for new opportunities across all IT and business categories.",
        "icon": "🌐",
    },
    {
        "id": "agent-2",
        "name": "Lead Analyzer",
        "type": "lead_analyzer",
        "description": "Deep analyzes each discovered lead to extract client details, assess viability, calculate success probability, and determine expected revenue.",
        "icon": "🔍",
    },
    {
        "id": "agent-3",
        "name": "Proposal Generator",
        "type": "proposal_generator",
        "description": "Creates customized, professional proposals with technical plans, timelines, cost estimates, and compelling cover letters for each qualified lead.",
        "icon": "📝",
    },
]

_agent_status_store: dict[str, str] = {}


@router.get("/", response_model=List[dict])
def get_agents(db: Session = Depends(get_db)):
    agents = []
    for a in AGENT_DEFINITIONS:
        logs = db.query(AgentLog).filter(AgentLog.agent_id == a["id"]).count()
        status = _agent_status_store.get(a["id"], "idle")
        agents.append({
            **a,
            "status": status,
            "last_active": None,
            "tasks_completed": logs,
            "current_task": "",
            "uptime": 0.0,
            "efficiency": 0.0,
        })
    return agents


@router.get("/{agent_id}")
def get_agent(agent_id: str, db: Session = Depends(get_db)):
    for a in AGENT_DEFINITIONS:
        if a["id"] == agent_id:
            logs = db.query(AgentLog).filter(AgentLog.agent_id == a["id"]).count()
            status = _agent_status_store.get(agent_id, "idle")
            return {
                **a,
                "status": status,
                "last_active": None,
                "tasks_completed": logs,
                "current_task": "",
                "uptime": 0.0,
                "efficiency": 0.0,
            }
    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/{agent_id}/start")
def start_agent(agent_id: str):
    if agent_id not in [a["id"] for a in AGENT_DEFINITIONS]:
        raise HTTPException(status_code=404, detail="Agent not found")
    _agent_status_store[agent_id] = "active"
    return {"message": "Agent started", "agent_id": agent_id, "status": "active"}


@router.post("/{agent_id}/pause")
def pause_agent(agent_id: str):
    if agent_id not in [a["id"] for a in AGENT_DEFINITIONS]:
        raise HTTPException(status_code=404, detail="Agent not found")
    _agent_status_store[agent_id] = "paused"
    return {"message": "Agent paused", "agent_id": agent_id, "status": "paused"}


@router.get("/{agent_id}/activity")
def get_agent_activity(agent_id: str, db: Session = Depends(get_db)):
    logs = (
        db.query(AgentLog)
        .filter(AgentLog.agent_id == agent_id)
        .order_by(AgentLog.timestamp.desc())
        .limit(50)
        .all()
    )
    return {
        "agent_id": agent_id,
        "logs": [
            {
                "id": log.id,
                "agent_id": log.agent_id,
                "action": log.action,
                "details": log.details,
                "status": log.status,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in logs
        ],
    }


@router.get("/{agent_id}/logs")
def get_agent_logs(agent_id: str, db: Session = Depends(get_db)):
    logs = (
        db.query(AgentLog)
        .filter(AgentLog.agent_id == agent_id)
        .order_by(AgentLog.timestamp.desc())
        .limit(50)
        .all()
    )
    return {
        "agent_id": agent_id,
        "logs": [
            {
                "id": log.id,
                "agent_id": log.agent_id,
                "action": log.action,
                "details": log.details,
                "status": log.status,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            }
            for log in logs
        ],
    }
