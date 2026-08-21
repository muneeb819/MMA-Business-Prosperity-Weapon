from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.database import get_db
from ..models.schema import Lead, Proposal, Notification, Connector, AgentLog, KnowledgeEntry, Company, Contact
from ..routers.auth import UserModel, SessionModel, AuditLogModel, get_current_user, require_role

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/system/stats")
def get_system_stats(db: Session = Depends(get_db), current_user: UserModel = Depends(require_role("admin"))):
    total_leads = db.query(Lead).count()
    total_proposals = db.query(Proposal).count()
    total_companies = db.query(Company).count()
    total_contacts = db.query(Contact).count()
    total_users = db.query(UserModel).count()
    total_notifications = db.query(Notification).count()
    total_connectors = db.query(Connector).count()
    total_agent_logs = db.query(AgentLog).count()
    total_knowledge = db.query(KnowledgeEntry).count()
    active_sessions = db.query(SessionModel).filter(SessionModel.is_active == True).count()
    today = datetime.utcnow().date()
    today_leads = db.query(Lead).filter(Lead.found_at >= today).count()
    today_proposals = db.query(Proposal).filter(Proposal.created_at >= today).count()
    return {
        "total_leads": total_leads,
        "total_proposals": total_proposals,
        "total_companies": total_companies,
        "total_contacts": total_contacts,
        "total_users": total_users,
        "total_notifications": total_notifications,
        "total_connectors": total_connectors,
        "total_agent_logs": total_agent_logs,
        "total_knowledge_entries": total_knowledge,
        "active_sessions": active_sessions,
        "today_leads": today_leads,
        "today_proposals": today_proposals,
        "system_uptime": "operational",
        "last_audit_cleanup": datetime.utcnow().isoformat()
    }

@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role("admin"))
):
    total = db.query(UserModel).count()
    users = db.query(UserModel).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "users": [{"id": u.id, "email": u.email, "role": u.role, "is_active": u.is_active, "created_at": u.created_at.isoformat() if u.created_at else None} for u in users],
        "total": total, "page": page, "per_page": per_page
    }

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role: str = Query(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role("superadmin"))
):
    if role not in ("user", "admin", "superadmin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    log = AuditLogModel(
        id=f"audit-{datetime.utcnow().timestamp()}", 
        user_id=current_user.id, 
        action=f"update_role:{user_id}:{role}",
        resource="user",
        resource_id=user_id,
    )
    db.add(log)
    db.commit()
    return {"message": f"User {user_id} role updated to {role}"}

@router.get("/audit-logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role("admin"))
):
    total = db.query(AuditLogModel).count()
    logs = db.query(AuditLogModel).order_by(AuditLogModel.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "logs": [{"id": l.id, "user_id": l.user_id, "action": l.action, "timestamp": l.created_at.isoformat() if l.created_at else None} for l in logs],
        "total": total, "page": page, "per_page": per_page
    }

@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role("admin"))
):
    sessions = db.query(SessionModel).filter(SessionModel.is_active == True).all()
    return {
        "sessions": [{"id": s.id, "user_id": s.user_id, "token": s.token[:20] + "...", "created_at": s.created_at.isoformat() if s.created_at else None, "expires_at": s.expires_at.isoformat() if s.expires_at else None} for s in sessions],
        "total": len(sessions)
    }

@router.post("/maintenance/cleanup-sessions")
def cleanup_sessions(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role("admin"))
):
    expired = db.query(SessionModel).filter(SessionModel.expires_at < datetime.utcnow()).delete()
    db.commit()
    return {"message": f"Cleaned up {expired} expired sessions"}

@router.get("/leads/all")
def admin_get_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role("admin"))
):
    total = db.query(Lead).count()
    leads = db.query(Lead).order_by(Lead.found_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "leads": [
            {
                "id": l.id,
                "company": l.company,
                "status": l.status,
                "value": l.expected_revenue,
                "created_at": l.found_at.isoformat() if l.found_at else None,
            }
            for l in leads
        ],
        "total": total,
    }
