from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from sqlalchemy.orm import Session

from app.models.database import SessionLocal
from app.models.schema import Connector, Lead, Notification
from app.services.sync import sync_source, sync_all_sources

router = APIRouter()


class ConnectorCreate(BaseModel):
    name: str
    type: str
    platform: Optional[str] = None
    config: Optional[dict] = {}


class ConnectorUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    config: Optional[dict] = None


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


@router.get("/")
def list_connectors():
    db = SessionLocal()
    try:
        connectors = db.query(Connector).order_by(Connector.created_at.desc()).all()
        return [
            {
                "id": c.id,
                "name": c.name,
                "type": c.type,
                "platform": c.platform,
                "status": c.status,
                "config": c.config or {},
                "lastSyncAt": c.last_sync_at.isoformat() if c.last_sync_at else None,
                "syncCount": c.sync_count,
                "leadsFound": c.leads_found,
                "errorMessage": c.error_message,
                "createdAt": c.created_at.isoformat() if c.created_at else None,
                "updatedAt": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in connectors
        ]
    finally:
        db.close()


@router.post("/")
def create_connector(payload: ConnectorCreate):
    db = SessionLocal()
    try:
        connector = Connector(
            id=f"conn-{uuid.uuid4().hex[:12]}",
            name=payload.name,
            type=payload.type,
            platform=payload.platform,
            config=payload.config,
            status="inactive",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(connector)
        db.commit()
        db.refresh(connector)
        return {
            "id": connector.id,
            "name": connector.name,
            "type": connector.type,
            "platform": connector.platform,
            "status": connector.status,
            "config": connector.config or {},
            "syncCount": 0,
            "leadsFound": 0,
            "createdAt": connector.created_at.isoformat() if connector.created_at else None,
        }
    finally:
        db.close()


@router.put("/{connector_id}")
def update_connector(connector_id: str, payload: ConnectorUpdate):
    db = SessionLocal()
    try:
        connector = db.query(Connector).filter(Connector.id == connector_id).first()
        if not connector:
            raise HTTPException(status_code=404, detail="Connector not found")
        if payload.name is not None:
            connector.name = payload.name
        if payload.status is not None:
            connector.status = payload.status
        if payload.config is not None:
            connector.config = payload.config
        connector.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(connector)
        return {
            "id": connector.id,
            "name": connector.name,
            "type": connector.type,
            "platform": connector.platform,
            "status": connector.status,
            "config": connector.config or {},
            "syncCount": connector.sync_count,
            "leadsFound": connector.leads_found,
            "updatedAt": connector.updated_at.isoformat() if connector.updated_at else None,
        }
    finally:
        db.close()


@router.post("/{connector_id}/sync")
def sync_connector(connector_id: str):
    db = SessionLocal()
    try:
        connector = db.query(Connector).filter(Connector.id == connector_id).first()
        if not connector:
            raise HTTPException(status_code=404, detail="Connector not found")

        import asyncio
        connector.status = "syncing"
        db.commit()

        source_name = connector.platform or connector.name.lower().replace(" ", "")
        try:
            result = asyncio.get_event_loop().run_until_complete(
                sync_source(source_name, db, limit=30)
            )
        except RuntimeError:
            loop = asyncio.new_event_loop()
            result = loop.run_until_complete(
                sync_source(source_name, db, limit=30)
            )
            loop.close()

        if "error" in result and result.get("fetched", 0) == 0:
            connector.status = "error"
            connector.error_message = result["error"]
        else:
            new_leads = result.get("new", 0)
            connector.status = "active"
            connector.last_sync_at = datetime.utcnow()
            connector.sync_count += 1
            connector.leads_found += new_leads + result.get("updated", 0)
            connector.error_message = None

            if new_leads > 0:
                notif = Notification(
                    id=f"notif-{uuid.uuid4().hex[:12]}",
                    type="system",
                    title="Connector Sync Complete",
                    message=f"{connector.name} found {new_leads} new leads",
                    read=False,
                    priority="low",
                    created_at=datetime.utcnow(),
                )
                db.add(notif)

        connector.updated_at = datetime.utcnow()
        db.commit()
        return {
            "id": connector.id,
            "status": connector.status,
            "syncCount": connector.sync_count,
            "leadsFound": connector.leads_found,
            "newLeadsThisSync": result.get("new", 0),
            "fetched": result.get("fetched", 0),
            "lastSyncAt": connector.last_sync_at.isoformat() if connector.last_sync_at else None,
            "error": result.get("error"),
        }
    finally:
        db.close()


@router.delete("/{connector_id}")
def delete_connector(connector_id: str):
    db = SessionLocal()
    try:
        connector = db.query(Connector).filter(Connector.id == connector_id).first()
        if not connector:
            raise HTTPException(status_code=404, detail="Connector not found")
        db.delete(connector)
        db.commit()
        return {"deleted": True, "id": connector_id}
    finally:
        db.close()
