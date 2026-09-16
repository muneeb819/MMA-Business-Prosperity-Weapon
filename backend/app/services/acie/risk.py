"""Risk detection — nontarget / suppression signals that must block or downgrade
a contact before outreach. Higher risk => lower effective confidence and, at
the threshold, outright suppression (see compliance).
"""

from __future__ import annotations

from typing import List, Optional
from datetime import datetime

from . import constants
from .providers import Evidence


def assess_risk(profile: dict, evidence: List[Evidence],
                bounced: int = 0, interrupted: bool = False) -> dict:
    risk = 0.0
    flags = []

    email = (profile or {}).get("email") or ""
    domain = ((email or "").split("@")[-1] if email else "") or (profile or {}).get("domain") or ""

    # Bounce history is the strongest negative signal.
    if bounced and bounced >= 3:
        risk += 0.9; flags.append(f"bounced {bounced}x")
    elif bounced and bounced >= 1:
        risk += 0.4; flags.append(f"bounced {bounced}x")

    # Disposable domains are effectively spam traps / burners.
    if domain and domain.lower() in constants.DISPOSABLE_DOMAINS:
        risk += 0.8; flags.append("disposable domain")

    # Catch-all / role mailboxes are low to target.
    if email:
        local = email.split("@")[0].lower()
        if __import__("re").match(constants.ROLE_RE, local):
            risk += 0.25; flags.append("role mailbox")

    # A verified MX is good, but an unverified guess raises risk.
    verdict = (profile or {}).get("verification_status") or "unknown"
    if verdict in ("no_mx", "invalid"):
        risk += 0.7; flags.append(f"verdict={verdict}")

    if interrupted:
        risk += 0.15; flags.append("interrupted")

    return {
        "score": round(min(risk, 1.0), 3),
        "flags": flags,
        "greenlit": risk < 0.5 and verdict not in ("no_mx", "invalid"),
    }
