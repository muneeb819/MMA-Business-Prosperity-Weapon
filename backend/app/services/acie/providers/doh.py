"""DNS-over-HTTPS provider: valid, free, Vercel-safe MX verification evidence."""

from __future__ import annotations

from typing import List, Optional
from . import Evidence, ProviderBase


class DohProvider(ProviderBase):
    name = "doh"
    kind = "email"
    requires_key = False

    def fetch(self, company: str, domain: Optional[str] = None,
              title: Optional[str] = None, candidate: Optional[str] = None,
              **kw) -> List[Evidence]:
        from app.services import outreach_service
        if not candidate:
            return []
        mx = outreach_service._domain_has_mx(candidate)
        # None = DNS unavailable (can't confirm, don't count as failure)
        evidence = [Evidence(
            provider=self.name, kind="email", value=candidate,
            verified=(mx is True), confidence=0.9 if mx else (0.3 if mx is False else 0.4),
            extra={"mx": mx},
        )]
        return evidence
