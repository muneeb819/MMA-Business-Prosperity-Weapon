"""HubSpot Integration Service - Personal Access Key + OAuth 2.1 based."""

from __future__ import annotations

import json
import urllib.request
import urllib.parse
from typing import Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta


HUBSPOT_BASE = "https://api.hubapi.com"
HUBSPOT_API_VERSION = "v3"
OAUTH_BASE = "https://app.hubspot.com"
MCP_BASE = "https://mcp-na2.hubspot.com"


@dataclass
class HubSpotConfig:
    api_key: str
    base_url: str = HUBSPOT_BASE
    api_version: str = HUBSPOT_API_VERSION

    @property
    def headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }


@dataclass
class HubSpotOAuthConfig:
    client_id: str
    client_secret: str
    redirect_uri: str
    app_id: str
    access_token: str | None = None
    refresh_token: str | None = None
    expires_at: datetime | None = None

    @property
    def is_expired(self) -> bool:
        if not self.expires_at:
            return True
        return datetime.utcnow() >= self.expires_at - timedelta(minutes=5)

    @property
    def headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        } if self.access_token else {"Content-Type": "application/json"}


def _get_hubspot_key() -> str:
    try:
        from app.models.database import SessionLocal
        from app.models.schema import AppConfig
        db = SessionLocal()
        try:
            row = db.query(AppConfig).filter(AppConfig.key == "hubspot_api_key").first()
            if row and row.value:
                return row.value
        finally:
            db.close()
    except Exception:
        pass
    return ""


def _get_oauth_config() -> HubSpotOAuthConfig:
    try:
        from app.models.database import SessionLocal
        from app.models.schema import AppConfig
        db = SessionLocal()
        try:
            cfg = {}
            for key in ("hubspot_client_id", "hubspot_client_secret", "hubspot_redirect_uri", "hubspot_app_id",
                        "hubspot_access_token", "hubspot_refresh_token", "hubspot_token_expires_at"):
                row = db.query(AppConfig).filter(AppConfig.key == key).first()
                if row and row.value:
                    cfg[key] = row.value
            
            if not all(k in cfg for k in ("hubspot_client_id", "hubspot_client_secret", "hubspot_redirect_uri", "hubspot_app_id")):
                raise ValueError("OAuth credentials incomplete")
            
            expires_at = None
            if cfg.get("hubspot_token_expires_at"):
                expires_at = datetime.fromisoformat(cfg["hubspot_token_expires_at"])
            
            return HubSpotOAuthConfig(
                client_id=cfg["hubspot_client_id"],
                client_secret=cfg["hubspot_client_secret"],
                redirect_uri=cfg["hubspot_redirect_uri"],
                app_id=cfg["hubspot_app_id"],
                access_token=cfg.get("hubspot_access_token"),
                refresh_token=cfg.get("hubspot_refresh_token"),
                expires_at=expires_at,
            )
        finally:
            db.close()
    except Exception:
        raise ValueError("HubSpot OAuth not configured. Set client_id, client_secret, redirect_uri, app_id in AppConfig.")


def get_hubspot_config() -> HubSpotConfig:
    key = _get_hubspot_key()
    if not key:
        raise ValueError("HubSpot API key not configured. Set hubspot_api_key in AppConfig.")
    return HubSpotConfig(api_key=key)


def get_oauth_config() -> HubSpotOAuthConfig:
    return _get_oauth_config()


def _save_oauth_tokens(access_token: str, refresh_token: str, expires_in: int) -> None:
    from app.models.database import SessionLocal
    from app.models.schema import AppConfig
    db = SessionLocal()
    try:
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        for key, value in [
            ("hubspot_access_token", access_token),
            ("hubspot_refresh_token", refresh_token),
            ("hubspot_token_expires_at", expires_at.isoformat()),
        ]:
            row = db.query(AppConfig).filter(AppConfig.key == key).first()
            if row:
                row.value = value
            else:
                db.add(AppConfig(key=key, value=value))
        db.commit()
    finally:
        db.close()


def _refresh_access_token(oauth: HubSpotOAuthConfig) -> HubSpotOAuthConfig:
    if not oauth.refresh_token:
        raise ValueError("No refresh token available")
    
    data = {
        "grant_type": "refresh_token",
        "client_id": oauth.client_id,
        "client_secret": oauth.client_secret,
        "refresh_token": oauth.refresh_token,
    }
    req = urllib.request.Request(
        f"{OAUTH_BASE}/oauth/v1/token",
        data=urllib.parse.urlencode(data).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        resp = json.loads(r.read().decode())
    
    _save_oauth_tokens(resp["access_token"], resp["refresh_token"], resp["expires_in"])
    oauth.access_token = resp["access_token"]
    oauth.refresh_token = resp["refresh_token"]
    oauth.expires_at = datetime.utcnow() + timedelta(seconds=resp["expires_in"])
    return oauth


def get_valid_oauth_config() -> HubSpotOAuthConfig:
    oauth = get_oauth_config()
    if oauth.is_expired and oauth.refresh_token:
        return _refresh_access_token(oauth)
    return oauth


def _request(method: str, path: str, config: HubSpotConfig | HubSpotOAuthConfig, data: dict | None = None, params: dict | None = None) -> dict:
    url = f"{config.base_url}/{config.api_version}{path}"
    if params:
        query = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"{url}?{query}"
    req = urllib.request.Request(url, headers=config.headers, method=method)
    if data:
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode()) if r.status != 204 else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        raise RuntimeError(f"HubSpot API error {e.code}: {body}") from e


# ---- CRM Objects ----

def list_contacts(config: HubSpotConfig, limit: int = 100, after: str | None = None, properties: list[str] | None = None) -> dict:
    params = {"limit": str(limit)}
    if after:
        params["after"] = after
    if properties:
        params["properties"] = ",".join(properties)
    return _request("GET", "/crm/v3/objects/contacts", config, params=params)


def get_contact(config: HubSpotConfig, contact_id: str, properties: list[str] | None = None) -> dict:
    params = {}
    if properties:
        params["properties"] = ",".join(properties)
    return _request("GET", f"/crm/v3/objects/contacts/{contact_id}", config, params=params)


def create_contact(config: HubSpotConfig, properties: dict) -> dict:
    return _request("POST", "/crm/v3/objects/contacts", config, data={"properties": properties})


def update_contact(config: HubSpotConfig, contact_id: str, properties: dict) -> dict:
    return _request("PATCH", f"/crm/v3/objects/contacts/{contact_id}", config, data={"properties": properties})


def search_contacts(config: HubSpotConfig, query: str, limit: int = 10) -> dict:
    return _request("POST", "/crm/v3/objects/contacts/search", config, data={
        "filterGroups": [{"filters": [{"propertyName": "email", "operator": "CONTAINS_TOKEN", "value": query}]}],
        "limit": limit,
    })


def list_companies(config: HubSpotConfig, limit: int = 100, after: str | None = None) -> dict:
    params = {"limit": str(limit)}
    if after:
        params["after"] = after
    return _request("GET", "/crm/v3/objects/companies", config, params=params)


def create_company(config: HubSpotConfig, properties: dict) -> dict:
    return _request("POST", "/crm/v3/objects/companies", config, data={"properties": properties})


def list_deals(config: HubSpotConfig, limit: int = 100, after: str | None = None, pipeline: str | None = None) -> dict:
    params = {"limit": str(limit)}
    if after:
        params["after"] = after
    if pipeline:
        params["pipeline"] = pipeline
    return _request("GET", "/crm/v3/objects/deals", config, params=params)


def create_deal(config: HubSpotConfig, properties: dict) -> dict:
    return _request("POST", "/crm/v3/objects/deals", config, data={"properties": properties})


def get_pipelines(config: HubSpotConfig, object_type: str = "deals") -> dict:
    return _request("GET", f"/crm/v3/pipelines/{object_type}", config)


# ---- Associations ----

def associate(config: HubSpotConfig, from_object: str, from_id: str, to_object: str, to_id: str, association_type: str | None = None) -> dict:
    body = {"toObjectId": to_id}
    if association_type:
        body["associationType"] = association_type
    return _request("PUT", f"/crm/v3/objects/{from_object}/{from_id}/associations/{to_object}", config, data=body)


# ---- Owners ----

def list_owners(config: HubSpotConfig) -> dict:
    return _request("GET", "/crm/v3/owners", config)


# ---- Webhooks (for real-time sync) ----

def list_webhooks(config: HubSpotConfig) -> dict:
    return _request("GET", "/webhooks/v3/webhooks", config)


def create_webhook(config: HubSpotConfig, url: str, events: list[str]) -> dict:
    return _request("POST", "/webhooks/v3/webhooks", config, data={"url": url, "events": events})


# ---- Sync helpers ----

def sync_lead_to_hubspot(lead: dict) -> dict:
    """Create or update a HubSpot contact from a lead."""
    config = get_hubspot_config()
    email = lead.get("email") or lead.get("client_name", "").lower().replace(" ", ".") + "@example.com"
    
    # Search existing
    search = search_contacts(config, email, limit=1)
    if search.get("results"):
        contact_id = search["results"][0]["id"]
        return update_contact(config, contact_id, _lead_to_hubspot_props(lead))
    
    return create_contact(config, _lead_to_hubspot_props(lead))


def _lead_to_hubspot_props(lead: dict) -> dict:
    return {
        "email": lead.get("email", ""),
        "firstname": lead.get("client_name", "").split(" ")[0] if lead.get("client_name") else "",
        "lastname": " ".join(lead.get("client_name", "").split(" ")[1:]) if lead.get("client_name") else "",
        "company": lead.get("company", ""),
        "jobtitle": lead.get("title", ""),
        "phone": lead.get("phone", ""),
        "website": lead.get("url", ""),
        "lifecyclestage": "lead",
        "hs_lead_status": "NEW",
        "mbpw_lead_id": lead.get("id", ""),
        "mbpw_source": lead.get("platform", ""),
        "mbpw_technologies": ", ".join(lead.get("technologies", [])) if lead.get("technologies") else "",
    }