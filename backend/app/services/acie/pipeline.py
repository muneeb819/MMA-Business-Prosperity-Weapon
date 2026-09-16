"""ACIE Pipeline Orchestrator — DISCOVERED→RESOLVED→VERIFIED→SCORED→OUTREACH_READY.

Takes a lead, gathers evidence from all active providers, runs the full
decision chain, and persists a ContactIntel record with the decision object.
"""

from __future__ import annotations

import uuid
from typing import Optional
from datetime import datetime, timedelta

from app.models.schema import Lead, ContactIntel, OutreachState
from app.services.acie import constants
from app.services.acie import identity, verify, risk, score, channel, compliance, learn
from app.services.acie.providers import Evidence
from app.services.acie.providers.registry import active_providers
from app.services import enrichment


def _domain_from_company(company: str) -> Optional[str]:
    if not company:
        return None
    try:
        return enrichment.guess_domain(company)
    except Exception:
        return None


def run_pipeline(db, lead: Lead, force: bool = False) -> dict:
    """Execute the full ACIE pipeline on a lead and return the decision."""
    # Get or create ContactIntel
    intel = db.query(ContactIntel).filter(ContactIntel.lead_id == lead.id).first()
    if not intel:
        intel = ContactIntel(lead_id=lead.id)
        db.add(intel)
        db.commit()

    # Skip if already scored and not forced
    if not force and intel.contact_confidence and intel.contact_confidence >= constants.HIGH_CONFIDENCE:
        return {"status": "cached", "decision": _to_decision(intel)}

    # --- 1. IDENTITY ---
    domain = _domain_from_company(lead.company)
    ident = identity.identity_confidence(
        person_name=lead.client_name, company=lead.company,
        domain=domain, title=lead.title,
    )
    intel.identity_confidence = ident["score"]
    intel.company = lead.company
    intel.domain = domain
    intel.title = lead.title
    intel.name = lead.client_name
    intel.lifecycle = "RESOLVED"

    # --- 2. GATHER EVIDENCE ---
    evidence = _gather_evidence(lead, intel)

    # --- 3. EMPLOYMENT ---
    employment = {"confidence": 0.5 if (lead.company and domain) else 0.2, "current": True}
    intel.employment_confidence = employment["confidence"]

    # --- 4. VERIFICATION ---
    email = lead.email or (evidence[0].value if evidence and evidence[0].kind == "email" else "")
    intel.email = email
    verification = verify.verify_email(email, evidence) if email else {"verdict": "none", "checks": {}}
    intel.verification_status = verification.get("verdict", "unknown")
    intel.last_verified = datetime.utcnow()

    # --- 5. RISK ---
    bounced = intel.bounce_count or 0
    risk_res = risk.assess_risk(
        profile={"email": email, "domain": domain, "verification_status": verification.get("verdict")},
        evidence=evidence, bounced=bounced,
    )
    intel.risk_score = risk_res["score"]

    # --- 6. FRESHNESS ---
    freshness = verify.freshness(intel.last_verified)
    intel.freshness_score = freshness

    # --- 7. SCORING ---
    provider_reliability = learn.effective_reliability(db, [e.provider for e in evidence])
    score_res = score.score_contact(
        identity=ident, employment=employment, verification=verification,
        freshness=freshness, evidence=evidence,
        profile={"email": email, "domain": domain, "checks": verification.get("checks", {}),
                 "verification_status": verification.get("verdict"),
                 "provider_reliability": provider_reliability},
        risk=risk_res,
        provider_reliability=provider_reliability,
    )
    intel.contact_confidence = score_res["score"]

    # --- 8. CHANNEL ---
    ch = channel.select_channel(
        profile={"email": email, "phone": lead.phone, "linkedin": None},
        verification={"verdict": verification.get("verdict"), "phone": verification.get("phone")},
        permitted=["email", "phone", "linkedin"],
    )
    intel.channel = ch.get("channel") or "email"

    # --- 9. COMPLIANCE GATE ---
    gate = compliance.gate_status(db, lead.id)
    intel.supply_status = "ok" if gate["pass"] else gate["blocked"][0] if gate["blocked"] else "suppressed"

    # --- 10. LIFECYCLE ---
    if intel.supply_status == "ok" and score_res["tier"] == "HIGH":
        intel.lifecycle = "OUTREACH_READY"
    elif intel.supply_status != "ok":
        intel.lifecycle = "SUPPRESSED"
    elif score_res["tier"] == "MEDIUM":
        intel.lifecycle = "REVIEW_ALT"
    else:
        intel.lifecycle = "LOW_SUPPRESS"

    # --- 11. PERSIST ---
    intel.profile = _build_profile(ident, employment, verification, risk_res, score_res, ch, gate, evidence)
    intel.updated_at = datetime.utcnow()
    db.commit()

    return {"status": "completed", "decision": _to_decision(intel)}


def _gather_evidence(lead: Lead, intel: ContactIntel) -> list[Evidence]:
    ev: list[Evidence] = []
    company = lead.company
    domain = intel.domain
    title = lead.title
    email_hint = lead.email

    for prov in active_providers(kind="email"):
        try:
            ev.extend(prov.fetch(company=company, domain=domain, title=title, candidate=email_hint))
        except Exception:
            pass

    # Phone evidence if we have a phone
    if lead.phone:
        for prov in active_providers(kind="phone"):
            try:
                ev.extend(prov.fetch(company=company, domain=domain, title=title, phone=lead.phone))
            except Exception:
                pass

    # Add any existing verified email as evidence
    if email_hint:
        ev.append(Evidence(provider="lead", kind="email", value=email_hint,
                           verified=True, confidence=0.8, source_name=domain))

    return ev


def _build_profile(ident, employment, verification, risk_res, score_res, ch, gate, evidence) -> dict:
    return {
        "identity": ident,
        "employment": employment,
        "verification": verification,
        "risk": risk_res,
        "score": {k: v for k, v in score_res.items() if k != "components"},
        "components": score_res.get("components", {}),
        "channel": ch,
        "gate": gate,
        "evidence": [{"provider": e.provider, "kind": e.kind, "value": e.value,
                      "verified": e.verified, "confidence": e.confidence} for e in evidence],
    }


def _to_decision(intel: ContactIntel) -> dict:
    return {
        "lead_id": intel.lead_id,
        "person_id": intel.person_id,
        "company": intel.company,
        "domain": intel.domain,
        "email": intel.email,
        "phone": intel.phone,
        "channel": intel.channel,
        "confidence": intel.contact_confidence,
        "identity_confidence": intel.identity_confidence,
        "employment_confidence": intel.employment_confidence,
        "email_confidence": intel.email_confidence,
        "verification_status": intel.verification_status,
        "supply_status": intel.supply_status,
        "lifecycle": intel.lifecycle,
        "tier": "HIGH" if intel.contact_confidence >= constants.HIGH_CONFIDENCE else
                ("MEDIUM" if intel.contact_confidence >= constants.REVIEW_THRESHOLD else "LOW"),
        "gate_pass": intel.supply_status == "ok",
        "next_verification": intel.next_verification,
        "profile": intel.profile,
    }