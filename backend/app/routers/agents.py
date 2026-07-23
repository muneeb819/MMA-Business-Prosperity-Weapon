from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

router = APIRouter()

class AgentStatus(BaseModel):
    id: str
    name: str
    type: str
    status: str
    last_active: str
    tasks_completed: int
    current_task: str | None = None
    uptime: float
    efficiency: float

@router.get("/", response_model=List[AgentStatus])
async def get_agents():
    """Get status of all AI agents."""
    return [
        AgentStatus(
            id="agent-1",
            name="Global Opportunity Hunter",
            type="opportunity_hunter",
            status="scanning",
            last_active="2024-01-01T00:00:00Z",
            tasks_completed=1247,
            current_task="Scanning LinkedIn & Indeed for React developer positions...",
            uptime=99.7,
            efficiency=94.2,
        ),
        AgentStatus(
            id="agent-2",
            name="Lead Analyzer",
            type="lead_analyzer",
            status="analyzing",
            last_active="2024-01-01T00:00:00Z",
            tasks_completed=892,
            current_task="Analyzing budget & success probability for lead #3847...",
            uptime=99.9,
            efficiency=97.1,
        ),
        AgentStatus(
            id="agent-3",
            name="Proposal Generator",
            type="proposal_generator",
            status="generating",
            last_active="2024-01-01T00:00:00Z",
            tasks_completed=634,
            current_task="Generating proposal for E-Commerce Platform Redesign...",
            uptime=99.5,
            efficiency=92.8,
        ),
    ]

@router.post("/{agent_id}/start")
async def start_agent(agent_id: str):
    """Start an AI agent."""
    return {"message": "Agent started", "agent_id": agent_id}

@router.post("/{agent_id}/pause")
async def pause_agent(agent_id: str):
    """Pause an AI agent."""
    return {"message": "Agent paused", "agent_id": agent_id}

@router.get("/{agent_id}/logs")
async def get_agent_logs(agent_id: str):
    """Get agent activity logs."""
    return {"agent_id": agent_id, "logs": []}
