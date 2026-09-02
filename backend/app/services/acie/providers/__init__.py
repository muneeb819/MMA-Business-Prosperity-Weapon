"""ACIE Provider Layer.

Providers do NOT decide whether a contact is good. They only supply EVIDENCE —
candidate emails/phones + verification signals — and the ACIE decision engine
turns that evidence into confidence.

Design principles:
  * Providers are pluggable. Each returns a list of Evidence objects.
  * Free, keyless providers (web-scrape, DoH MX) work today on Vercel.
  * Keyed providers (apollo, hunter, twilio_lookup) auto-activate the moment
    their API key is present (env or DB-backed settings), and degrade
    gracefully (raise NotConfigured) when the key is missing or the API 403s.
  * Provider performance is tracked so a bad vendor's weight decays over time.
"""

from __future__ import annotations

import dataclasses
from typing import Callable, Dict, List, Optional


@dataclasses.dataclass
class Evidence:
    """A single piece of evidence collected for a contact/company."""
    provider: str
    kind: str              # email | phone | name | title | domain | signal
    value: str
    source_name: Optional[str] = None
    verified: bool = False
    catch_all: Optional[bool] = None
    disposable: Optional[bool] = None
    role: Optional[bool] = None
    confidence: float = 0.5
    extra: dict = dataclasses.field(default_factory=dict)


class ProviderBase:
    """Base class every ACIE provider implements."""
    name = "base"
    kind = "email"
    requires_key = False

    def _has_key(self, key: str) -> bool:
        if key:
            return True
        return False

    def fetch(self, company: str, domain: Optional[str] = None,
              title: Optional[str] = None, **kw) -> List[Evidence]:
        raise NotImplementedError
