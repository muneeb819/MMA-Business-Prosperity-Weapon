from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.database import get_db
from app.models.schema import Lead, Proposal, AgentLog
from pydantic import BaseModel
from typing import List

router = APIRouter()


class CountryStat(BaseModel):
    country: str
    count: int
    revenue: float


class TechStat(BaseModel):
    tech: str
    count: int


class MonthlyRevenue(BaseModel):
    month: str
    revenue: float
    proposals: int


class PlatformStat(BaseModel):
    platform: str
    leads: int


class AgentPerf(BaseModel):
    agent: str
    efficiency: float
    tasks: int


class IndustryTrend(BaseModel):
    industry: str
    growth: float
    opportunities: int


class DashboardAnalytics(BaseModel):
    totalLeads: int
    totalProposals: int
    winRate: float
    totalRevenue: float
    avgDealSize: float
    conversionRate: float
    topCountries: List[CountryStat]
    topTechnologies: List[TechStat]
    monthlyRevenue: List[MonthlyRevenue]
    platformBreakdown: List[PlatformStat]
    agentPerformance: List[AgentPerf]
    industryTrends: List[IndustryTrend]


def _safe_float(val, default=0.0):
    if val is None:
        return default
    return float(val)


@router.get("/", response_model=DashboardAnalytics)
def get_dashboard_analytics(db: Session = Depends(get_db)):
    total_leads = db.query(func.count(Lead.id)).scalar() or 0
    total_proposals = db.query(func.count(Proposal.id)).scalar() or 0

    won_leads = db.query(func.count(Lead.id)).filter(Lead.status == "won").scalar() or 0
    closed_leads = db.query(func.count(Lead.id)).filter(
        Lead.status.in_(["won", "lost"])
    ).scalar() or 0
    win_rate = round((won_leads / closed_leads * 100) if closed_leads > 0 else 0.0, 1)

    total_revenue = _safe_float(
        db.query(func.sum(Lead.expected_revenue)).filter(Lead.status == "won").scalar()
    )
    avg_deal_size = _safe_float(
        db.query(func.avg(Lead.budget_max)).scalar()
    )

    proposals_sent = db.query(func.count(Proposal.id)).scalar() or 0
    conversion_rate = round(
        (proposals_sent / total_leads * 100) if total_leads > 0 else 0.0, 1
    )

    top_countries_raw = (
        db.query(
            Lead.country,
            func.count(Lead.id).label("count"),
            func.sum(Lead.expected_revenue).label("revenue"),
        )
        .filter(Lead.country.isnot(None), Lead.country != "")
        .group_by(Lead.country)
        .order_by(func.count(Lead.id).desc())
        .limit(10)
        .all()
    )
    top_countries = [
        CountryStat(country=r[0], count=r[1], revenue=_safe_float(r[2]))
        for r in top_countries_raw
    ]

    tech_counts = {}
    all_leads = db.query(Lead.technologies).filter(Lead.technologies.isnot(None)).all()
    for (techs,) in all_leads:
        if techs:
            for t in techs:
                tech_counts[t] = tech_counts.get(t, 0) + 1
    top_technologies = sorted(
        [TechStat(tech=k, count=v) for k, v in tech_counts.items()],
        key=lambda x: x.count,
        reverse=True,
    )[:10]

    monthly_revenue = [
        MonthlyRevenue(month="Jan", revenue=0, proposals=0),
        MonthlyRevenue(month="Feb", revenue=0, proposals=0),
        MonthlyRevenue(month="Mar", revenue=0, proposals=0),
        MonthlyRevenue(month="Apr", revenue=0, proposals=0),
        MonthlyRevenue(month="May", revenue=0, proposals=0),
        MonthlyRevenue(month="Jun", revenue=0, proposals=0),
        MonthlyRevenue(month="Jul", revenue=0, proposals=0),
        MonthlyRevenue(month="Aug", revenue=0, proposals=0),
        MonthlyRevenue(month="Sep", revenue=0, proposals=0),
        MonthlyRevenue(month="Oct", revenue=0, proposals=0),
        MonthlyRevenue(month="Nov", revenue=0, proposals=0),
        MonthlyRevenue(month="Dec", revenue=0, proposals=0),
    ]

    won_leads_data = db.query(Lead.expected_revenue, Lead.found_at).filter(
        Lead.status == "won", Lead.found_at.isnot(None)
    ).all()
    for rev, dt in won_leads_data:
        if dt and rev:
            idx = dt.month - 1
            monthly_revenue[idx].revenue += rev

    proposal_counts_raw = (
        db.query(
            func.strftime("%m", Proposal.created_at).label("month"),
            func.count(Proposal.id).label("cnt"),
        )
        .filter(Proposal.created_at.isnot(None))
        .group_by(func.strftime("%m", Proposal.created_at))
        .all()
    )
    for month_num, cnt in proposal_counts_raw:
        if month_num:
            idx = int(month_num) - 1
            if 0 <= idx < 12:
                monthly_revenue[idx].proposals = cnt

    platform_raw = (
        db.query(
            Lead.platform,
            func.count(Lead.id).label("leads"),
        )
        .filter(Lead.platform.isnot(None), Lead.platform != "")
        .group_by(Lead.platform)
        .order_by(func.count(Lead.id).desc())
        .all()
    )
    platform_breakdown = [PlatformStat(platform=r[0], leads=r[1]) for r in platform_raw]

    agent_names = {
        "agent-1": "Opportunity Hunter",
        "agent-2": "Lead Analyzer",
        "agent-3": "Proposal Generator",
    }
    agent_task_counts = (
        db.query(
            AgentLog.agent_id,
            func.count(AgentLog.id).label("tasks"),
        )
        .group_by(AgentLog.agent_id)
        .all()
    )
    agent_performance = [
        AgentPerf(
            agent=agent_names.get(aid, aid),
            efficiency=0.0,
            tasks=cnt,
        )
        for aid, cnt in agent_task_counts
    ]

    return DashboardAnalytics(
        totalLeads=total_leads,
        totalProposals=total_proposals,
        winRate=win_rate,
        totalRevenue=total_revenue,
        avgDealSize=round(avg_deal_size, 2),
        conversionRate=conversion_rate,
        topCountries=top_countries,
        topTechnologies=top_technologies,
        monthlyRevenue=monthly_revenue,
        platformBreakdown=platform_breakdown,
        agentPerformance=agent_performance,
        industryTrends=[],
    )


@router.get("/revenue")
def get_revenue_analytics(db: Session = Depends(get_db)):
    monthly_revenue = [
        {"month": "Jan", "revenue": 0, "proposals": 0},
        {"month": "Feb", "revenue": 0, "proposals": 0},
        {"month": "Mar", "revenue": 0, "proposals": 0},
        {"month": "Apr", "revenue": 0, "proposals": 0},
        {"month": "May", "revenue": 0, "proposals": 0},
        {"month": "Jun", "revenue": 0, "proposals": 0},
        {"month": "Jul", "revenue": 0, "proposals": 0},
        {"month": "Aug", "revenue": 0, "proposals": 0},
        {"month": "Sep", "revenue": 0, "proposals": 0},
        {"month": "Oct", "revenue": 0, "proposals": 0},
        {"month": "Nov", "revenue": 0, "proposals": 0},
        {"month": "Dec", "revenue": 0, "proposals": 0},
    ]

    won_data = db.query(Lead.expected_revenue, Lead.found_at).filter(
        Lead.status == "won", Lead.found_at.isnot(None)
    ).all()
    for rev, dt in won_data:
        if dt and rev:
            monthly_revenue[dt.month - 1]["revenue"] += rev

    proposal_data = (
        db.query(
            func.strftime("%m", Proposal.created_at).label("month"),
            func.count(Proposal.id).label("cnt"),
        )
        .filter(Proposal.created_at.isnot(None))
        .group_by(func.strftime("%m", Proposal.created_at))
        .all()
    )
    for month_num, cnt in proposal_data:
        if month_num:
            idx = int(month_num) - 1
            if 0 <= idx < 12:
                monthly_revenue[idx]["proposals"] = cnt

    total_rev = _safe_float(
        db.query(func.sum(Lead.expected_revenue)).filter(Lead.status == "won").scalar()
    )

    return {
        "monthly": monthly_revenue,
        "forecast": {
            "next_month": round(total_rev * 0.12, 2),
            "next_quarter": round(total_rev * 0.35, 2),
        },
    }


@router.get("/countries")
def get_country_analytics(db: Session = Depends(get_db)):
    raw = (
        db.query(
            Lead.country,
            func.count(Lead.id).label("count"),
            func.sum(Lead.expected_revenue).label("revenue"),
        )
        .filter(Lead.country.isnot(None), Lead.country != "")
        .group_by(Lead.country)
        .order_by(func.count(Lead.id).desc())
        .all()
    )
    return {
        "top_countries": [
            {"country": r[0], "count": r[1], "revenue": _safe_float(r[2])}
            for r in raw
        ]
    }


@router.get("/technologies")
def get_technology_analytics(db: Session = Depends(get_db)):
    tech_counts = {}
    all_leads = db.query(Lead.technologies).filter(Lead.technologies.isnot(None)).all()
    for (techs,) in all_leads:
        if techs:
            for t in techs:
                tech_counts[t] = tech_counts.get(t, 0) + 1
    top = sorted(tech_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    return {
        "top_technologies": [{"tech": t, "count": c} for t, c in top]
    }


@router.get("/platforms")
def get_platform_analytics(db: Session = Depends(get_db)):
    raw = (
        db.query(Lead.platform, func.count(Lead.id).label("leads"))
        .filter(Lead.platform.isnot(None), Lead.platform != "")
        .group_by(Lead.platform)
        .order_by(func.count(Lead.id).desc())
        .all()
    )
    return {
        "platforms": [{"platform": r[0], "leads": r[1]} for r in raw]
    }


@router.get("/agents")
def get_agent_analytics(db: Session = Depends(get_db)):
    agent_names = {
        "agent-1": "Opportunity Hunter",
        "agent-2": "Lead Analyzer",
        "agent-3": "Proposal Generator",
    }
    raw = (
        db.query(AgentLog.agent_id, func.count(AgentLog.id).label("tasks"))
        .group_by(AgentLog.agent_id)
        .all()
    )
    return {
        "performance": [
            {
                "agent": agent_names.get(aid, aid),
                "efficiency": 0.0,
                "tasks": cnt,
            }
            for aid, cnt in raw
        ]
    }
