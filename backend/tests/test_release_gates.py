"""Regression tests for the release-critical security and pipeline gates."""

import asyncio
import json
from datetime import datetime

from app.models.schema import ContactIntel, Lead, OutreachFeedback
from app.routers.auth import UserModel, pwd_context
from app.services.acie import compliance
from app.services.ai_service import AIService
from app.services.sources import ALL_SOURCES
from app.services.sources.base import NormalizedJob
from app.services.sync import sync_source


def test_business_api_requires_a_valid_jwt(client):
    unauthenticated = client.get("/api/leads/")
    assert unauthenticated.status_code == 401

    registered = client.post(
        "/api/auth/register",
        json={"email": "release-test@example.com", "name": "Release Test", "password": "correct-horse-123"},
    )
    assert registered.status_code == 200
    token = registered.json()["access_token"]

    authenticated = client.get("/api/leads/", headers={"Authorization": f"Bearer {token}"})
    assert authenticated.status_code == 200
    assert authenticated.json() == []


def test_jwt_rejects_inactive_users(client, db):
    user = UserModel(
        id="inactive-user",
        email="inactive@example.com",
        name="Inactive",
        role="user",
        hashed_password=pwd_context.hash("not-used-password"),
        is_active=False,
    )
    db.add(user)
    db.commit()
    from app.routers.auth import create_access_token

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    response = client.get("/api/leads/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


class _DuplicateFeed:
    name = "mbpw-test-feed"
    display_name = "Test Feed"
    source_type = "api"
    url = "https://example.test/jobs"
    requires_key = False

    async def fetch(self, limit=50, **kwargs):
        listing = NormalizedJob(
            title="Backend Engineer",
            company="Example Labs",
            description="Build a reliable service.",
            url="https://example.test/jobs/42",
            location="Remote",
            salary_min=90_000,
            salary_max=120_000,
            technologies=["Python"],
            skills=["FastAPI"],
            source_name=self.name,
            tags=["engineering"],
            apply_email="jobs@example.test",
        )
        return [listing, listing]


def test_lead_sync_deduplicates_within_and_across_runs(db, monkeypatch):
    source_name = _DuplicateFeed.name
    monkeypatch.setitem(ALL_SOURCES, source_name, _DuplicateFeed())

    first = asyncio.run(sync_source(source_name, db, limit=10))
    assert first == {"source": source_name, "fetched": 2, "new": 1, "updated": 0}
    assert db.query(Lead).count() == 1

    second = asyncio.run(sync_source(source_name, db, limit=10))
    assert second == {"source": source_name, "fetched": 2, "new": 0, "updated": 1}
    assert db.query(Lead).count() == 1


def test_proposal_generation_uses_safe_fallback_without_openai(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    service = AIService()
    assert service.client is None

    proposal = asyncio.run(
        service.generate_proposal(
            {
                "title": "Inventory API modernization",
                "description": "Replace a legacy inventory service.",
                "budget_min": 20_000,
                "budget_max": 40_000,
                "client_name": "Sam Client",
                "company": "Example Labs",
                "technologies": ["Python", "PostgreSQL"],
                "country": "United States",
            }
        )
    )

    assert proposal["title"] == "Proposal for Inventory API modernization"
    assert "Sam Client" in proposal["cover_letter"]
    assert proposal["timeline"]
    assert proposal["cost_estimate"] == "$20,000 - $40,000"


def test_compliance_gate_blocks_do_not_contact_companies(db, monkeypatch):
    settings = {
        compliance.GATE_ENABLED: "on",
        compliance.DNC_COMPANIES: json.dumps([{"company": "Blocked Labs", "reason": "opted out"}]),
    }
    monkeypatch.setattr(compliance, "_cfg", lambda key, default=None: settings.get(key, default))
    db.add(ContactIntel(lead_id="lead-dnc", company="Blocked Labs", supply_status="ok"))
    db.commit()

    decision = compliance.can_send(db, "lead-dnc")
    assert decision["allow"] is False
    assert any(reason.startswith("do_not_contact:") for reason in decision["reasons"])


def test_compliance_gate_enforces_frequency_cap(db, monkeypatch):
    settings = {
        compliance.GATE_ENABLED: "on",
        compliance.DNC_COMPANIES: "[]",
        compliance.FREQ_MAX: "1",
    }
    monkeypatch.setattr(compliance, "_cfg", lambda key, default=None: settings.get(key, default))
    db.add(ContactIntel(lead_id="lead-cap", company="Example Labs", supply_status="ok"))
    db.add(
        OutreachFeedback(
            id="feedback-sent",
            lead_id="lead-cap",
            outcome="sent",
            created_at=datetime.utcnow(),
        )
    )
    db.commit()

    decision = compliance.can_send(db, "lead-cap")
    assert decision["allow"] is False
    assert "frequency_cap" in decision["reasons"]


def test_compliance_gate_enforces_reply_cooldown(db, monkeypatch):
    settings = {
        compliance.GATE_ENABLED: "on",
        compliance.DNC_COMPANIES: "[]",
        compliance.REPLY_COOLOFF: "90",
    }
    monkeypatch.setattr(compliance, "_cfg", lambda key, default=None: settings.get(key, default))
    db.add(ContactIntel(lead_id="lead-reply", company="Example Labs", supply_status="ok"))
    db.add(
        OutreachFeedback(
            id="feedback-reply",
            lead_id="lead-reply",
            outcome="reply_positive",
            created_at=datetime.utcnow(),
        )
    )
    db.commit()

    decision = compliance.can_send(db, "lead-reply")
    assert decision["allow"] is False
    assert "reply_cooldown" in decision["reasons"]


def test_cron_requires_secret_and_accepts_authorized_request(client, monkeypatch):
    from app.routers import outreach

    monkeypatch.setenv("CRON_SECRET", "unit-test-cron-secret")
    monkeypatch.setattr(
        outreach.outreach_automation,
        "process_due_outreach",
        lambda db: {"processed": 0, "sent": 0},
    )

    rejected = client.get("/api/outreach/cron")
    assert rejected.status_code == 401

    accepted = client.get(
        "/api/outreach/cron",
        headers={"Authorization": "Bearer unit-test-cron-secret"},
    )
    assert accepted.status_code == 200
    assert accepted.json() == {"ok": True, "summary": {"processed": 0, "sent": 0}}


def test_production_database_requires_supported_durable_database():
    from app.models.database import _resolve_database_url

    try:
        _resolve_database_url({"ENVIRONMENT": "production"})
    except RuntimeError as exc:
        assert "DATABASE_URL" in str(exc)
    else:
        raise AssertionError("Production accepted a missing database URL")

    try:
        _resolve_database_url({"ENVIRONMENT": "production", "DATABASE_URL": "sqlite:///./mbpw.db"})
    except RuntimeError as exc:
        assert "Microsoft SQL Server" in str(exc)
    else:
        raise AssertionError("Production accepted SQLite")

    assert _resolve_database_url({"ENVIRONMENT": "production", "DATABASE_URL": "postgresql://db/app"}) == "postgresql://db/app"
    secure_mssql_url = "mssql+pymssql://app:secret@db/app?charset=utf8&encryption=require"
    assert _resolve_database_url({"ENVIRONMENT": "production", "DATABASE_URL": secure_mssql_url}) == secure_mssql_url
    assert _resolve_database_url({"ENVIRONMENT": "production", "DATABASE_URL": "mssql://app:secret@db/app?encryption=require"}) == "mssql+pymssql://app:secret@db/app?encryption=require"

    try:
        _resolve_database_url({"ENVIRONMENT": "production", "DATABASE_URL": "postgresql+asyncpg://db/app"})
    except RuntimeError as exc:
        assert "synchronous" in str(exc)
    else:
        raise AssertionError("Production accepted an async PostgreSQL driver for a sync engine")


def test_production_sqlserver_url_requires_credentials_and_tls():
    from app.models.database import _resolve_database_url

    for url, expected_error in (
        ("mssql+pymssql://db/app?encryption=require", "SQL login"),
        ("mssql+pymssql://app:secret@db/app", "encryption=require"),
        ("mssql+pymssql://app:secret@db/app?encryption=off", "encryption=require"),
    ):
        try:
            _resolve_database_url({"ENVIRONMENT": "production", "DATABASE_URL": url})
        except RuntimeError as exc:
            assert expected_error in str(exc)
        else:
            raise AssertionError(f"Production accepted insecure SQL Server URL: {url}")


def test_sqlserver_environment_builds_an_escaped_secure_url():
    from sqlalchemy.engine import make_url
    from app.models.database import _resolve_database_url

    url = _resolve_database_url({
        "ENVIRONMENT": "production",
        "SQLSERVER_HOST": "sql.example.com",
        "SQLSERVER_USER": "app user",
        "SQLSERVER_PASSWORD": "safe@secret#1",
        "SQLSERVER_DATABASE": "MMA_Business_Prosperity_Weapon",
    })
    parsed = make_url(url)
    assert parsed.drivername == "mssql+pymssql"
    assert parsed.username == "app user"
    assert parsed.password == "safe@secret#1"
    assert parsed.host == "sql.example.com"
    assert parsed.database == "MMA_Business_Prosperity_Weapon"
    assert parsed.query["encryption"] == "require"


def test_partial_sqlserver_production_config_fails_closed():
    from app.models.database import _resolve_database_url

    try:
        _resolve_database_url({"ENVIRONMENT": "production", "SQLSERVER_HOST": "sql.example.com"})
    except RuntimeError as exc:
        assert "SQLSERVER_USER" in str(exc)
        assert "SQLSERVER_PASSWORD" in str(exc)
    else:
        raise AssertionError("Production accepted partial SQL Server configuration")

    try:
        _resolve_database_url({
            "ENVIRONMENT": "production",
            "SQLSERVER_HOST": "sql.example.com",
            "SQLSERVER_USER": "app",
            "SQLSERVER_PASSWORD": "secret",
            "SQLSERVER_ENCRYPTION": "off",
        })
    except RuntimeError as exc:
        assert "SQLSERVER_ENCRYPTION=require" in str(exc)
    else:
        raise AssertionError("Production accepted an unencrypted SQL Server connection")
