import random
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

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
        "description": "Extracts point of contact from job boards across IT, Graphic Design, Telemarketing, and BPO industries — including email, phone, LinkedIn, WhatsApp, Facebook, company website",
        "channel": "job boards",
        "outputMetric": "leads found",
        "defaultTask": "Scanning job board postings for IT, Design, Telemarketing & BPO leads",
    },
    {
        "id": "agent-hunter-2",
        "name": "Scout Beta",
        "role": "hunter",
        "team": "hunting",
        "avatar": "🌐",
        "description": "Researches company websites across IT, Graphic Design, Telemarketing & BPO to extract complete contact details — email, phone, social media, WhatsApp",
        "channel": "company websites",
        "outputMetric": "leads found",
        "defaultTask": "Researching IT, Design, Telemarketing & BPO company career pages",
    },
    {
        "id": "agent-hunter-3",
        "name": "Scout Gamma",
        "role": "hunter",
        "team": "hunting",
        "avatar": "🔗",
        "description": "Mines LinkedIn and social media for decision-makers in IT, Graphic Design, Telemarketing & BPO — including direct email, WhatsApp, and social profiles",
        "channel": "LinkedIn/social",
        "outputMetric": "leads found",
        "defaultTask": "Mining LinkedIn connections across target industries",
    },
    {
        "id": "agent-hunter-4",
        "name": "Scout Delta",
        "role": "hunter",
        "team": "hunting",
        "avatar": "💼",
        "description": "Finds freelance platform leads across IT, Graphic Design, Telemarketing & BPO with complete contact info — email, platform messaging, company website",
        "channel": "freelance platforms",
        "outputMetric": "leads found",
        "defaultTask": "Browsing freelance platform listings for target industries",
    },
    {
        "id": "agent-hunter-5",
        "name": "Scout Echo",
        "role": "hunter",
        "team": "hunting",
        "avatar": "💬",
        "description": "Monitors tech, design, telemarketing & BPO communities — extracts contact details from profiles, bios, and posts",
        "channel": "industry communities",
        "outputMetric": "leads found",
        "defaultTask": "Monitoring industry community threads",
    },
    {
        "id": "agent-hunter-6",
        "name": "Scout Foxtrot",
        "role": "hunter",
        "team": "hunting",
        "avatar": "🤝",
        "description": "Gathers warm referrals across IT, Graphic Design, Telemarketing & BPO with full contact packages — email, phone, WhatsApp, social links",
        "channel": "referrals",
        "outputMetric": "leads found",
        "defaultTask": "Following up on referral networks in target industries",
    },
    {
        "id": "team-lead-hunting",
        "name": "Hunting Lead",
        "role": "team_lead",
        "team": "hunting",
        "avatar": "🧭",
        "description": "Ensures ALL leads across IT, Graphic Design, Telemarketing & BPO have complete Point of Contact before handoff. Validates email, phone, website, LinkedIn, WhatsApp, Facebook for every lead",
        "defaultTask": "Validating Point of Contact packages for IT, Design, Telemarketing & BPO leads",
    },
    {
        "id": "agent-outreach-1",
        "name": "Contact Alpha",
        "role": "outreacher",
        "team": "outreach",
        "avatar": "✉️",
        "description": "Sends initial outreach via email, LinkedIn, WhatsApp, or any available channel",
        "outputMetric": "initial contacts sent",
        "defaultTask": "Sending initial outreach messages",
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
        "description": "Coordinates outreach across ALL channels - email, WhatsApp, LinkedIn, Facebook, phone. Ensures no lead is left uncontacted",
        "defaultTask": "Coordinating multichannel outreach",
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
        return {"count": count, "label": f"{count} initial contacts sent"}
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


def _match_keyword(text: str, keyword: str) -> bool:
    escaped = re.escape(keyword)
    if re.search(rf"\b{escaped}\b", text):
        return True
    return len(keyword) >= 5 and bool(re.search(rf"\b{escaped}\w+", text))


def _has_any(text: str, keywords: List[str]) -> bool:
    return any(_match_keyword(text, keyword) for keyword in keywords)


_HUNTING_METHODS: Dict[str, str] = {
    "agent-hunter-1": (
        "scans fresh postings on top job boards, identifies the hiring manager behind each ad, "
        "and extracts their point of contact straight from the listing: email, phone, LinkedIn, "
        "WhatsApp, Facebook, and the company website."
    ),
    "agent-hunter-2": (
        "walks company websites and career pages, pulling complete contact details from contact pages, "
        "footers, About Us sections, and HR listings: email, phone, social media, and WhatsApp numbers."
    ),
    "agent-hunter-3": (
        "mines LinkedIn and social networks to find the actual decision maker at target companies, "
        "then extracts direct email, WhatsApp, and every social profile attached to that person."
    ),
    "agent-hunter-4": (
        "browses freelance platforms like Upwork and Fiverr for clients posting projects, capturing "
        "complete contact info: email, platform messaging handles, and the client's company website."
    ),
    "agent-hunter-5": (
        "monitors tech communities and forums, reading profiles, bios, and posts to extract contact "
        "details for anyone discussing projects that match our delivery capability."
    ),
    "agent-hunter-6": (
        "cultivates referral networks for warm introductions and packages every referral with full "
        "contact details: email, phone, WhatsApp, and social links."
    ),
}

_OUTREACH_METHODS: Dict[str, str] = {
    "agent-outreach-1": (
        "fires the first touch on the strongest channel for each lead - email for corporate contacts, "
        "WhatsApp for fast movers, LinkedIn for social-first decision makers, whatever the contact "
        "package supports."
    ),
    "agent-outreach-2": (
        "runs structured follow-up sequences on a day 1 / day 3 / day 7 / day 14 cadence, escalating "
        "across email, WhatsApp, and LinkedIn until a human responds."
    ),
    "agent-outreach-3": (
        "turns interested replies into tailored proposals, matching scope, timeline, and pricing to "
        "whatever the lead revealed during conversation."
    ),
    "agent-outreach-4": (
        "handles pricing negotiations, defends our rate card, grants controlled discounts, and locks "
        "final terms before anything is signed."
    ),
    "agent-outreach-5": (
        "logs every touch, reply, proposal, and decision into the CRM so nothing falls through the cracks."
    ),
    "agent-outreach-6": (
        "watches opens, clicks, replies, and engagement signals across all channels and flags hot leads "
        "for immediate action."
    ),
}

_POC_FIELDS: Tuple[str, ...] = (
    "Email address (primary, plus secondary when available)",
    "Phone number",
    "LinkedIn profile URL",
    "WhatsApp number",
    "Facebook page or profile",
    "Company website",
)

_PIPELINE_STAGES: Tuple[str, ...] = (
    "1. Hunt - six Scouts sweep job boards, company websites, LinkedIn/social, freelance platforms, "
    "tech communities, and referral networks in parallel.",
    "2. Validate - the Hunting Lead checks every lead for a complete Point of Contact package "
    "(email, phone, LinkedIn, WhatsApp, Facebook, website). Anything incomplete goes back for deeper research.",
    "3. Handoff - fully qualified leads are batched and handed to the Outreach Lead with contact packages attached.",
    "4. First touch - Contact Alpha reaches out on the best available channel for each lead.",
    "5. Nurture - Contact Beta runs follow-up sequences until a human responds while Contact Foxtrot "
    "tracks every reply and engagement signal.",
    "6. Propose - interested leads move to Contact Gamma for a tailored proposal.",
    "7. Close - Contact Delta negotiates pricing and terms while Contact Echo logs the entire journey in the CRM.",
)


def _name_of(agent_id: str) -> str:
    agent = _agents.get(agent_id)
    return agent["name"] if agent else agent_id


def _channel_of(agent_id: str) -> str:
    for definition in AGENT_DEFINITIONS:
        if definition["id"] == agent_id:
            return definition.get("channel", "general channels")
    return "general channels"


def _efficiency_word(value: int) -> str:
    if value >= 93:
        return "elite"
    if value >= 85:
        return "strong"
    if value >= 78:
        return "solid"
    return "developing"


def _role_label(role: str) -> str:
    return {
        "hunter": "Lead Hunter (Scout)",
        "outreacher": "Outreach Specialist (Contact agent)",
        "team_lead": "Team Lead",
        "manager": "Director",
    }.get(role, role)


def _team_total(team: str) -> int:
    return sum(_daily_output(m["id"])["count"] for m in _team_members(team))


def _poc_completeness() -> int:
    return _seeded_int(f"{_today_key()}:poc-complete", 86, 99)


def _top_hunter_today() -> Tuple[Dict[str, Any], int]:
    members = _team_members("hunting")
    best = max(members, key=lambda m: _daily_output(m["id"])["count"])
    return best, _daily_output(best["id"])["count"]


def _member_block(members: List[Dict[str, Any]]) -> str:
    return "\n".join(
        f"{m['avatar']} {m['name']} [{m['status']}] - {_daily_output(m['id'])['label']} | "
        f"efficiency {m['efficiency']}% | now: {m['currentTask']}"
        for m in members
    )


def _agent_profile_text(target: Dict[str, Any]) -> str:
    output = _daily_output(target["id"])
    lines = [
        f"{target['avatar']} Agent profile: {target['name']}",
        f"- Role: {_role_label(target['role'])} on the {target['team']} team",
        f"- Specialty: {target['description']}",
        f"- Status: {target['status']} - current task: {target['currentTask']}",
        f"- Today's output: {output['label']}",
        f"- Efficiency: {target['efficiency']}% ({_efficiency_word(target['efficiency'])})",
        f"- Lifetime tasks completed: {target['tasksCompleted']}",
        f"- Reports to: {_name_of(target['reportsTo'])}",
    ]
    if target["manages"]:
        lines.append("- Manages: " + ", ".join(_name_of(a) for a in target["manages"]))
    lines.append(
        f"Ask me for {target['name']}'s history, workload balance, or how they fit into the pipeline."
    )
    return "\n".join(lines)


def _mentioned_agents(text: str) -> List[Dict[str, Any]]:
    normalized = re.sub(r"[\s_]+", "-", text)
    found: List[Dict[str, Any]] = []
    for definition in AGENT_DEFINITIONS:
        name_lower = definition["name"].lower()
        if name_lower in text or definition["id"] in normalized:
            found.append(_agents[definition["id"]])
            continue
        codename = name_lower.split()[-1]
        if re.search(rf"\b{re.escape(codename)}\b", text):
            team_hint = "hunting" if _has_any(text, ["scout", "hunter", "hunting"]) else None
            team_hint = team_hint or ("outreach" if _has_any(text, ["contact", "outreach"]) else None)
            team_hint = team_hint or ("management" if _has_any(text, ["director", "manager"]) else None)
            if team_hint and definition["team"] == team_hint:
                found.append(_agents[definition["id"]])
            elif not team_hint:
                found.append(_agents[definition["id"]])
    seen: set = set()
    unique = []
    for agent in found:
        if agent["id"] not in seen:
            seen.add(agent["id"])
            unique.append(agent)
    return unique


def _detect_scope(speaker: Dict[str, Any], text: str) -> Optional[str]:
    if _has_any(text, ["hunt", "hunter", "hunting", "scout", "sourcing", "prospecting", "lead gen", "leads"]):
        return "hunting"
    if _has_any(text, ["outreach", "outreacher", "contact agent", "contact team", "email", "emails", "proposal"]):
        return "outreach"
    if speaker["role"] == "team_lead":
        return speaker["team"]
    return None


def _hunting_brief() -> str:
    members = _team_members("hunting")
    total = _team_total("hunting")
    top, top_count = _top_hunter_today()
    return (
        f"Hunting team status (efficiency {_team_efficiency('hunting')}%, "
        f"{_active_count('hunting')}/{len(members)} active):\n"
        f"{_member_block(members)}\n"
        f"Total leads found today: {total}. Top channel right now: {top['name']} "
        f"({_channel_of(top['id'])}) with {top_count} leads.\n"
        f"Point of Contact completeness across today's leads: {_poc_completeness()}%. "
        "Every lead leaves this team with email, phone, LinkedIn, WhatsApp, Facebook, and company "
        "website attached before handoff to outreach."
    )


def _outreach_brief() -> str:
    members = _team_members("outreach")
    emails = _daily_output("agent-outreach-1")["count"] + _daily_output("agent-outreach-2")["count"]
    return (
        f"Outreach team status (efficiency {_team_efficiency('outreach')}%, "
        f"{_active_count('outreach')}/{len(members)} active):\n"
        f"{_member_block(members)}\n"
        f"Today: {emails} total emails ({_daily_output('agent-outreach-1')['count']} first touches, "
        f"{_daily_output('agent-outreach-2')['count']} follow-ups), "
        f"{_daily_output('agent-outreach-3')['count']} proposals drafted, "
        f"{_daily_output('agent-outreach-4')['count']} negotiations in motion, "
        f"{_daily_output('agent-outreach-6')['count']} responses tracked.\n"
        "We work every channel a lead's contact package supports - email, WhatsApp, LinkedIn, "
        "Facebook, phone - so no lead sits uncontacted."
    )


def _issues_brief(scope: Optional[str]) -> str:
    issues = _collect_issues()
    if scope:
        scoped_names = {m["name"] for m in _team_members(scope)}
        issues = [i for i in issues if any(name in i for name in scoped_names)]
    lines: List[str] = []
    if issues:
        lines.append("Current issues and blockers:")
        lines.extend(f"- {issue}" for issue in issues)
    else:
        lines.append(f"No blockers reported{' in the ' + scope + ' team' if scope else ''}. All systems operating normally.")
    watch_pool = _team_members(scope) if scope else list(_agents.values())
    laggards = [m for m in watch_pool if m["efficiency"] < 76]
    if laggards:
        lines.append("Watchlist (efficiency below 76%):")
        lines.extend(f"- {m['name']} at {m['efficiency']}%" for m in laggards)
    return "\n".join(lines)


def _performance_brief(scope: Optional[str]) -> str:
    pool = _team_members(scope) if scope else list(_agents.values())
    label = f"{scope} team" if scope else "both teams combined"
    best = max(pool, key=lambda m: m["efficiency"])
    worst = min(pool, key=lambda m: m["efficiency"])
    lifetime_best = max(pool, key=lambda m: m["tasksCompleted"])
    avg = round(sum(m["efficiency"] for m in pool) / len(pool))
    lines = [
        f"Performance snapshot for {label} (average efficiency {avg}%):",
        f"- Top performer: {best['avatar']} {best['name']} at {best['efficiency']}% "
        f"({_efficiency_word(best['efficiency'])}), {best['tasksCompleted']} lifetime tasks",
        f"- Needs support: {worst['name']} at {worst['efficiency']}%",
        f"- Lifetime volume leader: {lifetime_best['name']} with {lifetime_best['tasksCompleted']} tasks completed",
        f"- Today's production: {sum(_daily_output(m['id'])['count'] for m in pool)} actions across the team",
    ]
    if not scope:
        lines.append(
            f"- Team efficiencies: hunting {_team_efficiency('hunting')}%, outreach {_team_efficiency('outreach')}%"
        )
    return "\n".join(lines)


def _report_brief() -> str:
    report = _daily_report()
    lead_lines = "\n".join(
        f"  - {item['agentName']} ({item['channel']}): {item['count']} leads"
        for item in report["leadsFoundToday"]["byAgent"]
    )
    outreach_lines = "\n".join(
        f"  - {item['agentName']}: {item['label']}"
        for item in report["outreachSentToday"]["byAgent"]
    )
    issues_text = "; ".join(report["issues"]) if report["issues"] else "none"
    return (
        f"Daily report for {report['date']}:\n"
        f"Leads found: {report['leadsFoundToday']['total']} total\n"
        f"{lead_lines}\n"
        f"Outreach actions:\n{outreach_lines}\n"
        f"Combined emails sent: {report['emailsSent']} | Proposals generated: {report['proposalsGenerated']}\n"
        f"Hunting efficiency: {report['teamEfficiency']['hunting']}% | "
        f"Outreach efficiency: {report['teamEfficiency']['outreach']}% | "
        f"Overall: {report['teamEfficiency']['overall']}%\n"
        f"Issues: {issues_text}\n"
        f"POC completeness on today's leads: {_poc_completeness()}%. "
        "Full JSON breakdown lives at /api/ai-teams/reports/daily."
    )


def _overall_brief() -> str:
    active = _active_count()
    total = len(_agents)
    paused = sum(1 for a in _agents.values() if a["status"] == "paused")
    issues = _collect_issues()
    return (
        f"Overall operations: {active}/{total} agents active, {paused} paused, "
        f"{len(issues)} open issue(s).\n"
        f"Hunting: {_team_total('hunting')} leads today at {_team_efficiency('hunting')}% efficiency. "
        f"Outreach: {_daily_output('agent-outreach-1')['count'] + _daily_output('agent-outreach-2')['count']} emails, "
        f"{_daily_output('agent-outreach-3')['count']} proposals at {_team_efficiency('outreach')}% efficiency.\n"
        f"POC completeness: {_poc_completeness()}%. "
        + ("Everything is under control." if not issues else "See blockers for details.")
    )


def _methodology_brief(scope: Optional[str], deep: bool) -> str:
    lines = ["Here is exactly how lead hunting works:"]
    for m in _team_members("hunting"):
        method = _HUNTING_METHODS[m["id"]]
        lines.append(f"{m['avatar']} {m['name']} ({_channel_of(m['id'])}) {method}")
    total = _team_total("hunting")
    top, top_count = _top_hunter_today()
    lines.append(
        f"Today that produced {total} leads, led by {top['name']} with {top_count}. "
        "Nothing moves downstream until the Hunting Lead validates the full Point of Contact package."
    )
    if not deep:
        lines.append("(The Hunting Lead owns this pipeline stage - ask them for channel-by-channel deep dives.)")
    return "\n".join(lines)


def _poc_brief() -> str:
    fields = "\n".join(f"- {field}" for field in _POC_FIELDS)
    return (
        "Every single lead is captured with a complete Point of Contact package:\n"
        f"{fields}\n"
        f"The Hunting Lead validates all six fields before handoff; incomplete leads bounce back to "
        f"the scouts for deeper research. Current completeness on today's leads: {_poc_completeness()}%.\n"
        "This is why outreach never hits a dead end - there is always at least one live channel "
        "(email, WhatsApp, LinkedIn, phone, or social) to reach a prospect."
    )


def _handoff_brief() -> str:
    return (
        "The hunting-to-outreach handoff works like this:\n"
        "1. Scouts submit leads with raw contact data.\n"
        "2. The Hunting Lead audits each lead against the POC checklist - email, phone, website, "
        "LinkedIn, WhatsApp, Facebook. Missing fields go back for re-research.\n"
        "3. Qualified leads are batched and transferred to the Outreach Lead with their full contact "
        "packages and source notes.\n"
        "4. The Outreach Lead assigns each batch to Contact Alpha for first touch and logs ownership "
        "in the CRM via Contact Echo.\n"
        f"Today {_team_total('hunting')} leads have been produced and the queue is flowing at "
        f"{_poc_completeness()}% completeness."
    )


def _pipeline_brief() -> str:
    stages = "\n".join(_PIPELINE_STAGES)
    return (
        f"The full lead pipeline, end to end:\n{stages}\n"
        f"Right now: {_team_total('hunting')} leads hunted today, "
        f"{_daily_output('agent-outreach-1')['count']} first touches sent, "
        f"{_daily_output('agent-outreach-3')['count']} proposals in play."
    )


def _outreach_process_brief(scope: Optional[str], deep: bool) -> str:
    lines = ["Here is how outreach executes on every qualified lead:"]
    for m in _team_members("outreach"):
        lines.append(f"{m['avatar']} {m['name']}: {_OUTREACH_METHODS[m['id']]}")
    emails = _daily_output("agent-outreach-1")["count"] + _daily_output("agent-outreach-2")["count"]
    lines.append(
        f"Today's numbers: {emails} emails, {_daily_output('agent-outreach-3')['count']} proposals, "
        f"{_daily_output('agent-outreach-4')['count']} negotiations, "
        f"{_daily_output('agent-outreach-6')['count']} responses tracked."
    )
    if not deep:
        lines.append("(The Outreach Lead owns this stage - ask them for campaign-level detail.)")
    return "\n".join(lines)


def _channels_brief() -> str:
    return (
        "Channel strategy - we match the channel to the lead, never the other way around:\n"
        "- Email: default for corporate contacts and anything formal; best for proposals and paper trails.\n"
        "- WhatsApp: fastest response rates, ideal for SMB owners, international prospects, and warm referrals.\n"
        "- LinkedIn: decision makers discovered socially; InMail plus connection notes.\n"
        "- Facebook: freelance and community-sourced leads who live there.\n"
        "- Phone: reserved for warm referrals and hot negotiated deals.\n"
        "Contact Alpha picks per lead based on what the POC package contains; Contact Foxtrot measures "
        f"engagement across all of them ({_daily_output('agent-outreach-6')['count']} responses tracked today)."
    )


def _followup_brief() -> str:
    return (
        "Follow-up process (owned by Contact Beta 🔁):\n"
        "- Cadence: day 1, day 3, day 7, day 14 touches, rotating channel each time (email → WhatsApp → LinkedIn).\n"
        "- Each follow-up adds new value: case study, relevant sample, or a direct question.\n"
        "- Sequences stop the moment a human replies; the lead jumps to Contact Gamma for proposals.\n"
        "- Non-responders after the full cadence are marked dormant and returned to hunting for re-validation.\n"
        f"Today Contact Beta has sent {_daily_output('agent-outreach-2')['count']} follow-ups."
    )


def _proposal_brief() -> str:
    return (
        "Proposal generation (owned by Contact Gamma 📝):\n"
        "- Triggered the moment a lead replies with interest or asks for details.\n"
        "- Each proposal tailors scope, deliverables, timeline, and pricing to the lead's stated problem.\n"
        "- Source intel matters: a referral lead gets a warmer tone; a job-board lead gets a direct "
        "solution to the posted role.\n"
        f"Today: {_daily_output('agent-outreach-3')['count']} proposals generated, all logged in the CRM by Contact Echo."
    )


def _negotiation_brief() -> str:
    return (
        "Pricing negotiation (owned by Contact Delta ⚖️):\n"
        "- Defends the standard rate card; discounts require a trade (longer retainer, case study rights, faster close).\n"
        "- Never discounts below floor without Director AI sign-off.\n"
        "- Terms, milestones, and payment schedule are locked before handoff to delivery.\n"
        f"Today: {_daily_output('agent-outreach-4')['count']} active negotiations."
    )


def _crm_brief() -> str:
    return (
        "CRM hygiene (owned by Contact Echo 📊):\n"
        "- Every touch, reply, proposal, and negotiation outcome is logged with timestamps.\n"
        "- Lead source, channel history, and full POC package travel with the record forever.\n"
        "- Stale records older than 14 days are flagged for re-engagement.\n"
        f"Today: {_daily_output('agent-outreach-5')['count']} CRM entries updated."
    )


def _tracking_brief() -> str:
    return (
        "Response tracking (owned by Contact Foxtrot 👀):\n"
        "- Monitors opens, clicks, replies, and engagement across email, WhatsApp, LinkedIn, and Facebook.\n"
        "- Hot-lead threshold: any positive reply or repeated engagement pings Contact Gamma instantly.\n"
        "- Silence past the follow-up cadence hands the lead back for revalidation.\n"
        f"Today: {_daily_output('agent-outreach-6')['count']} responses tracked."
    )


def _roster_brief(scope: Optional[str]) -> str:
    if scope:
        members = _team_members(scope)
        header = (
            f"{scope.capitalize()} team roster ({_active_count(scope)}/{len(members)} active, "
            f"efficiency {_team_efficiency(scope)}%):"
        )
        return f"{header}\n{_member_block(members)}"
    hunting = _team_members("hunting")
    outreach = _team_members("outreach")
    return (
        f"Full roster - {len(_agents)} agents across two teams plus leadership:\n"
        f"HUNTING TEAM ({_team_efficiency('hunting')}% efficiency):\n{_member_block(hunting)}\n"
        f"OUTREACH TEAM ({_team_efficiency('outreach')}% efficiency):\n{_member_block(outreach)}\n"
        "Leadership: 🧭 Hunting Lead and 📣 Outreach Lead, both reporting to 🎖️ Director AI."
    )


def _tasks_brief(scope: Optional[str]) -> str:
    pools = [_team_members(scope)] if scope else [_team_members("hunting"), _team_members("outreach")]
    lines: List[str] = ["Current task board:"]
    labels = ["HUNTING", "OUTREACH"]
    for label, pool in zip(labels, pools):
        lines.append(f"{label}:")
        lines.extend(f"  {m['avatar']} {m['name']} - {m['currentTask']} [{m['status']}]" for m in pool)
    return "\n".join(lines)


def _status_brief(scope: Optional[str]) -> str:
    if scope:
        members = _team_members(scope)
        total_units = sum(_daily_output(m["id"])["count"] for m in members)
        unit_label = "leads found" if scope == "hunting" else "outreach actions"
        return (
            f"{scope.capitalize()} team status: {_active_count(scope)}/{len(members)} active, "
            f"efficiency {_team_efficiency(scope)}%, {total_units} {unit_label} today.\n"
            f"{_member_block(members)}"
        )
    return _overall_brief()


def _business_brief(text: str) -> str:
    report = _daily_report()
    leads = report["leadsFoundToday"]["total"]
    emails = report["emailsSent"]
    proposals = report["proposalsGenerated"]
    weakest = min(list(_agents.values()), key=lambda a: a["efficiency"])
    if _has_any(text, ["revenue", "money", "profit", "income", "roi", "monetiz"]):
        return (
            "Revenue math runs straight down the pipeline: leads → conversations → proposals → closes.\n"
            f"Today's inputs: {leads} leads and {emails} outbound touches feeding {proposals} live proposals.\n"
            "The biggest lever is proposal-to-close conversion, which Contact Delta owns in negotiation. "
            "Second lever is POC completeness - richer contact packages mean more channels per lead and "
            "faster replies. Ask me for the daily report anytime to track the funnel."
        )
    if _has_any(text, ["grow", "growth", "scale", "expand", "more leads", "increase"]):
        return (
            "Scaling plan: the six hunting channels run in parallel, so volume scales by deepening the "
            "weakest channel rather than adding headcount.\n"
            f"Weakest link today: {weakest['name']} at {weakest['efficiency']}% - fixing that lifts total "
            f"output immediately. On the outreach side, follow-up cadence depth (day 1/3/7/14) typically "
            "unlocks 30-50% more conversations from the SAME lead volume. "
            f"Current baseline: {leads} leads/day, {emails} touches/day."
        )
    if _has_any(text, ["client", "customer", "quality", "ideal", "target", "niche", "icp"]):
        return (
            "Client quality beats client quantity. Every scout filters against our ideal profile: businesses "
            "actively hiring or posting project work, with a reachable decision maker.\n"
            "The POC package is our quality gate - a lead with verified email, phone, LinkedIn, WhatsApp, "
            "Facebook, and website is a real, reachable opportunity, not a stale list row. "
            f"Completeness today: {_poc_completeness()}%."
        )
    if _has_any(text, ["competitor", "market", "industry", "trend", "landscape"]):
        return (
            "Market read: buyers increasingly respond on instant channels (WhatsApp, LinkedIn DMs) over "
            "cold email, which is why outreach runs multichannel by default.\n"
            "Freelance platforms and tech communities keep producing higher-intent leads than passive "
            "job-board scraping, so Scout Delta and Scout Echo get priority on hard targets. "
            "Diversification across six channels protects us when any single platform throttles - like "
            "LinkedIn rate limits occasionally do."
        )
    return (
        "Straight advice from the operations floor:\n"
        f"1. Feed the funnel daily - {leads} leads today keeps {emails} touches possible tomorrow.\n"
        "2. Guard POC completeness - every missing field is a dead-end channel.\n"
        "3. Fix the weakest agent first - " f"{weakest['name']} at {weakest['efficiency']}% is today's bottleneck.\n"
        "4. Let follow-ups cook - most replies land on touch 3, not touch 1.\n"
        "Ask me about any stage of the pipeline for specifics."
    )


def _greeting_reply(agent: Dict[str, Any]) -> str:
    return (
        f"Hello! I am {agent['name']} {agent['avatar']}, {agent['description'].rstrip('.')}.\n"
        f"Quick pulse: {_active_count()}/{len(_agents)} agents active, "
        f"{_team_total('hunting')} leads found today, "
        f"{_daily_output('agent-outreach-1')['count'] + _daily_output('agent-outreach-2')['count']} emails out.\n"
        "Ask me about my team, any agent, lead numbers, the pipeline, processes, or performance."
    )


def _how_are_you_reply(agent: Dict[str, Any]) -> str:
    issues = _collect_issues()
    mood = "zero fires, all clear" if not issues else f"{len(issues)} open issue(s) on my watch"
    return (
        f"Running at {agent['efficiency']}% efficiency - {_active_count()} agents active, "
        f"{_team_total('hunting')} leads hunted today, {mood}. "
        "What would you like to dig into?"
    )


def _thanks_reply(agent: Dict[str, Any]) -> str:
    return (
        f"Anytime. {agent['name']} standing by - shout if you want numbers, names, or process detail."
    )


def _help_reply(agent: Dict[str, Any]) -> str:
    if agent["role"] == "manager":
        return (
            "I am Director AI 🎖️. I oversee both teams. You can ask me about:\n"
            "- Overall operations status and daily reports\n"
            "- Any agent by name (all 15 of them)\n"
            "- Lead hunting methodology, sources, and Point of Contact validation\n"
            "- Outreach execution: channels, follow-ups, proposals, negotiations, CRM\n"
            "- The full pipeline from hunt to close\n"
            "- Performance metrics, efficiency rankings, and blockers\n"
            "- General business questions grounded in our live pipeline data"
        )
    team = agent["team"]
    other_team = "outreach" if team == "hunting" else "hunting"
    other_lead = "Outreach Lead" if team == "hunting" else "Hunting Lead"
    return (
        f"I am {agent['name']}, lead of the {team} team. You can ask me about:\n"
        "- Any of my agents by name - their role, output, and efficiency\n"
        "- How we find leads and extract Point of Contact details\n"
        "- How outreach works across email, WhatsApp, LinkedIn, and more\n"
        "- Exact numbers: leads found, emails sent, proposals generated\n"
        "- The full pipeline and the handoff between teams\n"
        "- Performance, blockers, and daily reports\n"
        f"For {other_team}-team deep dives, {other_lead} is your specialist - but I can give you the pipeline view."
    )


def _outside_domain(agent: Dict[str, Any]) -> str:
    if agent["role"] == "manager":
        return (
            "That's outside my domain. I run the hunting and outreach operation - ask me about teams, "
            "leads, outreach, pipeline, performance, or reports."
        )
    return "That's outside my domain. Please ask the Director AI."


_CONVERSATIONAL = {
    "greeting": ["hello", "hi", "hey", "morning", "afternoon", "evening", "howdy", "greetings", "yo", "sup", "namaste", "good day", "what's up", "whats up"],
    "how_are_you": ["how are you", "how're you", "how is it going", "how's it going", "hows it going", "how are things", "how do you feel", "are you ok", "are you okay", "you good", "how you doing"],
    "thanks": ["thank", "thanks", "thx", "appreciate", "great job", "well done", "nice work", "awesome", "good job", "kudos"],
    "identity": ["who are you", "what can you do", "your capabilities", "introduce yourself", "about yourself", "can you help", "i need help", "need help", "what do you do", "options", "commands", "guide me", "abilities", "help me"],
}

_TOPICS: List[Tuple[str, List[str]]] = [
    ("report", ["report", "daily", "summary", "summarize", "recap", "briefing", "brief me", "digest", "eod", "end of day", "roundup", "round up", "wrap up"]),
    ("issues", ["issue", "blocker", "problem", "risk", "stuck", "delay", "delayed", "slow", "slowing", "bottleneck", "failing", "failure", "error", "broken", "concern", "challenge", "obstacle", "trouble", "wrong", "struggling", "behind"]),
    ("performance", ["performance", "efficient", "efficiency", "metric", "metrics", "kpi", "kpis", "score", "productivity", "productive", "best performer", "top performer", "leaderboard", "ranking", "compare", "benchmark", "stats", "statistics"]),
    ("lead_numbers", ["how many", "count", "number of", "total leads", "leads found", "found today", "results", "output", "yield", "production", "produced", "numbers today", "today's numbers", "how much"]),
    ("methodology", ["how do you find", "how do you hunt", "how does hunting", "how is hunting", "where do you find", "where do leads", "sources", "source of", "job board", "boards", "career page", "linkedin", "social media", "freelance", "upwork", "fiverr", "community", "forum", "referral", "network", "methodology", "methods", "technique", "approach", "strategy", "mine", "scrape", "scan", "research", "discover", "find leads", "lead generation", "generate leads", "hunting process"]),
    ("poc", ["point of contact", "poc", "contact details", "contact information", "contact info", "email address", "phone number", "whatsapp number", "social profiles", "information do you collect", "info collected", "contact package", "complete contact", "validate", "validation", "verify", "verification", "missing contact", "data points", "fields", "what information", "which information"]),
    ("followup", ["follow up", "follow-up", "followup", "sequences", "sequence", "reminder", "reminders", "nudge", "drip", "cadence", "second touch", "chase"]),
    ("proposal", ["proposal", "proposals", "quote", "quotation", "pitch", "offer letter", "sow", "scope of work", "bid", "estimate"]),
    ("negotiation", ["negotiat", "pricing", "price", "prices", "rate card", "discount", "terms", "contract", "deal terms", "haggle"]),
    ("crm", ["crm", "records", "database", "logging", "logged", "entry", "entries", "salesforce", "hubspot", "spreadsheet"]),
    ("tracking", ["track", "tracking", "responses", "response rate", "engagement", "opens", "open rate", "clicks", "click rate", "replies", "reply rate", "monitor", "signals"]),
    ("channels", ["channel", "channels", "via email", "by email", "through email", "email vs", "whatsapp", "linkedin message", "sms", "text message", "cold call", "calling", "dm", "direct message", "best way to reach", "which platform"]),
    ("handoff", ["handoff", "hand off", "hand-off", "handover", "hand over", "transfer", "passed to", "qualified", "qualification", "ready for outreach", "move to outreach", "give to outreach", "between teams"]),
    ("pipeline", ["pipeline", "workflow", "process", "stages", "steps", "lifecycle", "journey", "end to end", "end-to-end", "flow of", "from start to finish", "how it all works", "whole system", "funnel"]),
    ("outreach_general", ["outreach", "emails", "email", "sent", "sending", "campaign", "campaigns", "messaging", "reach out", "contacted", "first touch", "initial contact", "touchpoints", "messages sent"]),
    ("roster", ["team", "member", "members", "agent", "agents", "roster", "staff", "crew", "squad", "scouts", "headcount", "people", "who works", "who is on", "who's on", "names of", "everyone", "personnel", "workforce"]),
    ("tasks_now", ["task", "working on", "currently doing", "right now", "assignment", "assignments", "busy with", "activity", "activities", "what is everyone", "what's everyone", "up to", "current work"]),
    ("status", ["status", "update", "overview", "situation", "going on", "happening", "active", "idle", "paused", "online", "health", "snapshot", "state of", "pulse"]),
    ("business", ["business", "revenue", "money", "profit", "income", "client", "customers", "customer", "sale", "sales", "grow", "growth", "scale", "market", "marketing", "brand", "competitor", "industry", "trend", "advice", "improve", "better", "optimize", "recommend", "suggest", "ideas", "roi", "conversion", "target", "niche", "position", "quality"]),
]


def _manager_reply(message: str) -> str:
    text = message.lower().strip()
    speaker = _agents["manager"]
    if not text:
        return _help_reply(speaker)

    mentioned = _mentioned_agents(text)
    scope = _detect_scope(speaker, text)

    if mentioned:
        if len(mentioned) == 1:
            return _agent_profile_text(mentioned[0])
        return (
            "Several agents on your mind:\n"
            + "\n".join(
                f"{a['avatar']} {a['name']} [{a['status']}] - {_daily_output(a['id'])['label']}, efficiency {a['efficiency']}%"
                for a in mentioned
            )
            + "\nAsk about any one of them for the full profile."
        )

    for topic, keywords in _TOPICS:
        if not _has_any(text, keywords):
            continue
        if topic == "report":
            return _report_brief()
        if topic == "issues":
            return _issues_brief(scope)
        if topic == "performance":
            return _performance_brief(scope)
        if topic == "lead_numbers":
            if scope == "outreach":
                return _outreach_brief()
            return _hunting_brief() if scope == "hunting" else _report_brief()
        if topic == "methodology":
            return _methodology_brief(None if scope == "outreach" else "hunting", True)
        if topic == "poc":
            return _poc_brief()
        if topic == "handoff":
            return _handoff_brief()
        if topic == "pipeline":
            return _pipeline_brief()
        if topic == "followup":
            return _followup_brief()
        if topic == "proposal":
            return _proposal_brief()
        if topic == "negotiation":
            return _negotiation_brief()
        if topic == "crm":
            return _crm_brief()
        if topic == "tracking":
            return _tracking_brief()
        if topic == "channels":
            return _channels_brief()
        if topic == "outreach_general":
            return _outreach_process_brief(None if scope == "hunting" else "outreach", True)
        if topic == "roster":
            return _roster_brief(scope)
        if topic == "tasks_now":
            return _tasks_brief(scope)
        if topic == "status":
            return _status_brief(scope)
        if topic == "business":
            return _business_brief(text)

    for kind in ("how_are_you", "thanks", "identity", "greeting"):
        if _has_any(text, _CONVERSATIONAL[kind]):
            if kind == "how_are_you":
                return _how_are_you_reply(speaker)
            if kind == "thanks":
                return _thanks_reply(speaker)
            if kind == "identity":
                return _help_reply(speaker)
            return _greeting_reply(speaker)

    return _outside_domain(speaker)


def _team_lead_reply(agent: Dict[str, Any], message: str) -> str:
    text = message.lower().strip()
    if not text:
        return _help_reply(agent)

    team = agent["team"]
    other_team = "outreach" if team == "hunting" else "hunting"
    other_lead = _agents["team-lead-outreach"] if team == "hunting" else _agents["team-lead-hunting"]

    def cross_team(body: str) -> str:
        if scope == other_team:
            return (
                f"That's {other_lead['name']}'s specialty, but here is the pipeline-level view:\n"
                f"{body}\n(For deep {other_team} detail, chat with {other_lead['name']} or Director AI.)"
            )
        return body

    mentioned = _mentioned_agents(text)
    scope = _detect_scope(agent, text)
    deep = scope != other_team

    if mentioned:
        if len(mentioned) == 1:
            target = mentioned[0]
            body = _agent_profile_text(target)
            return body if target["team"] == team or target["id"] == agent["id"] else (
                f"That's {other_lead['name']}'s direct report, but here is the profile:\n{body}"
            )
        lines = [
            f"{a['avatar']} {a['name']} [{a['status']}] - {_daily_output(a['id'])['label']}, efficiency {a['efficiency']}%"
            for a in mentioned
        ]
        return "Several agents on your mind:\n" + "\n".join(lines) + "\nAsk about any one of them for the full profile."

    for topic, keywords in _TOPICS:
        if not _has_any(text, keywords):
            continue
        if topic == "report":
            return _report_brief()
        if topic == "issues":
            return _issues_brief(scope)
        if topic == "performance":
            return _performance_brief(scope)
        if topic == "lead_numbers":
            body = _outreach_brief() if scope == "outreach" else _hunting_brief()
            return cross_team(body)
        if topic == "methodology":
            return cross_team(_methodology_brief(scope, deep))
        if topic == "poc":
            return _poc_brief()
        if topic == "handoff":
            return _handoff_brief()
        if topic == "pipeline":
            return _pipeline_brief()
        if topic == "followup":
            return cross_team(_followup_brief())
        if topic == "proposal":
            return cross_team(_proposal_brief())
        if topic == "negotiation":
            return cross_team(_negotiation_brief())
        if topic == "crm":
            return cross_team(_crm_brief())
        if topic == "tracking":
            return cross_team(_tracking_brief())
        if topic == "channels":
            return cross_team(_channels_brief())
        if topic == "outreach_general":
            return cross_team(_outreach_process_brief(scope, deep))
        if topic == "roster":
            return _roster_brief(scope)
        if topic == "tasks_now":
            return _tasks_brief(scope)
        if topic == "status":
            return _status_brief(scope)
        if topic == "business":
            return _business_brief(text)

    for kind in ("how_are_you", "thanks", "identity", "greeting"):
        if _has_any(text, _CONVERSATIONAL[kind]):
            if kind == "how_are_you":
                return _how_are_you_reply(agent)
            if kind == "thanks":
                return _thanks_reply(agent)
            if kind == "identity":
                return _help_reply(agent)
            return _greeting_reply(agent)

    return _outside_domain(agent)


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
