import random
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()

AGENT_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "id": "agent-hunter-1",
        "name": "Scout Alpha",
        "role": "hunter",
        "team": "hunting",
        "avatar": "🎯",
        "description": "Finds new leads by scanning top job boards for fresh postings.",
        "channel": "job boards",
        "outputMetric": "leads found",
        "defaultTask": "Scanning job board postings",
    },
    {
        "id": "agent-hunter-2",
        "name": "Scout Beta",
        "role": "hunter",
        "team": "hunting",
        "avatar": "🌐",
        "description": "Discovers leads by researching company websites and career pages.",
        "channel": "company websites",
        "outputMetric": "leads found",
        "defaultTask": "Researching company career pages",
    },
    {
        "id": "agent-hunter-3",
        "name": "Scout Gamma",
        "role": "hunter",
        "team": "hunting",
        "avatar": "🔗",
        "description": "Sources leads from LinkedIn and social media networks.",
        "channel": "LinkedIn/social",
        "outputMetric": "leads found",
        "defaultTask": "Mining LinkedIn connections",
    },
    {
        "id": "agent-hunter-4",
        "name": "Scout Delta",
        "role": "hunter",
        "team": "hunting",
        "avatar": "💼",
        "description": "Identifies leads from freelance platforms like Upwork and Fiverr.",
        "channel": "freelance platforms",
        "outputMetric": "leads found",
        "defaultTask": "Browsing freelance platform listings",
    },
    {
        "id": "agent-hunter-5",
        "name": "Scout Echo",
        "role": "hunter",
        "team": "hunting",
        "avatar": "💬",
        "description": "Monitors tech communities and forums for project opportunities.",
        "channel": "tech communities",
        "outputMetric": "leads found",
        "defaultTask": "Monitoring tech community threads",
    },
    {
        "id": "agent-hunter-6",
        "name": "Scout Foxtrot",
        "role": "hunter",
        "team": "hunting",
        "avatar": "🤝",
        "description": "Gathers warm leads through referral networks.",
        "channel": "referrals",
        "outputMetric": "leads found",
        "defaultTask": "Following up on referral networks",
    },
    {
        "id": "team-lead-hunting",
        "name": "Hunting Lead",
        "role": "team_lead",
        "team": "hunting",
        "avatar": "🧭",
        "description": "Coordinates the six scouts and owns the lead hunting pipeline.",
        "defaultTask": "Coordinating scout operations",
    },
    {
        "id": "agent-outreach-1",
        "name": "Contact Alpha",
        "role": "outreacher",
        "team": "outreach",
        "avatar": "✉️",
        "description": "Sends initial outreach emails to qualified leads.",
        "outputMetric": "initial emails sent",
        "defaultTask": "Sending initial outreach emails",
    },
    {
        "id": "agent-outreach-2",
        "name": "Contact Beta",
        "role": "outreacher",
        "team": "outreach",
        "avatar": "🔁",
        "description": "Runs follow-up email sequences until a response arrives.",
        "outputMetric": "follow-up emails sent",
        "defaultTask": "Running follow-up sequences",
    },
    {
        "id": "agent-outreach-3",
        "name": "Contact Gamma",
        "role": "outreacher",
        "team": "outreach",
        "avatar": "📝",
        "description": "Generates tailored proposals for interested leads.",
        "outputMetric": "proposals generated",
        "defaultTask": "Drafting custom proposals",
    },
    {
        "id": "agent-outreach-4",
        "name": "Contact Delta",
        "role": "outreacher",
        "team": "outreach",
        "avatar": "⚖️",
        "description": "Handles pricing negotiations with prospects.",
        "outputMetric": "negotiations handled",
        "defaultTask": "Negotiating terms with prospects",
    },
    {
        "id": "agent-outreach-5",
        "name": "Contact Echo",
        "role": "outreacher",
        "team": "outreach",
        "avatar": "📊",
        "description": "Keeps CRM records accurate and up to date.",
        "outputMetric": "CRM entries updated",
        "defaultTask": "Updating CRM records",
    },
    {
        "id": "agent-outreach-6",
        "name": "Contact Foxtrot",
        "role": "outreacher",
        "team": "outreach",
        "avatar": "👀",
        "description": "Tracks responses and engagement across all channels.",
        "outputMetric": "responses tracked",
        "defaultTask": "Tracking prospect responses",
    },
    {
        "id": "team-lead-outreach",
        "name": "Outreach Lead",
        "role": "team_lead",
        "team": "outreach",
        "avatar": "📣",
        "description": "Coordinates the six contact agents and owns the outreach pipeline.",
        "defaultTask": "Coordinating outreach operations",
    },
    {
        "id": "manager",
        "name": "Director AI",
        "role": "manager",
        "team": "management",
        "avatar": "🎖️",
        "description": "Oversees both teams, reviews performance, and provides daily reports.",
        "defaultTask": "Reviewing overall operations",
    },
]

_agents: Dict[str, Dict[str, Any]] = {}
_activity_log: List[Dict[str, str]] = []


def _seeded_rng(seed_text: str) -> random.Random:
    return random.Random(seed_text)


def _seeded_int(seed_text: str, low: int, high: int) -> int:
    return _seeded_rng(seed_text).randint(low, high)


def _today_key() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d")


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


def _log_activity(agent_id: str, action: str, details: str) -> None:
    agent = _agents.get(agent_id)
    _activity_log.insert(
        0,
        {
            "timestamp": _now_iso(),
            "agent_id": agent_id,
            "agent_name": agent["name"] if agent else agent_id,
            "action": action,
            "details": details,
        },
    )
    del _activity_log[200:]


def _init_agents() -> None:
    for definition in AGENT_DEFINITIONS:
        agent_id = definition["id"]
        rng = _seeded_rng(f"{_today_key()}:{agent_id}:state")
        status = "working" if rng.random() < 0.55 else "idle"

        if definition["role"] == "hunter":
            manages: List[str] = []
            reports_to = "team-lead-hunting"
        elif definition["role"] == "outreacher":
            manages = []
            reports_to = "team-lead-outreach"
        elif definition["role"] == "team_lead":
            team = definition["team"]
            manages = [a["id"] for a in AGENT_DEFINITIONS if a.get("team") == team and a["role"] != "team_lead"]
            reports_to = "manager"
        else:
            manages = ["team-lead-hunting", "team-lead-outreach"]
            reports_to = ""

        _agents[agent_id] = {
            "id": agent_id,
            "name": definition["name"],
            "role": definition["role"],
            "team": definition["team"],
            "status": status,
            "avatar": definition["avatar"],
            "description": definition["description"],
            "tasksCompleted": _seeded_int(f"{agent_id}:tasks", 12, 240),
            "currentTask": definition["defaultTask"],
            "efficiency": _seeded_int(f"{agent_id}:efficiency", 72, 97),
            "reportsTo": reports_to,
            "manages": manages,
            "lastActive": _now_iso(),
        }

    for definition in reversed(AGENT_DEFINITIONS):
        _log_activity(
            definition["id"],
            "initialized",
            f"{definition['name']} came online",
        )


_init_agents()


def _daily_output(agent_id: str) -> Dict[str, Any]:
    definition = next(a for a in AGENT_DEFINITIONS if a["id"] == agent_id)
    day = _today_key()
    if definition["role"] == "hunter":
        count = _seeded_int(f"{day}:{agent_id}:output", 2, 14)
        return {"count": count, "label": f"{count} leads found"}
    if agent_id == "agent-outreach-1":
        count = _seeded_int(f"{day}:{agent_id}:output", 8, 24)
        return {"count": count, "label": f"{count} initial emails sent"}
    if agent_id == "agent-outreach-2":
        count = _seeded_int(f"{day}:{agent_id}:output", 10, 30)
        return {"count": count, "label": f"{count} follow-up emails sent"}
    if agent_id == "agent-outreach-3":
        count = _seeded_int(f"{day}:{agent_id}:output", 1, 4)
        return {"count": count, "label": f"{count} proposals generated"}
    if agent_id == "agent-outreach-4":
        count = _seeded_int(f"{day}:{agent_id}:output", 0, 3)
        return {"count": count, "label": f"{count} negotiations handled"}
    if agent_id == "agent-outreach-5":
        count = _seeded_int(f"{day}:{agent_id}:output", 8, 20)
        return {"count": count, "label": f"{count} CRM entries updated"}
    if agent_id == "agent-outreach-6":
        count = _seeded_int(f"{day}:{agent_id}:output", 4, 16)
        return {"count": count, "label": f"{count} responses tracked"}
    return {"count": 0, "label": "no direct output"}


def _team_members(team: str) -> List[Dict[str, Any]]:
    return [
        _agents[a["id"]]
        for a in AGENT_DEFINITIONS
        if a["team"] == team and a["role"] not in ("team_lead", "manager")
    ]


def _team_efficiency(team: str) -> int:
    members = _team_members(team)
    return round(sum(m["efficiency"] for m in members) / len(members))


def _active_count(team: Optional[str] = None) -> int:
    agents = list(_agents.values()) if team is None else _team_members(team)
    return sum(1 for a in agents if a["status"] in ("active", "working"))


def _collect_issues() -> List[str]:
    issues: List[str] = []
    for agent in _agents.values():
        if agent["status"] == "paused":
            issues.append(f"{agent['name']} is paused and not contributing")
    day = _today_key()
    if _seeded_int(f"{day}:linkedin-limit", 0, 9) == 0:
        issues.append("LinkedIn rate limiting is slowing down Scout Gamma")
    if _seeded_int(f"{day}:reply-backlog", 0, 9) > 7:
        issues.append("Contact Beta has a follow-up queue backlog")
    return issues


def _daily_report() -> Dict[str, Any]:
    day = _today_key()
    leads_by_agent = [
        {
            "agentId": a["id"],
            "agentName": a["name"],
            "channel": a["channel"],
            "count": _daily_output(a["id"])["count"],
        }
        for a in AGENT_DEFINITIONS
        if a["role"] == "hunter"
    ]
    outreach_by_agent = [
        {
            "agentId": a["id"],
            "agentName": a["name"],
            **_daily_output(a["id"]),
        }
        for a in AGENT_DEFINITIONS
        if a["role"] == "outreacher"
    ]
    proposals_generated = _daily_output("agent-outreach-3")["count"]
    emails_sent = _daily_output("agent-outreach-1")["count"] + _daily_output("agent-outreach-2")["count"]

    return {
        "date": day,
        "generatedAt": _now_iso(),
        "leadsFoundToday": {
            "total": sum(item["count"] for item in leads_by_agent),
            "byAgent": leads_by_agent,
        },
        "outreachSentToday": {
            "byAgent": outreach_by_agent,
        },
        "proposalsGenerated": proposals_generated,
        "emailsSent": emails_sent,
        "teamEfficiency": {
            "hunting": _team_efficiency("hunting"),
            "outreach": _team_efficiency("outreach"),
            "overall": round(sum(a["efficiency"] for a in _agents.values()) / len(_agents)),
        },
        "issues": _collect_issues(),
    }


def _has_any(text: str, keywords: List[str]) -> bool:
    return any(re.search(rf"\b{re.escape(keyword)}\b", text) for keyword in keywords)


def _member_lines(members: List[Dict[str, Any]]) -> str:
    return "\n".join(
        f"{m['avatar']} {m['name']} ({m['status']}) - {_daily_output(m['id'])['label']}"
        for m in members
    )


def _greeting(agent: Dict[str, Any]) -> str:
    return (
        f"Hello! I am {agent['name']} {agent['avatar']}. "
        "Ask me about team status, tasks, performance, or daily reports."
    )


def _hunting_summary() -> str:
    members = _team_members("hunting")
    total_leads = sum(_daily_output(m["id"])["count"] for m in members)
    lead = _agents["team-lead-hunting"]
    return (
        f"Hunting team status (efficiency {_team_efficiency('hunting')}%, "
        f"{_active_count('hunting')}/{len(members)} active):\n"
        f"{_member_lines(members)}\n"
        f"Total leads found today: {total_leads}."
    )


def _outreach_summary() -> str:
    members = _team_members("outreach")
    emails = _daily_output("agent-outreach-1")["count"] + _daily_output("agent-outreach-2")["count"]
    return (
        f"Outreach team status (efficiency {_team_efficiency('outreach')}%, "
        f"{_active_count('outreach')}/{len(members)} active):\n"
        f"{_member_lines(members)}\n"
        f"Emails sent today: {emails}, proposals: {_daily_output('agent-outreach-3')['count']}."
    )


def _issues_summary() -> str:
    issues = _collect_issues()
    if not issues:
        return "No blockers reported. All systems are operating normally."
    return "Current issues and blockers:\n" + "\n".join(f"- {issue}" for issue in issues)


def _performance_summary() -> str:
    hunting = _team_efficiency("hunting")
    outreach = _team_efficiency("outreach")
    best = max(_agents.values(), key=lambda a: a["efficiency"])
    return (
        f"Performance snapshot: hunting team efficiency {hunting}%, "
        f"outreach team efficiency {outreach}%. "
        f"Top performer: {best['name']} at {best['efficiency']}% with "
        f"{best['tasksCompleted']} tasks completed."
    )


def _report_summary() -> str:
    report = _daily_report()
    return (
        f"Daily report for {report['date']}:\n"
        f"- Leads found: {report['leadsFoundToday']['total']}\n"
        f"- Emails sent: {report['emailsSent']}\n"
        f"- Proposals generated: {report['proposalsGenerated']}\n"
        f"- Hunting efficiency: {report['teamEfficiency']['hunting']}%\n"
        f"- Outreach efficiency: {report['teamEfficiency']['outreach']}%\n"
        f"- Issues: {len(report['issues'])}\n"
        "Use /api/ai-teams/reports/daily for the full breakdown."
    )


def _overall_status() -> str:
    active = _active_count()
    total = len(_agents)
    paused = sum(1 for a in _agents.values() if a["status"] == "paused")
    return (
        f"Overall operations: {active}/{total} agents active, {paused} paused. "
        f"Hunting efficiency {_team_efficiency('hunting')}%, "
        f"outreach efficiency {_team_efficiency('outreach')}%. "
        "Everything is under control."
    )


def _manager_reply(message: str) -> str:
    text = message.lower()
    if _has_any(text, ["report", "daily", "summary"]):
        return _report_summary()
    if _has_any(text, ["issue", "blocker", "problem", "risk", "stuck", "delay"]):
        return _issues_summary()
    if _has_any(text, ["performance", "efficiency", "metric", "kpi", "score"]):
        return _performance_summary()
    if _has_any(text, ["lead", "hunt", "scout", "source", "prospect"]):
        return _hunting_summary()
    if _has_any(text, ["outreach", "email", "proposal", "crm", "follow", "negotiation", "contact"]):
        return _outreach_summary()
    if _has_any(text, ["status", "update", "overview", "operation", "how are things", "going"]):
        return _overall_status()
    if _has_any(text, ["hello", "hi", "hey", "morning", "afternoon"]):
        return _greeting(_agents["manager"])
    if _has_any(text, ["help", "what can you", "who are you"]):
        return (
            "I oversee the hunting and outreach teams. You can ask me about "
            "operations status, team performance, leads found, outreach progress, "
            "blockers, or request the daily report."
        )
    return (
        "I can brief you on overall operations, team performance, daily reports, "
        "or current blockers. Try asking 'give me the daily report' or "
        "'any blockers today?'."
    )


def _team_lead_reply(agent: Dict[str, Any], message: str) -> str:
    text = message.lower()
    team = agent["team"]
    other_team = "outreach" if team == "hunting" else "hunting"
    other_lead = "Outreach Lead" if team == "hunting" else "Hunting Lead"
    asks_other = _has_any(text, [other_team])
    asks_own = _has_any(text, [team])

    if _has_any(text, ["hello", "hi", "hey"]):
        return _greeting(agent)
    if _has_any(text, ["help", "what can you", "who are you"]):
        return (
            f"I am {agent['name']}, lead of the {team} team. Ask me about my "
            "team's status, individual tasks, performance, or blockers. For "
            f"{other_team} questions, talk to {other_lead} or the Director AI."
        )
    if _has_any(text, ["report", "daily", "summary"]):
        return _report_summary()
    if _has_any(text, ["issue", "blocker", "problem", "risk", "stuck", "delay"]):
        team_issues = [
            issue
            for issue in _collect_issues()
            if any(m["name"] in issue for m in _team_members(team))
        ] or [f"No blockers in the {team} team right now."]
        return f"{team.capitalize()} team issues:\n" + "\n".join(f"- {i}" for i in team_issues)
    if _has_any(text, ["performance", "efficiency", "metric", "kpi", "score"]):
        best = max(_team_members(team), key=lambda m: m["efficiency"])
        return (
            f"{team.capitalize()} team performance: efficiency "
            f"{_team_efficiency(team)}%. Best performer: {best['name']} at "
            f"{best['efficiency']}% with {best['tasksCompleted']} tasks completed."
        )

    if asks_own or not asks_other:
        if team == "hunting":
            return _hunting_summary()
        return _outreach_summary()
    return (
        f"That falls under the {other_team} team. Please chat with {other_lead} "
        "or the Director AI for those details."
    )


def _build_chat_response(agent: Dict[str, Any], message: str) -> str:
    if agent["role"] == "manager":
        return _manager_reply(message)
    return _team_lead_reply(agent, message)


class ChatRequest(BaseModel):
    message: str


@router.get("/")
@router.get("")
def get_ai_teams() -> Dict[str, Any]:
    def public_view(agent: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": agent["id"],
            "name": agent["name"],
            "role": agent["role"],
            "team": agent["team"],
            "status": agent["status"],
            "avatar": agent["avatar"],
            "description": agent["description"],
            "tasksCompleted": agent["tasksCompleted"],
            "currentTask": agent["currentTask"],
            "efficiency": agent["efficiency"],
            "reportsTo": agent["reportsTo"] or None,
            "manages": agent["manages"],
            "lastActive": agent["lastActive"],
        }

    statuses = [a["status"] for a in _agents.values()]
    return {
        "summary": {
            "totalAgents": len(_agents),
            "active": sum(1 for s in statuses if s in ("active", "working")),
            "idle": statuses.count("idle"),
            "working": statuses.count("working"),
            "paused": statuses.count("paused"),
            "averageEfficiency": round(sum(a["efficiency"] for a in _agents.values()) / len(_agents)),
            "totalTasksCompleted": sum(a["tasksCompleted"] for a in _agents.values()),
        },
        "manager": public_view(_agents["manager"]),
        "teams": [
            {
                "id": "hunting",
                "name": "Lead Hunting Team",
                "tier": 1,
                "lead": public_view(_agents["team-lead-hunting"]),
                "agents": [public_view(a) for a in _team_members("hunting")],
            },
            {
                "id": "outreach",
                "name": "Outreach Team",
                "tier": 2,
                "lead": public_view(_agents["team-lead-outreach"]),
                "agents": [public_view(a) for a in _team_members("outreach")],
            },
        ],
    }


@router.get("/reports/daily")
def get_daily_report() -> Dict[str, Any]:
    return _daily_report()


@router.get("/activity")
def get_recent_activity(
    limit: int = Query(default=50, ge=1, le=200),
) -> Dict[str, Any]:
    events = _activity_log[:limit]
    return {"count": len(events), "activity": events}


@router.get("/{agent_id}")
def get_agent(agent_id: str) -> Dict[str, Any]:
    agent = _agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {**agent, "dailyOutput": _daily_output(agent_id)}


@router.post("/{agent_id}/chat")
def chat_with_agent(agent_id: str, payload: ChatRequest) -> Dict[str, str]:
    agent = _agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent["role"] not in ("team_lead", "manager"):
        raise HTTPException(status_code=400, detail="You can only chat with team leads or the manager")

    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    agent["lastActive"] = _now_iso()
    _log_activity(agent_id, "chat", f"Responded to: {message[:80]}")

    return {"response": _build_chat_response(agent, message)}


@router.post("/{agent_id}/toggle")
def toggle_agent(agent_id: str) -> Dict[str, Any]:
    agent = _agents.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    was_paused = agent["status"] == "paused"
    agent["status"] = "active" if was_paused else "paused"
    agent["currentTask"] = agent["defaultTask"] if was_paused else "Paused by operator"
    agent["lastActive"] = _now_iso()

    action = "resumed" if was_paused else "paused"
    _log_activity(agent_id, action, f"{agent['name']} was {action}")

    return {
        "message": f"{agent['name']} {'resumed' if was_paused else 'paused'}",
        "agent_id": agent_id,
        "status": agent["status"],
    }
