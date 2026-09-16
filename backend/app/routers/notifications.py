from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.models.database import get_db
from app.models.schema import Notification

router = APIRouter()


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    lead_id: Optional[str] = None
    read: bool
    priority: str = "medium"
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


def _notif_to_dict(n: Notification) -> dict:
    return {
        "id": n.id,
        "type": n.type or "system",
        "title": n.title,
        "message": n.message or "",
        "leadId": n.lead_id,
        "read": n.read or False,
        "priority": n.priority or "medium",
        "createdAt": n.created_at.isoformat() if n.created_at else None,
    }


@router.get("/unread-count")
def unread_notification_count(db: Session = Depends(get_db)):
    count = db.query(Notification).filter(Notification.read == False).count()
    return {"count": count}


@router.get("/")
def get_notifications(
    filter_type: Optional[str] = Query(None, alias="filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Notification)

    if filter_type == "unread":
        query = query.filter(Notification.read == False)
    elif filter_type == "high_value":
        query = query.filter(Notification.type == "high_value")
    elif filter_type == "urgent":
        query = query.filter(Notification.priority == "high")

    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return [_notif_to_dict(n) for n in notifications]


@router.put("/{notification_id}/read")
def toggle_notification_read(notification_id: str, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")

    n.read = not n.read
    db.commit()
    db.refresh(n)
    return _notif_to_dict(n)


@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.read == False).update({"read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(notification_id: str, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(n)
    db.commit()
    return {"message": "Notification deleted"}


@router.delete("/")
def clear_all_notifications(db: Session = Depends(get_db)):
    count = db.query(Notification).delete()
    db.commit()
    return {"message": f"Cleared {count} notifications"}
