import os
import re
import json
import asyncio
from typing import Optional

import httpx

from app.services.ai_service import AIService

try:
    import dns.resolver
    _HAS_DNS = True
except Exception:
    _HAS_DNS = False

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Reserved / placeholder / disposable domains we must never email.
RESERVED_DOMAINS = {
    "example.com", "example.net", "example.org", "test.com", "localhost",
    "invalid", "domain.com", "email.com", "yourdomain.com", "example",
    "test", "localhost.localdomain", "mailinator.com", "10minutemail.com",
    "guerrillamail.com", "tempmail.com", "trashmail.com",
}

# Local-parts that are almost always placeholders, never real mailboxes.
RESERVED_LOCAL = {"name", "test", "user", "email", "yourname", "anonymous", "sample"}


def is_email_format_valid(email: str) -> bool:
    return bool(email) and bool(EMAIL_RE.match(str(email).strip()))


def _domain_mx_doh(domain: str):
    """DNS-over-HTTPS MX lookup (works on Vercel, port 443). Returns bool or None if unknown."""
    try:
        r = httpx.get(
            "https://cloudflare-dns.com/dns-query",
            params={"name": domain, "type": "MX"},
            headers={"Accept": "application/dns-json"},
            timeout=6,
        )
        if r.status_code == 200:
            data = r.json()
            answers = data.get("Answer") or []
            return any(a.get("type") == 15 for a in answers)
    except Exception:
        pass
    return None


def _domain_has_mx(email: str):
    """Return True if domain has MX, False if confidently none, None if DNS unavailable."""
    domain = str(email).split("@")[-1].strip().lower()
    mx = _domain_mx_doh(domain)
    if mx is not None:
        return mx
    if _HAS_DNS:
        try:
            answers = dns.resolver.resolve(domain, "MX", lifetime=6)
            return len(answers) > 0
        except Exception:
            return None
    return None


def is_email_deliverable(email: str) -> bool:
    """Format-valid AND not reserved/placeholder AND domain has MX (when checkable)."""
    if not is_email_format_valid(email):
        return False
    email = str(email).strip().lower()
    local = email.split("@")[0]
    domain = email.split("@")[-1]
    if domain in RESERVED_DOMAINS:
        return False
    if local in RESERVED_LOCAL:
        return False
    mx = _domain_has_mx(email)
    if mx is None:
        return True
    return mx


def lead_email_source(lead) -> Optional[str]:
    tags = lead.tags or [] if not isinstance(lead, dict) else lead.get("tags") or []
    for t in tags:
        if isinstance(t, str) and t.startswith("enriched:"):
            return t.split("enriched:")[1]
    return None


def is_lead_email_verified(lead) -> bool:
    return lead_email_source(lead) in ("hunter", "apollo", "smtp", "web")


def is_sendable_email(email: str, lead=None) -> bool:
    """Deliverable AND not a heuristic guess (we only trust verified/discovery sources)."""
    if not is_email_deliverable(email):
        return False
    if lead is not None:
        if lead_email_source(lead) == "heuristic":
            return False
    return True

# Progressive, multi-touch cadence. Each step targets a different goal so outreach
# feels human and earned rather than a single blast.
CADENCE = [
    {"day": 0, "channel": "email", "label": "First touch — intro & value",
     "goal": "Introduce MBPW and reference the specific project by name."},
    {"day": 3, "channel": "email", "label": "Value add — concrete insight",
     "goal": "Share a relevant approach/risk note for their challenge."},
    {"day": 7, "channel": "linkedin", "label": "Social touch — connect",
     "goal": "Connect / engage on LinkedIn to stay visible."},
    {"day": 14, "channel": "email", "label": "Final nudge — proof point",
     "goal": "Share a result and a low-friction next step, then step back."},
]


def _sender_name() -> str:
    import os
    return os.getenv("OUTREACH_SENDER_NAME", "Muhammad Muneeb Akram")


def _company(lead: dict) -> str:
    return lead.get("company") or lead.get("client_name") or "your company"


def build_message(lead: dict, step_index: int = 0, custom_note: str = "") -> dict:
    """Build an authentic, personalized outreach message for a cadence step.

    Authenticity rules: references the real company + project + tech stack, leads with
    value (not a pitch), uses a single clear CTA, and stays human/non-spammy.
    """
    steps = CADENCE
    step_index = max(0, min(step_index, len(steps) - 1))
    step = steps[step_index]

    company = _company(lead)
    client = lead.get("client_name") or ""
    title = lead.get("title") or "your project"
    techs = lead.get("technologies") or []
    tech_line = ", ".join(techs) if techs else "modern technologies"
    country = lead.get("country") or "your region"
    budget = lead.get("budget_max")
    budget_line = f" up to ${budget:,.0f}" if budget else ""
    # When client_name is just the company (org, not a person), greet the team.
    if client and client != company:
        first_name = client.split()[0]
    elif company and company != "your company":
        first_name = f"{company} team"
    else:
        first_name = "there"
    sender = _sender_name()

    if step_index == 0:
        subject = f"{title} — a few ideas for {company}"
        body = (
            f"Hi {first_name},\n\n"
            f"I came across the {title} opportunity at {company} and wanted to reach out directly. "
            f"We help teams like yours ship {tech_line} work without the usual overhead, and it looked "
            f"like there could be a fit given what you're building in {country}.\n\n"
            f"We're the team behind the MMA Business Prosperity Weapon. We've delivered similar "
            f"{tech_line} engagements{budget_line} and consistently hit timelines because we scope "
            f"tightly and communicate clearly.\n\n"
            f"If it's useful, I can put together a short, no-obligation breakdown of how we'd approach "
            f"{title}. Worth a quick look?"
        )
    elif step_index == 1:
        subject = f"Quick thought on {title} ({company})"
        body = (
            f"Hi {first_name},\n\n"
            f"Following up with something concrete: on a {title} build, the biggest risk is usually "
            f"scope creep in the first 2–3 weeks. We de-risk that with a short discovery sprint and a "
            f"fixed milestone plan before any heavy development — so {company} knows the number and the "
            f"date up front.\n\n"
            f"Happy to walk through exactly how we'd structure the {tech_line} work if that's helpful."
        )
    elif step_index == 2:
        subject = f"Connecting on LinkedIn — {company}"
        body = (
            f"Hi {first_name}, I've sent a connection request on LinkedIn so we can keep {title} on the "
            f"radar. No pressure — if the timing's right later, I'm easy to reach. In the meantime, "
            f"happy to share a relevant case study from a similar {tech_line} engagement."
        )
    else:
        subject = f"Last note on {title} — a proof point for {company}"
        body = (
            f"Hi {first_name},\n\n"
            f"Last note so I'm not crowding your inbox. A recent client came to us with a very similar "
            f"{title} challenge; we cut their delivery risk by roughly 40% using a phased plan and "
            f"shipped ahead of schedule. If {company} ever revisits this, I'd love 15 minutes to show "
            f"you the approach.\n\n"
            f"Either way, thanks for the time — and the door's open whenever it makes sense."
        )

    if custom_note:
        body += f"\n\n{custom_note}"

    body += f"\n\nBest,\n{sender}\nMMA Business Prosperity Weapon"

    html = "<p>" + body.replace("\n", "<br/>") + "</p>"

    return {
        "step_index": step_index,
        "step_label": step["label"],
        "channel": step["channel"],
        "day": step["day"],
        "subject": subject,
        "body_text": body,
        "body_html": html,
        "recipient_email": lead.get("email") or "",
        "company": company,
        "client_name": client,
    }


def _lead_to_dict(lead) -> dict:
    """Convert a Lead ORM object (or dict) into the flat dict used by message builders."""
    if isinstance(lead, dict):
        return lead
    tags = lead.tags or []
    src = next((t.split("enriched:")[1] for t in tags if t.startswith("enriched:")), None)
    return {
        "id": lead.id,
        "title": lead.title,
        "description": getattr(lead, "description", None) or "",
        "client_name": lead.client_name,
        "company": lead.company,
        "email": lead.email,
        "phone": getattr(lead, "phone", None),
        "country": lead.country,
        "technologies": lead.technologies or [],
        "skills": getattr(lead, "skills", None) or [],
        "budget_min": getattr(lead, "budget_min", None),
        "budget_max": lead.budget_max,
        "deadline": getattr(lead, "deadline", None),
        "job_type": getattr(lead, "job_type", None),
        "project_size": getattr(lead, "project_size", None),
        "platform": getattr(lead, "platform", None),
        "status": lead.status,
        "email_source": src,
        "email_verified": src in ("hunter", "apollo", "smtp", "web"),
    }


def _extract_json(raw: str) -> dict:
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    try:
        return json.loads(cleaned)
    except Exception:
        # Fallback: grab the first {...} block.
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            try:
                return json.loads(cleaned[start : end + 1])
            except Exception:
                return {}
    return {}


def _build_with_ai(lead: dict, step_index: int, custom_note: str) -> dict:
    step_index = max(0, min(step_index, len(CADENCE) - 1))
    step = CADENCE[step_index]
    svc = AIService()
    if not svc._is_available():
        return build_message(lead, step_index, custom_note)

    ctx = {
        k: lead.get(k)
        for k in (
            "title", "company", "client_name", "description", "technologies",
            "skills", "budget_min", "budget_max", "country", "job_type",
            "deadline", "project_size", "platform",
        )
    }
    system = (
        "You are a senior B2B outreach copywriter for an IT services firm "
        "(MMA Business Prosperity Weapon). Write authentic, human, non-spammy outreach. "
        "Lead with value, never with a hard pitch. Use a single clear call to action. "
        "Respond ONLY with a JSON object: {\"subject\": string, \"body_text\": string}."
    )
    user = (
        f"Lead context (JSON): {json.dumps(ctx, default=str)}\n"
        f"Cadence step: Day {step['day']} via {step['channel']}.\n"
        f"Goal: {step['goal']}\n\n"
        f"Write the '{step['label']}' message. Offer what this lead is specifically seeking, "
        f"based on their description, technologies and skills. Sign off as the sender. "
        f"Return JSON only."
    )
    try:
        raw = asyncio.run(svc._chat(system, user, temperature=0.7))
    except Exception:
        return build_message(lead, step_index, custom_note)
    data = _extract_json(raw)
    subject = (data.get("subject") or "").strip()
    body = (data.get("body_text") or "").strip()
    if not subject or not body:
        return build_message(lead, step_index, custom_note)
    if custom_note:
        body += f"\n\n{custom_note}"
    sender = os.getenv("OUTREACH_SENDER_NAME", "Muhammad Muneeb Akram")
    body += f"\n\nBest,\n{sender}\nMMA Business Prosperity Weapon"
    html = "<p>" + body.replace("\n", "<br/>") + "</p>"
    return {
        "step_index": step_index,
        "step_label": step["label"],
        "channel": step["channel"],
        "day": step["day"],
        "subject": subject,
        "body_text": body,
        "body_html": html,
        "recipient_email": lead.get("email") or "",
        "company": lead.get("company"),
        "client_name": lead.get("client_name"),
    }


def build_dynamic_message(lead, step_index: int = 0, custom_note: str = "") -> dict:
    """Build a personalized outreach message, using AI when configured, else the template.

    Always references what the lead is seeking (description/tech/skills/budget) so the
    offer is dynamic per lead.
    """
    lead_dict = _lead_to_dict(lead)
    if os.getenv("OPENAI_API_KEY"):
        try:
            return _build_with_ai(lead_dict, step_index, custom_note)
        except Exception:
            pass
    return build_message(lead_dict, step_index, custom_note)
