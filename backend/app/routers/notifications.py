from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    lead_id: Optional[str] = None
    read: bool
    created_at: str
    priority: str

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(unread_only: bool = False):
    """Get all notifications."""
    return []

@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    """Mark a notification as read."""
    return {"message": "Notification marked as read"}

@router.put("/read-all")
async def mark_all_read():
    """Mark all notifications as read."""
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a notification."""
    return {"message": "Notification deleted"}
