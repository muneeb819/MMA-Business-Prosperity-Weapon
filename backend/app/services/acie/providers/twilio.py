"""Phone provider: Twilio Lookup (carrier/line-type verification).

Auto-activates when TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN (or settings) are
present. Without credentials it returns no phone evidence — the channel
intelligence then simply does not offer a phone channel (it never hallucinates
a phone number).

The outreach engine treats phone as a permitted channel only when a real phone
has been verified here or tagged in the CRM.
"""

from __future__ import annotations

import os
import json
from typing import List, Optional
from . import Evidence, ProviderBase


def _get_creds() -> dict:
    out = {
        "sid": os.getenv("TWILIO_ACCOUNT_SID", ""),
        "token": os.getenv("TWILIO_AUTH_TOKEN", ""),
    }
    try:
        from app.models.database import SessionLocal
        from app.models.schema import AppConfig
        db = SessionLocal()
        try:
            for k in ("twilio_account_sid", "twilio_auth_token"):
                row = db.query(AppConfig).filter(AppConfig.key == k).first()
                if row and row.value:
                    lk = "sid" if k == "twilio_account_sid" else "token"
                    if not out[lk]:
                        out[lk] = row.value
        finally:
            db.close()
    except Exception:
        pass
    return out


class TwilioLookupProvider(ProviderBase):
    name = "twilio_lookup"
    kind = "phone"
    requires_key = True

    def fetch(self, company: str, domain: Optional[str] = None,
              title: Optional[str] = None, phone: Optional[str] = None,
              **kw) -> List[Evidence]:
        creds = _get_creds()
        if not (creds["sid"] and creds["token"]) or not phone:
            return []
        try:
            import base64
            auth = base64.b64encode(f"{creds['sid']}:{creds['token']}".encode()).decode()
            req = urllib.request.Request(
                f"https://lookups.twilio.com/v1/PhoneNumbers/{phone}?Type=carrier",
                headers={"Authorization": f"Basic {auth}"},
                method="GET",
            )
            import urllib.request
            with urllib.request.urlopen(req, timeout=10) as r:
                data = json.loads(r.read().decode())
            carrier = ((data.get("carrier") or {}).get("name")) or "unknown"
            line_type = ((data.get("carrier") or {}).get("type")) or "unknown"
            return [Evidence(
                provider=self.name, kind="phone", value=phone,
                verified=True, confidence=0.9,
                extra={"carrier": carrier, "line_type": line_type, "country_code": data.get("country_code")},
            )]
        except Exception:
            return []
