from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
import random
from sqlalchemy.orm import Session

from app.models.database import SessionLocal
from app.models.schema import Connector

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
        connector.status = "syncing"
        connector.last_sync_at = datetime.utcnow()
        connector.sync_count += 1
        new_leads = random.randint(1, 8)
        connector.leads_found += new_leads
        connector.updated_at = datetime.utcnow()
        connector.status = "active"
        connector.error_message = None
        db.commit()
        return {
            "id": connector.id,
            "status": "active",
            "syncCount": connector.sync_count,
            "leadsFound": connector.leads_found,
            "newLeadsThisSync": new_leads,
            "lastSyncAt": connector.last_sync_at.isoformat(),
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
