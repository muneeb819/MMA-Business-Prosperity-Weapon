import asyncio
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db, SessionLocal
from app.models.schema import AgentLog, Lead, Proposal, Notification

router = APIRouter()

AGENT_DEFINITIONS = [
    {
        "id": "agent-1",
        "name": "Global Opportunity Hunter",
        "type": "opportunity_hunter",
        "description": "Continuously searches worldwide job boards for new IT and business opportunities.",
        "icon": "🌐",
    },
    {
        "id": "agent-2",
        "name": "Lead Analyzer",
        "type": "lead_analyzer",
        "description": "Deep analyzes each discovered lead to assess viability, calculate success probability, and determine expected revenue.",
        "icon": "🔍",
    },
    {
        "id": "agent-3",
        "name": "Proposal Generator",
        "type": "proposal_generator",
        "description": "Creates customized, professional proposals for qualified leads.",
        "icon": "📝",
    },
]

_agent_status_store: dict[str, str] = {}
_agent_task_store: dict[str, str] = {}


def _log_agent(db: Session, agent_id: str, action: str, details: str, status: str = "success"):
    log = AgentLog(
        id=f"log-{uuid.uuid4().hex[:12]}",
        agent_id=agent_id,
        action=action,
        details=details,
        status=status,
        timestamp=datetime.utcnow(),
    )
    db.add(log)
    db.commit()


def _create_notification(db: Session, notif_type: str, title: str, message: str, priority: str = "medium"):
    notif = Notification(
        id=f"notif-{uuid.uuid4().hex[:12]}",
        type=notif_type,
        title=title,
        message=message,
        read=False,
        priority=priority,
        created_at=datetime.utcnow(),
    )
    db.add(notif)
    db.commit()


async def _run_opportunity_hunter(db: Session):
    from app.services.sync import sync_all_sources
    _agent_task_store["agent-1"] = "Fetching leads from all sources..."
    try:
        results = await sync_all_sources(db, limit_per_source=20)
        total_new = sum(r.get("new", 0) for r in results.values() if isinstance(r, dict))
        total_fetched = sum(r.get("fetched", 0) for r in results.values() if isinstance(r, dict))
        sources_ok = sum(1 for r in results.values() if isinstance(r, dict) and r.get("fetched", 0) > 0)

        _log_agent(db, "agent-1", "sync_complete",
                   f"Fetched {total_fetched} leads from {sources_ok} sources, {total_new} new")

        if total_new > 0:
            _create_notification(db, "system", "New Leads Discovered",
                                 f"Opportunity Hunter found {total_new} new leads from {sources_ok} platforms", "high")

        _agent_task_store["agent-1"] = f"Found {total_new} new leads"
        return {"new": total_new, "fetched": total_fetched, "sources": sources_ok}
    except Exception as e:
        _log_agent(db, "agent-1", "sync_error", str(e), "error")
        _agent_task_store["agent-1"] = f"Error: {str(e)[:50]}"
        return {"error": str(e)}


async def _run_lead_analyzer(db: Session):
    from app.services.ai_service import ai_service
    unanalyzed = db.query(Lead).filter(Lead.analyzed_at == None).limit(20).all()
    if not unanalyzed:
        _agent_task_store["agent-2"] = "No unanalyzed leads found"
        _log_agent(db, "agent-2", "analyze_complete", "No unanalyzed leads found")
        return {"analyzed": 0}

    _agent_task_store["agent-2"] = f"Analyzing {len(unanalyzed)} leads..."
    analyzed_count = 0

    for lead in unanalyzed:
        try:
            lead_data = {
                "title": lead.title,
                "description": lead.description or "",
                "budget_min": lead.budget_min or 0,
                "budget_max": lead.budget_max or 0,
                "client_name": lead.client_name or "Unknown",
                "company": lead.company or "Unknown",
                "technologies": lead.technologies or [],
                "country": lead.country or "Global",
                "competition": lead.competition or 0,
                "platform": lead.platform or "Unknown",
                "job_type": lead.job_type or "unknown",
            }
            analysis = await ai_service.analyze_lead(lead_data)
            lead.success_probability = analysis.get("success_probability", 50)
            lead.difficulty = analysis.get("difficulty", 50)
            lead.risk_level = analysis.get("risk_level", "medium")
            lead.expected_revenue = analysis.get("expected_revenue", 0)
            lead.notes = analysis.get("recommendation", lead.notes or "")
            lead.tags = (lead.tags or []) + analysis.get("tags", [])
            lead.analyzed_at = datetime.utcnow()
            if lead.status == "new":
                lead.status = "analyzing"
            analyzed_count += 1
        except Exception:
            pass

    db.commit()
    _log_agent(db, "agent-2", "analyze_complete", f"Analyzed {analyzed_count} leads")
    _agent_task_store["agent-2"] = f"Analyzed {analyzed_count} leads"

    if analyzed_count > 0:
        qualified = db.query(Lead).filter(
            Lead.analyzed_at != None,
            Lead.status == "analyzing"
        ).count()
        _create_notification(db, "system", "Leads Analyzed",
                             f"Lead Analyzer processed {analyzed_count} leads. {qualified} now qualified.", "medium")

    return {"analyzed": analyzed_count}


async def _run_proposal_generator(db: Session):
    from app.services.ai_service import ai_service
    qualified = db.query(Lead).filter(
        Lead.status.in_(["analyzing", "qualified"]),
        Lead.success_probability >= 50,
    ).limit(5).all()

    if not qualified:
        _agent_task_store["agent-3"] = "No qualified leads to generate proposals for"
        _log_agent(db, "agent-3", "generate_complete", "No qualified leads found")
        return {"generated": 0}

    _agent_task_store["agent-3"] = f"Generating proposals for {len(qualified)} leads..."
    generated_count = 0

    for lead in qualified:
        try:
            existing = db.query(Proposal).filter(Proposal.lead_id == lead.id).first()
            if existing:
                continue

            lead_data = {
                "title": lead.title,
                "description": lead.description or "",
                "budget_min": lead.budget_min or 0,
                "budget_max": lead.budget_max or 0,
                "client_name": lead.client_name or "Client",
                "company": lead.company or "Company",
                "technologies": lead.technologies or [],
                "country": lead.country or "Global",
                "competition": lead.competition or 0,
            }
            generated = await ai_service.generate_proposal(lead_data, tone="professional")

            proposal = Proposal(
                id=str(uuid.uuid4()),
                lead_id=lead.id,
                title=generated.get("title", f"Proposal for {lead.title}"),
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
            db.add(proposal)
            lead.status = "proposal_sent"
            lead.proposal_id = proposal.id if hasattr(lead, 'proposal_id') else None
            generated_count += 1
        except Exception:
            pass

    db.commit()
    _log_agent(db, "agent-3", "generate_complete", f"Generated {generated_count} proposals")
    _agent_task_store["agent-3"] = f"Generated {generated_count} proposals"

    if generated_count > 0:
        _create_notification(db, "high_value", "Proposals Generated",
                             f"Proposal Generator created {generated_count} new proposals for qualified leads", "high")

    return {"generated": generated_count}


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
            "current_task": _agent_task_store.get(a["id"], ""),
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
                "current_task": _agent_task_store.get(agent_id, ""),
                "uptime": 0.0,
                "efficiency": 0.0,
            }
    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/{agent_id}/start")
def start_agent(agent_id: str, db: Session = Depends(get_db)):
    if agent_id not in [a["id"] for a in AGENT_DEFINITIONS]:
        raise HTTPException(status_code=404, detail="Agent not found")

    _agent_status_store[agent_id] = "active"

    agent_def = next(a for a in AGENT_DEFINITIONS if a["id"] == agent_id)
    _log_agent(db, agent_id, "started", f"{agent_def['name']} agent started")
    _agent_task_store[agent_id] = f"Starting {agent_def['name']}..."

    _agent_task_store[agent_id] = f"Running {agent_def['name']}..."
    return {
        "message": "Agent started",
        "agent_id": agent_id,
        "status": "active",
    }


@router.post("/{agent_id}/run")
async def run_agent(agent_id: str, db: Session = Depends(get_db)):
    if agent_id not in [a["id"] for a in AGENT_DEFINITIONS]:
        raise HTTPException(status_code=404, detail="Agent not found")

    _agent_status_store[agent_id] = "active"
    agent_def = next(a for a in AGENT_DEFINITIONS if a["id"] == agent_id)
    _log_agent(db, agent_id, "run_started", f"Executing {agent_def['name']}")

    try:
        if agent_id == "agent-1":
            result = await _run_opportunity_hunter(db)
        elif agent_id == "agent-2":
            result = await _run_lead_analyzer(db)
        elif agent_id == "agent-3":
            result = await _run_proposal_generator(db)
        else:
            result = {"error": "Unknown agent"}

        _agent_status_store[agent_id] = "idle"
        _log_agent(db, agent_id, "run_complete", f"Completed: {result}")

        return {
            "message": "Agent run completed",
            "agent_id": agent_id,
            "status": "idle",
            "result": result,
        }
    except Exception as e:
        _agent_status_store[agent_id] = "error"
        _log_agent(db, agent_id, "run_error", str(e), "error")
        return {
            "message": "Agent run failed",
            "agent_id": agent_id,
            "status": "error",
            "error": str(e),
        }


@router.post("/{agent_id}/pause")
def pause_agent(agent_id: str):
    if agent_id not in [a["id"] for a in AGENT_DEFINITIONS]:
        raise HTTPException(status_code=404, detail="Agent not found")
    _agent_status_store[agent_id] = "paused"
    _agent_task_store[agent_id] = "Paused"
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
