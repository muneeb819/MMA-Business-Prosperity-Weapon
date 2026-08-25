import os
import re
import json
import socket
import urllib.request
from typing import Optional


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


def _get_keys():
    """Provider API keys: env vars win, otherwise the DB-backed config (set via Settings UI)."""
    hunter = os.getenv("HUNTER_API_KEY", "")
    apollo = os.getenv("APOLLO_API_KEY", "")
    try:
        from app.models.database import SessionLocal
        from app.models.schema import AppConfig

        db = SessionLocal()
        try:
            for key in ("hunter_api_key", "apollo_api_key"):
                row = db.query(AppConfig).filter(AppConfig.key == key).first()
                if row and row.value:
                    if key == "hunter_api_key" and not hunter:
                        hunter = row.value
                    if key == "apollo_api_key" and not apollo:
                        apollo = row.value
        finally:
            db.close()
    except Exception:  # noqa: BLE001
        pass
    return hunter, apollo


def _apollo_lookup(company: str, api_key: str, title: Optional[str] = None):
    """Verified decision-maker email via Apollo.io people search."""
    url = "https://api.apollo.io/v1/mixed_people/search"
    titles = [
        "CEO", "CTO", "Founder", "Owner", "Co-Founder",
        "Head of Engineering", "VP Engineering", "Engineering Manager",
        "Director of Engineering", "Product Manager", "Operations Manager",
    ]
    body = {"organization_name": company, "person_titles": titles, "page": 1, "per_page": 10}
    if title:
        body["q_keywords"] = title
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode(),
            headers={"X-Api-Key": api_key, "Content-Type": "application/json", "User-Agent": "MBPW"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode())
        for p in data.get("people") or []:
            email = p.get("email")
            if email:
                return {"email": email, "name": p.get("name") or p.get("first_name")}
    except Exception:  # noqa: BLE001
        return None
    return None


def _hunter_lookup(domain: str, api_key: str):
    """Verified company email via Hunter.io domain search."""
    url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={api_key}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MBPW"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read().decode())
        for e in (data.get("data") or {}).get("emails") or []:
            val = e.get("value")
            if val:
                return val
    except Exception:  # noqa: BLE001
        return None
    return None


def enrich(company: str, verify: bool = False, title: Optional[str] = None) -> dict:
    """Return a best-effort contact email for a company.

    Priority when verify=True (explicit enrich action):
      1. Apollo  -> real decision-maker email (source 'apollo', verified)
      2. Hunter  -> verified company email      (source 'hunter', verified)
      3. Heuristic role inbox on a domain that resolves (source 'heuristic')
    When verify=False (fast sync path) only the heuristic is used.
    """
    domain = guess_domain(company)

    if verify:
        hunter_key, apollo_key = _get_keys()
        if apollo_key and company:
            ap = _apollo_lookup(company, apollo_key, title)
            if ap:
                return {"email": ap["email"], "source": "apollo", "verified": True, "name": ap.get("name")}
        if hunter_key and domain:
            h = _hunter_lookup(domain, hunter_key)
            if h:
                return {"email": h, "source": "hunter", "verified": True}

    resolved = _domain_resolves(domain) if verify else True
    if resolved and domain:
        return {"email": f"info@{domain}", "source": "heuristic", "verified": bool(verify)}
    return {"email": "", "source": "none", "verified": False}
