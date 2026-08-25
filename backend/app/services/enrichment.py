import os
import re
import socket
import json
import urllib.request
from typing import Optional

# Role inboxes are real company mailboxes and the safe, legitimate target for
# first-touch outreach (as opposed to guessing a person's personal address).
ROLE_PREFIXES = ["info", "careers", "hello", "contact", "sales", "team", "support"]


def guess_domain(company: str) -> Optional[str]:
    """Best-effort company -> domain guess from the name alone."""
    if not company:
        return None
    c = company.lower()
    c = re.sub(
        r"\b(inc|llc|ltd|limited|corp|corporation|co|plc|gmbh|pvt|private|group|"
        r"holdings|technologies|technology|tech|solutions|services|software|"
        r"systems|llp|sa|ag|bv|pty|consulting|studio|labs|digital|media|retail|store)\b",
        " ",
        c,
    )
    c = re.sub(r"[^a-z0-9]+", "", c).strip()
    if not c:
        return None
    return f"{c}.com"


def _domain_resolves(domain: str) -> bool:
    try:
        socket.setdefaulttimeout(3)
        socket.getaddrinfo(domain, None)
        return True
    except Exception:  # noqa: BLE001
        return False


def _provider_lookup(domain: str) -> Optional[str]:
    """Verified email via a configured provider. Hunter.io supported out of the box."""
    key = os.getenv("HUNTER_API_KEY", "")
    if not key:
        return None
    url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={key}&limit=1"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MBPW"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read().decode())
        emails = data.get("data", {}).get("emails", [])
        if emails:
            return emails[0].get("value")
    except Exception:  # noqa: BLE001
        return None
    return None


def enrich(company: str, verify: bool = False) -> dict:
    """Return a best-effort contact email for a company.

    source: 'hunter' (verified via provider API) | 'heuristic'
            (role inbox on a resolved domain) | 'none'
    Set HUNTER_API_KEY (or swap _provider_lookup for Apollo/Clearbit) for
    genuinely verified emails. Without a provider, a role inbox is built on a
    domain that resolves, so outreach can still fire.
    """
    domain = guess_domain(company)
    if not domain:
        return {"email": "", "source": "none", "verified": False}

    provider = _provider_lookup(domain)
    if provider:
        return {"email": provider, "source": "hunter", "verified": True}

    resolved = _domain_resolves(domain) if verify else True
    if resolved:
        return {"email": f"info@{domain}", "source": "heuristic", "verified": bool(verify)}
    return {"email": "", "source": "none", "verified": False}
