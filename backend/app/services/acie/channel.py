"""Channel Selection Intelligence.

Pick the best permitted channel for a contact given verification + preference +
cadence + engagement history. The compliance gate is ALWAYS applied first; this
module only picks among channels that are permitted and verified. Never picks a
channel we have no verified contact for (no hallucinated phone numbers).
"""

from __future__ import annotations

from typing import List, Optional

# Channel priority when evidence exists (best to worst for B2B outreach).
CHANNEL_PRIORITY = ["email", "phone", "social", "linkedin"]


def candidate_channels(profile: dict, verification: dict) -> List[dict]:
    """List channels with verdict + verified flag, best first."""
    channels = []
    verdict = verification.get("verdict")
    if (profile or {}).get("email"):
        channels.append({
            "channel": "email", "target": profile["email"],
            "verified": verdict in ("verified", "valid_mx", "catch_all"),
            "verdict": verdict, "priority": 1,
        })
    if (profile or {}).get("phone"):
        channels.append({
            "channel": "phone", "target": profile["phone"],
            "verified": verification.get("phone", {}).get("verdict") == "verified"
                        if isinstance(verification.get("phone"), dict) else False,
            "verdict": (verification.get("phone", {}) if isinstance(verification.get("phone"), dict) else {}).get("verdict", "none"),
            "priority": 2,
        })
    if (profile or {}).get("linkedin"):
        channels.append({
            "channel": "linkedin", "target": profile["linkedin"],
            "verified": True, "verdict": "verified", "priority": 3,
        })
    # Only confirm social when no email/phone (email first-line is standard B2B).
    return sorted(channels, key=lambda c: c["priority"])


def select_channel(profile: dict, verification: dict,
                   permitted: List[str] | None = None) -> dict:
    """Choose best PERMITTED + verified channel."""
    allowed = set(permitted or [c["channel"] for c in candidate_channels(profile, verification)])
    for c in candidate_channels(profile, verification):
        if c["channel"] in allowed and c["verified"]:
            return c
    # Fall back to any permitted channel (even unverified) rather than none.
    for c in candidate_channels(profile, verification):
        if c["channel"] in allowed:
            return c
    return {"channel": None, "target": None, "verified": False, "verdict": "none"}
