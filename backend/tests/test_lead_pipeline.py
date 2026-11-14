"""Health check + lead completeness guarantees."""

from app.services.sources.base import NormalizedJob
from app.services.sync import job_to_lead


def test_health_reports_real_database_state(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["database"] == "connected"
    # Empty test database → the count must be the real zero, not fabricated.
    assert body["leads"] == 0


def test_job_to_lead_keeps_every_field_plus_source_url():
    job = NormalizedJob(
        title="Senior React Developer",
        company="Acme Labs",
        description="Build dashboards.",
        url="https://example.com/jobs/123",
        location="Remote",
        country="United States",
        salary_min=50000,
        salary_max=80000,
        technologies=["react", "typescript"],
        source_name="weworkremotely",
        source_url="https://weworkremotely.com",
        tags=["react"],
    )
    lead = job_to_lead(job, verify=False)

    assert lead["title"] == "Senior React Developer"
    assert lead["company"] == "Acme Labs"
    assert lead["client_name"] == "Acme Labs"
    assert lead["description"] == "Build dashboards."
    assert lead["url"] == "https://example.com/jobs/123"
    assert lead["budget_min"] == 50000
    assert lead["budget_max"] == 80000
    assert lead["country"] == "United States"
    assert lead["technologies"] == ["react", "typescript"]
    assert lead["platform"] == "weworkremotely"
    # Source name is always tagged so every lead traces back to its origin.
    assert "weworkremotely" in lead["tags"]
    assert "Sourced from weworkremotely" in lead["client_history"]
    assert lead["status"] == "new"
