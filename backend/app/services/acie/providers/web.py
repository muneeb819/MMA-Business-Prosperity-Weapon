"""Web provider: keyless, free — scrapes the company site for a published,
company-domain email and validates the domain via DNS-over-HTTPS MX (works on
Vercel). Contributes real, verifiable evidence for the confidence engine."""

from __future__ import annotations

from typing import List, Optional
from . import Evidence, ProviderBase


class WebProvider(ProviderBase):
    name = "web"
    kind = "email"
    requires_key = False

    def fetch(self, company: str, domain: Optional[str] = None,
              title: Optional[str] = None, **kw) -> List[Evidence]:
        from app.services import enrichment

        # Reuse the keyless web-scrape provider already in the codebase.
        res = enrichment.enrich(company, verify=False, smtp=False, web=True)
        # verify=False -> returns heuristic; we call web scrape directly instead.
        email = enrichment._scrape_email(company) if hasattr(enrichment, "_scrape_email") else None
        evidence: List[Evidence] = []
        if email:
            wdom = email.split("@", 1)[1]
            mx = False
            try:
                mx = enrichment._mx_hosts(wdom) and True
            except Exception:
                mx = False
            # DoH verify delivered separately; treat published site email as
            # real evidence (source: web) when it resolves.
            evidence.append(Evidence(
                provider=self.name, kind="email", value=email,
                source_name=domain or enrichment.guess_domain(company),
                verified=bool(mx),
                role="@" in email and email.split("@")[0].lower() in (
                    "info", "contact", "sales", "hello", "admin", "office", "support", "careers"),
                confidence=0.9 if mx else 0.5,
            ))
        if domain:
            evidence.append(Evidence(provider=self.name, kind="domain",
                                     value=domain, confidence=0.8))
        return evidence
