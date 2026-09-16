from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..models.database import get_db
from ..models.schema import Lead, Proposal, Company, Contact, Notification, AgentLog
from ..routers.auth import UserModel, get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/pipeline")
def pipeline_report(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    leads = db.query(Lead).filter(Lead.found_at >= cutoff).all()
    stage_counts = {}
    total_value = 0
    for lead in leads:
        stage = lead.status or "new"
        stage_counts[stage] = stage_counts.get(stage, 0) + 1
        total_value += lead.expected_revenue or 0
    proposals = db.query(Proposal).filter(Proposal.created_at >= cutoff).count()
    won = db.query(Lead).filter(Lead.status == "won", Lead.found_at >= cutoff).count()
    return {
        "total_leads": len(leads),
        "total_proposals": proposals,
        "total_pipeline_value": total_value,
        "won_deals": won,
        "conversion_rate": round(won / len(leads) * 100, 1) if leads else 0,
        "stages": stage_counts,
        "period_days": days,
    }

@router.get("/performance")
def performance_report(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    leads_by_day = db.query(func.date(Lead.found_at), func.count(Lead.id)).filter(Lead.found_at >= cutoff).group_by(func.date(Lead.found_at)).all()
    proposals_by_day = db.query(func.date(Proposal.created_at), func.count(Proposal.id)).filter(Proposal.created_at >= cutoff).group_by(func.date(Proposal.created_at)).all()
    agent_logs = db.query(AgentLog).filter(AgentLog.timestamp >= cutoff).count()
    return {
        "leads_by_day": [{"date": str(d), "count": c} for d, c in leads_by_day],
        "proposals_by_day": [{"date": str(d), "count": c} for d, c in proposals_by_day],
        "total_agent_actions": agent_logs,
        "period_days": days,
    }

@router.get("/summary")
def summary_report(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    now = datetime.utcnow()
    today = now.date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    total_leads = db.query(Lead).count()
    new_leads_week = db.query(Lead).filter(Lead.found_at >= week_ago).count()
    new_leads_month = db.query(Lead).filter(Lead.found_at >= month_ago).count()
    total_proposals = db.query(Proposal).count()
    new_proposals_week = db.query(Proposal).filter(Proposal.created_at >= week_ago).count()
    active_companies = db.query(Company).count()
    return {
        "total_leads": total_leads,
        "new_leads_this_week": new_leads_week,
        "new_leads_this_month": new_leads_month,
        "total_proposals": total_proposals,
        "new_proposals_this_week": new_proposals_week,
        "active_companies": active_companies,
        "report_date": now.isoformat(),
    }
