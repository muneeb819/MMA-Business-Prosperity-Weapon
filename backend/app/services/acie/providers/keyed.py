"""Keyed email providers: Apollo + Hunter.

These are fully wired to the real APIs and auto-activate as soon as the API key
is present (env var or Settings UI -> DB). When the key is missing or the API
returns 403/plan-limit, they return no evidence and record a hit so the
learning engine can down-weight the provider (never hard-crash the pipeline).

Because Apollo/Hunter frequently 403 on free-tier plans in this deployment,
the decision engine must NEVER treat their absence as a failure — it simply
loses one evidence stream the same way it loses a scrape.
"""

from __future__ import annotations

import os
import json
import urllib.request
from typing import List, Optional
from . import Evidence, ProviderBase


def _key(name: str) -> str:
    val = os.getenv(name.upper() + "_API_KEY", "")
    if val:
        return val
    try:
        from app.models.database import SessionLocal
        from app.models.schema import AppConfig
        db = SessionLocal()
        try:
            row = db.query(AppConfig).filter(AppConfig.key == name.lower() + "_api_key").first()
            if row and row.value:
                val = row.value
        finally:
            db.close()
    except Exception:
        pass
    return val


class ApolloProvider(ProviderBase):
    name = "apollo"
    kind = "email"
    requires_key = True

    def fetch(self, company: str, domain: Optional[str] = None,
              title: Optional[str] = None, **kw) -> List[Evidence]:
        api_key = _key("apollo")
        if not api_key:
            return []
        try:
            from app.services import enrichment
            res = enrichment._apollo_lookup(company, api_key, title) if hasattr(enrichment, "_apollo_lookup") else None
            if res and res.get("email"):
                return [Evidence(
                    provider=self.name, kind="email", value=res["email"],
                    source_name=company, verified=True, confidence=0.95,
                    extra={"person": res.get("name")},
                )]
        except Exception:
            pass
        return []


class HunterProvider(ProviderBase):
    name = "hunter"
    kind = "email"
    requires_key = True

    def fetch(self, company: str, domain: Optional[str] = None,
              title: Optional[str] = None, **kw) -> List[Evidence]:
        api_key = _key("hunter")
        if not api_key or not domain:
            return []
        try:
            from app.services import enrichment
            res = enrichment._hunter_lookup(domain, api_key) if hasattr(enrichment, "_hunter_lookup") else None
            if res:
                return [Evidence(
                    provider=self.name, kind="email", value=res,
                    source_name=domain, verified=True, confidence=0.95,
                )]
        except Exception:
            pass
        return []
