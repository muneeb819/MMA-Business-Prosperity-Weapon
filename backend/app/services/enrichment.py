import os
import re
import json
import socket
import smtplib
import random
import string
import urllib.request
from typing import Optional

# Cache: if Apollo returns a plan-limit (403), stop hammering it for this process.
_apollo_blocked = False


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
    except urllib.error.HTTPError as he:
        global _apollo_blocked
        msg = he.read().decode("utf-8", "ignore")
        ec = None
        try:
            ec = json.loads(msg).get("error_code")
        except Exception:
            pass
        if he.code == 403 or ec == "API_INACCESSIBLE":
            _apollo_blocked = True
        return None
    except Exception:  # noqa: BLE001
        return None
    return None


_ROLE_PREFIXES = ["info", "contact", "sales", "hello", "admin", "office", "support", "careers"]

_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
_MAILTO_RE = re.compile(r"mailto:([^?\"'<>#\s]+)", re.I)
_GENERIC = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
    "aol.com", "proton.me", "protonmail.com", "gmx.com", "mail.com",
}


def _scrape_email(company: str, timeout: int = 6):
    """Find a real, published email on the company's own website (keyless, free).

    Many businesses publish contact/sales emails in `mailto:` links or page
    text. We fetch the homepage / contact pages over HTTPS (allowed on
    serverless) and return the first company-domain, non-generic address.
    """
    domain = guess_domain(company)
    if not domain or not _domain_resolves(domain):
        return None
    for path in ("", "/contact", "/contact-us", "/about"):
        url = f"https://{domain}{path}"
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; MBPW/1.0)"},
                method="GET",
            )
            with urllib.request.urlopen(req, timeout=timeout) as r:
                html = r.read().decode("utf-8", "ignore")
            found = [m.strip().lower() for m in _MAILTO_RE.findall(html)]
            found += [e.strip().lower() for e in _EMAIL_RE.findall(html)]
            if found:
                cands = [e for e in found if e.endswith(domain) and e.split("@")[1] not in _GENERIC]
                if not cands:
                    cands = [e for e in found if e.split("@")[1] not in _GENERIC]
                if not cands:
                    cands = found
                for e in cands:
                    dom = e.split("@", 1)[1]
                    if "." in dom:
                        return e
        except Exception:  # noqa: BLE001
            continue
    return None


def _mx_hosts(domain: str):
    hosts = []
    try:
        import dns.resolver

        try:
            answers = dns.resolver.resolve(domain, "MX")
            hosts = [str(r.exchange).rstrip(".") for r in answers]
        except Exception:
            hosts = []
    except Exception:
        hosts = []
    if not hosts:
        try:
            socket.getaddrinfo(domain, None)
            hosts = [domain]
        except Exception:
            hosts = []
    return hosts


def _smtp_verify(domain: str, timeout: int = 5):
    """Verify common role inboxes via SMTP RCPT TO (keyless, free).

    Returns the first verified role email, or None if none confirmed / SMTP
    unavailable (e.g. outbound port 25 blocked in the runtime).
    """
    hosts = _mx_hosts(domain)
    if not hosts:
        return None
    tried = 0
    for host in hosts[:2]:
        for port in (25, 587):
            try:
                with smtplib.SMTP(host, port, timeout=timeout) as s:
                    s.ehlo()
                    try:
                        s.starttls()
                        s.ehlo()
                    except Exception:
                        pass
                    s.mail("verify@mbpw.com")
                    for prefix in _ROLE_PREFIXES:
                        if tried >= 5:
                            break
                        cand = f"{prefix}@{domain}"
                        try:
                            code, _ = s.rcpt(cand)
                        except Exception:
                            code = 0
                        tried += 1
                        if code == 250:
                            return cand
                        if code in (550, 551, 552, 553, 554):
                            continue
                    return None
            except Exception:  # noqa: BLE001
                continue
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


def provider_enabled() -> bool:
    """True if any verified-email provider key is configured (env or DB)."""
    h, a = _get_keys()
    return bool(h or a)


def enrich(company: str, verify: bool = False, title: Optional[str] = None, smtp: bool = True, web: bool = True) -> dict:
    """Return a best-effort contact email for a company.

    Priority when verify=True (explicit enrich action):
      1. Apollo  -> real decision-maker email (source 'apollo', verified)
      2. Hunter  -> verified company email      (source 'hunter', verified)
      3. SMTP-verified role inbox (info@/contact@/sales@…) — keyless, free
         (source 'smtp', verified)  [only when smtp=True]
      4. Heuristic role inbox on a domain that resolves (source 'heuristic')
    When verify=False (fast sync path) only the heuristic is used.
    """
    global _apollo_blocked
    domain = guess_domain(company)

    if verify:
        hunter_key, apollo_key = _get_keys()
        if apollo_key and company and not _apollo_blocked:
            ap = _apollo_lookup(company, apollo_key, title)
            if ap:
                return {"email": ap["email"], "source": "apollo", "verified": True, "name": ap.get("name")}
        if hunter_key and domain:
            h = _hunter_lookup(domain, hunter_key)
            if h:
                return {"email": h, "source": "hunter", "verified": True}
        if web and domain:
            w = _scrape_email(company)
            if w:
                wdom = w.split("@", 1)[1]
                if _mx_hosts(wdom):
                    return {"email": w, "source": "web", "verified": True}
                return {"email": w, "source": "web", "verified": False}
        if smtp and domain and _domain_resolves(domain):
            v = _smtp_verify(domain)
            if v:
                return {"email": v, "source": "smtp", "verified": True}

    resolved = _domain_resolves(domain) if verify else True
    if resolved and domain:
        return {"email": f"info@{domain}", "source": "heuristic", "verified": False}
    return {"email": "", "source": "none", "verified": False}
