"""HubSpot Integration Router - /api/hubspot/*"""

from __future__ import annotations

import json
import urllib.parse
import urllib.request

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.models.database import get_db
from app.models.schema import Lead
from app.services.hubspot import (
    get_hubspot_config,
    get_oauth_config,
    get_valid_oauth_config,
    list_contacts,
    get_contact,
    create_contact,
    update_contact,
    search_contacts,
    list_companies,
    create_company,
    list_deals,
    create_deal,
    get_pipelines,
    associate,
    list_owners,
    sync_lead_to_hubspot,
    _lead_to_hubspot_props,
)
from app.routers.auth import get_current_user

router = APIRouter(tags=["HubSpot"])


@router.get("/config/status")
def hubspot_config_status():
    pat_configured = False
    oauth_configured = False
    try:
        config = get_hubspot_config()
        pat_configured = True
    except ValueError:
        pass
    try:
        oauth = get_oauth_config()
        oauth_configured = True
    except ValueError:
        pass
    return {
        "pat_configured": pat_configured,
        "oauth_configured": oauth_configured,
        "configured": pat_configured or oauth_configured,
    }


@router.get("/oauth/authorize")
def hubspot_oauth_authorize():
    """Generate OAuth authorization URL for HubSpot."""
    try:
        oauth = get_oauth_config()
        params = {
            "client_id": oauth.client_id,
            "redirect_uri": oauth.redirect_uri,
            "scope": "crm.objects.contacts.read crm.objects.contacts.write crm.objects.companies.read crm.objects.companies.write crm.objects.deals.read crm.objects.deals.write crm.objects.owners.read",
            "response_type": "code",
        }
        auth_url = f"https://app.hubspot.com/oauth/authorize?{urllib.parse.urlencode(params)}"
        return {"authorize_url": auth_url}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/oauth/callback")
def hubspot_oauth_callback(code: str = Query(...)):
    """Handle OAuth callback - exchange code for tokens."""
    try:
        oauth = get_oauth_config()
        data = {
            "grant_type": "authorization_code",
            "client_id": oauth.client_id,
            "client_secret": oauth.client_secret,
            "redirect_uri": oauth.redirect_uri,
            "code": code,
        }
        req = urllib.request.Request(
            "https://api.hubapi.com/oauth/v1/token",
            data=urllib.parse.urlencode(data).encode(),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            resp = json.loads(r.read().decode())
        
        from app.services.hubspot import _save_oauth_tokens
        _save_oauth_tokens(resp["access_token"], resp["refresh_token"], resp["expires_in"])
        
        return {"status": "connected", "message": "HubSpot OAuth connected successfully"}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/oauth/refresh")
def hubspot_oauth_refresh():
    """Manually refresh access token."""
    try:
        from app.services.hubspot import get_valid_oauth_config
        oauth = get_valid_oauth_config()
        return {"status": "refreshed", "expires_at": oauth.expires_at.isoformat() if oauth.expires_at else None}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/oauth/status")
def hubspot_oauth_status():
    """Check OAuth connection status."""
    try:
        oauth = get_oauth_config()
        return {
            "connected": bool(oauth.access_token),
            "expired": oauth.is_expired,
            "expires_at": oauth.expires_at.isoformat() if oauth.expires_at else None,
        }
    except Exception as e:
        return {"connected": False, "error": str(e)}


@router.get("/contacts")
def hubspot_list_contacts(limit: int = Query(100, le=100), after: Optional[str] = None):
    try:
        config = get_hubspot_config()
        return list_contacts(config, limit=limit, after=after)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/contacts/search")
def hubspot_search_contacts(q: str = Query(...), limit: int = Query(10, le=100)):
    try:
        config = get_hubspot_config()
        return search_contacts(config, query=q, limit=limit)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/contacts/{contact_id}")
def hubspot_get_contact(contact_id: str):
    try:
        config = get_hubspot_config()
        return get_contact(config, contact_id)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/contacts")
def hubspot_create_contact(properties: dict):
    try:
        config = get_hubspot_config()
        return create_contact(config, properties)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.patch("/contacts/{contact_id}")
def hubspot_update_contact(contact_id: str, properties: dict):
    try:
        config = get_hubspot_config()
        return update_contact(config, contact_id, properties)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/companies")
def hubspot_list_companies(limit: int = Query(100, le=100), after: Optional[str] = None):
    try:
        config = get_hubspot_config()
        return list_companies(config, limit=limit, after=after)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/companies")
def hubspot_create_company(properties: dict):
    try:
        config = get_hubspot_config()
        return create_company(config, properties)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/deals")
def hubspot_list_deals(limit: int = Query(100, le=100), after: Optional[str] = None, pipeline: Optional[str] = None):
    try:
        config = get_hubspot_config()
        return list_deals(config, limit=limit, after=after, pipeline=pipeline)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/deals")
def hubspot_create_deal(properties: dict):
    try:
        config = get_hubspot_config()
        return create_deal(config, properties)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/pipelines/{object_type}")
def hubspot_pipelines(object_type: str = "deals"):
    try:
        config = get_hubspot_config()
        return get_pipelines(config, object_type)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/owners")
def hubspot_owners():
    try:
        config = get_hubspot_config()
        return list_owners(config)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/sync/lead/{lead_id}")
def hubspot_sync_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(404, "Lead not found")
    
    lead_dict = {
        "id": lead.id,
        "email": lead.email,
        "client_name": lead.client_name,
        "company": lead.company,
        "title": lead.title,
        "phone": lead.phone,
        "url": lead.url,
        "platform": lead.platform,
        "technologies": lead.technologies or [],
    }
    
    try:
        result = sync_lead_to_hubspot(lead_dict)
        return {"synced": True, "hubspot_contact": result}
    except Exception as e:
        raise HTTPException(500, f"HubSpot sync failed: {e}")


@router.post("/sync/lead-properties/{lead_id}")
def hubspot_lead_properties(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(404, "Lead not found")
    
    return _lead_to_hubspot_props({
        "id": lead.id,
        "email": lead.email,
        "client_name": lead.client_name,
        "company": lead.company,
        "title": lead.title,
        "phone": lead.phone,
        "url": lead.url,
        "platform": lead.platform,
        "technologies": lead.technologies or [],
    })