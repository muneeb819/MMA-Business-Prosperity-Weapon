from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.models.database import get_db
from app.models.schema import AgentLog

router = APIRouter()

MOCK_AGENTS = [
    {
        "id": "agent-1",
        "name": "Global Opportunity Hunter",
        "type": "opportunity_hunter",
        "status": "scanning",
        "last_active": datetime.utcnow().isoformat(),
        "tasks_completed": 1247,
        "current_task": "Scanning LinkedIn & Indeed for React developer positions...",
        "uptime": 99.7,
        "efficiency": 94.2,
        "description": "Continuously searches worldwide job boards, platforms, and websites for new opportunities across all IT and business categories.",
        "icon": "\U0001F310",
    },
    {
        "id": "agent-2",
        "name": "Lead Analyzer",
        "type": "lead_analyzer",
        "status": "analyzing",
        "last_active": datetime.utcnow().isoformat(),
        "tasks_completed": 892,
        "current_task": "Analyzing budget & success probability for lead #3847...",
        "uptime": 99.9,
        "efficiency": 97.1,
        "description": "Deep analyzes each discovered lead to extract client details, assess viability, calculate success probability, and determine expected revenue.",
        "icon": "\U0001F50D",
    },
    {
        "id": "agent-3",
        "name": "Proposal Generator",
        "type": "proposal_generator",
        "status": "generating",
        "last_active": datetime.utcnow().isoformat(),
        "tasks_completed": 634,
        "current_task": "Generating proposal for E-Commerce Platform Redesign...",
        "uptime": 99.5,
        "efficiency": 92.8,
        "description": "Creates customized, professional proposals with technical plans, timelines, cost estimates, and compelling cover letters for each qualified lead.",
        "icon": "\U0001F4DD",
    },
]

_agent_status_store = {
    "agent-1": "scanning",
    "agent-2": "analyzing",
    "agent-3": "generating",
}


@router.get("/", response_model=List[dict])
def get_agents():
    agents = []
    for a in MOCK_AGENTS:
        agents.append({
            **a,
            "status": _agent_status_store.get(a["id"], a["status"]),
        })
    return agents


@router.get("/{agent_id}")
def get_agent(agent_id: str):
    for a in MOCK_AGENTS:
        if a["id"] == agent_id:
            return {
                **a,
                "status": _agent_status_store.get(agent_id, a["status"]),
            }
    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/{agent_id}/start")
def start_agent(agent_id: str):
    if agent_id not in [a["id"] for a in MOCK_AGENTS]:
        raise HTTPException(status_code=404, detail="Agent not found")

    status_map = {
        "agent-1": "scanning",
        "agent-2": "analyzing",
        "agent-3": "generating",
    }
    _agent_status_store[agent_id] = status_map.get(agent_id, "active")
    return {"message": "Agent started", "agent_id": agent_id, "status": _agent_status_store[agent_id]}


@router.post("/{agent_id}/pause")
def pause_agent(agent_id: str):
    if agent_id not in [a["id"] for a in MOCK_AGENTS]:
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
