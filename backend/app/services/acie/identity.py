"""Identity resolution + identity-confidence scoring.

A contact's identity is trustworthy when we can tie a name to a company and a
domain that are consistent with each other and with the lead's own company.
Identity is 25% of total confidence (spec section 6).
"""

from __future__ import annotations

import re
from typing import Optional

from . import constants


def normalize_company(name: str | None) -> str:
    if not name:
        return ""
    name = name.strip()
    name = re.sub(r"\b(inc|ltd|llc|corp|corporation|gmbh|ag|sa|co|group|limited|llp|plc|srl|bv|pvt|pty)\b\.?", "", name, flags=re.I)
    name = re.sub(r"[^a-z0-9 ]+", " ", name.lower())
    name = " ".join(name.split())
    return name.lower().replace(" ", "")


def normalize_domain(company: str, site: Optional[str] = None) -> Optional[str]:
    """Return a best-guess company domain (first-party, not heuristic mailbox)."""
    if not company:
        return None
    name = re.sub(r"\b(inc|ltd|llc|corp|corporation|gmbh|ag|sa|co|group|limited|llp|plc|srl|bv|pvt|pty)\b\.?", "", company, flags=re.I)
    name = name.strip()
    name = re.split(r"[^a-zA-Z0-9]+", name)[0] if name else ""
    name = name.lower()
    if not name:
        return None
    return f"{name}.com"


def identity_confidence(person_name: str | None, company: str | None,
                        domain: str | None, title: str | None) -> dict:
    """Score identity evidence: person + company + domain + title present."""
    score = 0.0
    reasons = []
    if company and normalize_company(company):
        score += 0.4
        reasons.append("company known")
    if title:
        score += 0.2
        reasons.append("role/title known")
    if person_name:
        score += 0.2
        reasons.append("person known")
    if domain and re.match(r"^[a-z0-9.-]+\.[a-z]{2,}$", domain):
        score += 0.2
        reasons.append("domain known")
    score = round(min(score, 1.0), 3)
    return {"score": score, "reasons": reasons,
            "verified": company and domain and (person_name or title)}
