"""ACIE Confidence Scorer — the decision heart.

Multiplies every evidence factor into a 0-100 contact-confidence score using the
spec's fixed weights (25 identity / 20 employment / 20 verification /
15 freshness / 10 provider agreement / 5 domain health / 5 historical).
A contact is only OUTREACH_READY (HIGH) when it clears the risk gate AND the
compliance gate AND score >= 90.
"""

from __future__ import annotations

from typing import List, Optional

from . import constants
from .providers import Evidence
from .providers.registry import all_provider_names


def _agreement(evidence: List[Evidence], email: str) -> float:
    """Provider agreement 0..1 — how many distinct providers agree on this email."""
    if not email:
        return 0.0
    matching = {e.provider for e in evidence if e.kind == "email" and e.value.lower() == email.lower()}
    total = len(matching)
    if total == 0:
        return 0.0
    if total >= 2:
        return 1.0
    return 0.5


def _domain_health(evidence: List[Evidence], profile: dict) -> float:
    """0..1 — MX present + company domain resolvable."""
    domain = (profile or {}).get("domain") or ""
    if not domain:
        return 0.0
    mx = (profile or {}).get("checks", {}).get("mx")
    if mx is True:
        return 1.0
    if mx is None:
        return 0.4
    return 0.0


def _historical(profile: dict) -> float:
    """0..1 — historical performance / feedback for this contact's provider path."""
    return float((profile or {}).get("provider_reliability", 0.5))


def score_contact(identity: dict, employment: dict, verification: dict,
                  freshness: float, evidence: List[Evidence],
                  profile: dict, risk: dict,
                  provider_reliability: float = 0.5) -> dict:
    """Compute component scores, weighted total, and decision tier."""

    # Component scores (each 0..1)
    identity_s = identity.get("score", 0.0)
    employment_s = employment.get("confidence", 0.0)
    email_verdict = verification.get("verdict")
    verification_s = {"verified": 1.0, "valid_mx": 0.75, "catch_all": 0.35,
                      "role": 0.3, "no_mx": 0.0, "invalid": 0.0, "unknown": 0.25}.get(email_verdict, 0.0)
    prov_agreement_s = _agreement(evidence, (profile or {}).get("email") or "")
    domain_health_s = _domain_health(evidence, profile)
    historical_s = _historical(profile)

    # Apply provider-performance decay on identity/verification agreement evidence.
    identity_s = max(0.0, identity_s * (1.0 - (1.0 - provider_reliability) * 0.5))

    total = (
        constants.WEIGHTS["identity"] * identity_s +
        constants.WEIGHTS["employment"] * employment_s +
        constants.WEIGHTS["verification"] * verification_s +
        constants.WEIGHTS["freshness"] * freshness +
        constants.WEIGHTS["provider_agreement"] * prov_agreement_s +
        constants.WEIGHTS["domain_health"] * domain_health_s +
        constants.WEIGHTS["historical"] * historical_s
    )
    # Risk penalty (up to -0.3 for high real risk).
    risk_penalty = min(0.3, (risk.get("score") or 0.0) * 0.4)
    total = max(0.0, total - risk_penalty)

    score = round(total * 100, 1)

    # Decision tier.
    if score >= constants.HIGH_CONFIDENCE:
        tier = "HIGH"            # OUTREACH_READY (pending gates)
    elif score >= constants.REVIEW_THRESHOLD:
        tier = "MEDIUM"          # REVIEW-ALT: try alternative channel / re-verify
    else:
        tier = "LOW"             # SUPPRESS: do not contact

    return {
        "score": score,
        "tier": tier,
        "components": {
            "identity": round(identity_s, 3),
            "employment": round(employment_s, 3),
            "verification": round(verification_s, 3),
            "freshness": round(freshness, 3),
            "provider_agreement": round(prov_agreement_s, 3),
            "domain_health": round(domain_health_s, 3),
            "historical": round(historical_s, 3),
        },
        "weights": dict(constants.WEIGHTS),
        "risk_penalty": round(risk_penalty, 3),
        "email_verdict": email_verdict,
        "providers": sorted({e.provider for e in evidence}),
    }
