"""Provider registry — the only place providers are composed.

The decision engine asks the registry for evidence. The registry:
  * always includes free keyless providers
  * includes keyed providers only when they are configured (auto-onboard)
  * reports blocked/unauthorized status so provider-performance can decay them
"""

from __future__ import annotations

import os
from typing import List

from . import Evidence, ProviderBase
from .web import WebProvider
from .doh import DohProvider
from .keyed import ApolloProvider, HunterProvider
from .twilio import TwilioLookupProvider

_FREE = [WebProvider(), DohProvider()]
_KEYED = [ApolloProvider(), HunterProvider(), TwilioLookupProvider()]


def all_provider_names() -> List[str]:
    return [p.name for p in _FREE + _KEYED]


def active_providers(kind: str | None = None) -> List[ProviderBase]:
    out: List[ProviderBase] = []
    for p in _FREE:
        if kind is None or p.kind == kind:
            out.append(p)
    for p in _KEYED:
        if kind is not None and p.kind != kind:
            continue
        if p.requires_key and not _is_configured(p.name):
            continue
        out.append(p)
    return out


def _is_configured(name: str) -> bool:
    if name == "apollo":
        return bool(apollo_key())
    if name == "hunter":
        return bool(hunter_key())
    if name == "twilio_lookup":
        return bool(os.getenv("TWILIO_ACCOUNT_SID", "")) and bool(os.getenv("TWILIO_AUTH_TOKEN", ""))
    return False


def apollo_key() -> str:
    from .keyed import _key
    return _key("apollo")


def hunter_key() -> str:
    from .keyed import _key
    return _key("hunter")


def configured_status() -> dict:
    return {
        "free": [p.name for p in _FREE],
        "configured": [p.name for p in _KEYED if _is_configured(p.name)],
        "available": [p.name for p in _KEYED if not _is_configured(p.name)],
    }
