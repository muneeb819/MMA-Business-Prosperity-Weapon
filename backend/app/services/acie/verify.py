"""Verification module — email/phone verification & freshness.

Turn provider evidence into a verification verdict. This is the gate that
distinguishes a *guessed* mailbox from one we have positive evidence for.
No SMTP/RCPT here (blocked on Vercel); we use format + MX (DoH) + known-good
source + catch-all/role/disposable heuristics + freshness decay.
"""

from __future__ import annotations

import re
from typing import List, Optional
from datetime import datetime, timedelta

from . import constants
from .providers import Evidence
from .providers.registry import all_provider_names


def _catch_all_like(domain: str) -> bool:
    return bool(re.match(r"^([a-z0-9-]+)(-mail|-mailbox|-mx)?\.?$|^.*\.(vercel|netlify|pages\.dev)$", domain))

def _is_role(local: str) -> bool:
    return bool(re.match(constants.ROLE_RE, local))

def _is_disposable(domain: str) -> bool:
    return domain in constants.DISPOSABLE_DOMAINS


def evidence_for_email(evidence: List[Evidence], email: str) -> List[Evidence]:
    return [e for e in evidence if e.kind == "email" and e.value.lower() == email.lower()]


def verify_email(email: str, evidence: List[Evidence]) -> dict:
    from app.services.outreach_service import is_email_format_valid
    local, _, domain = (email or "").partition("@")
    domain = domain.lower()
    local = local.lower()

    checks = {"format": is_email_format_valid(email),
              "reserved": _is_disposable(domain),
              "mx": None,
              "verified_source": False,
              "catch_all": _catch_all_like(domain),
              "role": _is_role(local)}

    ev = evidence_for_email(evidence, email)

    # MX from DoH evidence if present, else doh lookup directly
    for e in ev:
        if e.provider == "doh":
            checks["mx"] = e.extra.get("mx") if isinstance(e.extra.get("mx"), (bool, type(None))) else e.verified
            if e.verified:
                checks["verified_source"] = True
        if e.provider in ("apollo", "hunter", "smtp", "web") and e.verified:
            checks["verified_source"] = True
            if e.provider in ("apollo", "hunter", "smtp"):
                checks["mx"] = True
    if checks["verified_source"] and checks["mx"] is None:
        checks["mx"] = True
    if checks["mx"] is None:
        from app.services.outreach_service import _domain_has_mx
        mx = _domain_has_mx(email)
        checks["mx"] = mx

    if not checks["format"]:
        verdict = "invalid"
    elif checks["reserved"]:
        verdict = "invalid"
    elif checks["role"]:
        verdict = "role"
    elif checks["catch_all"]:
        verdict = "catch_all"
    elif checks["verified_source"] and checks["mx"] is not False:
        verdict = "verified"
    elif checks["mx"] is False:
        verdict = "no_mx"
    elif checks["mx"] is True:
        verdict = "valid_mx"            # deliverability structurally OK, not person-confirmed
    else:
        verdict = "unknown"

    return {
        "verdict": verdict,
        "checks": checks,
        "sources": sorted({e.provider for e in ev}),
    }


def verify_phone(phone: str, evidence: List[Evidence]) -> dict:
    digits = re.sub(r"\D", "", phone or "")
    ev = [e for e in evidence if e.kind == "phone" and re.sub(r"\D", "", e.value) == digits]
    verified = any(e.verified for e in ev)
    return {
        "verdict": "verified" if digits and verified else ("unverified" if digits else "none"),
        "digits": digits,
        "sources": sorted({e.provider for e in ev}),
    }


def freshness(last_verified: Optional[datetime]) -> float:
    """0..1 — how fresh our verification is. Decays to 0 beyond 120 days."""
    if not last_verified:
        return 0.0
    age = datetime.utcnow() - last_verified
    days = age.total_seconds() / 86400.0
    if days <= 30:
        return 1.0
    if days >= 120:
        return 0.0
    return round(1.0 - (days - 30) / 90.0, 3)
