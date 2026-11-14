"""New platform connectors: Indeed, Upwork, ROZEE, HN Discussions, Reddit, Pinterest."""

import re

from app.services.sources import get_all_sources, get_source
from app.services.sources.indeed import parse_indeed_page
from app.services.sources.upwork import parse_upwork_page
from app.services.sources.rozee import parse_rozee_page
from app.services.sources._htmlscan import scan_job_cards, strip_tags


INDEED_HTML = """
<li>
  <h2 class="jobTitle"><a href="/rc/clk?jk=720753a51257041e&amp;from=serp&vjs=3">Marketing Assistant</a></h2>
  <div class="companyName">BELAY</div>
  <span>Remote</span>
  <div class="salary-snippet-container">$28 - $33 an hour</div>
  <div class="job-snippet">We are seeking creative, high-leverage marketing operators.</div>
</li>
<li>
  <h2 class="jobTitle"><a href="https://www.indeed.com/viewjob?jk=19dc5a11eba13ec3">Marketing Production Assistant</a></h2>
  <div class="companyName">JJS &amp; Associates</div>
  <span>Remote</span>
  <div>$52,000 - $64,000 a year</div>
  <div>QA content before it publishes.</div>
</li>
"""

UPWORK_HTML = """
<h2><a href="https://www.upwork.com/jobs/Laravel-Developer-Needed_~022115140979947015773/">Laravel Developer Needed</a></h2>
<div><strong>Hourly: $15.00 - $35.00</strong></div>
<div><strong>Intermediate</strong></div>
<div>We are looking for a Laravel developer to help build and maintain web applications.</div>
<h2><a href="https://www.upwork.com/jobs/WordPress-Developer-Needed_~022103726783784946229/">WordPress Developer Needed</a></h2>
<div><strong>Fixed price</strong></div>
<div><strong>Est. budget: $2,500.00</strong></div>
<div>We are looking for an experienced WordPress developer.</div>
"""

ROZEE_HTML = """
<h3><a href="https://www.rozee.pk/marketing-project-manager-3-5-years-lahore-jobs-1949895?utm_source=jobSearch&utm_medium=website&utm_content=jobSearch_1949895">Marketing Project Manager (3-5 years)</a></h3>
<div>ScaleMax Digital, Lahore, Pakistan</div>
<div>ScaleMax Digital is seeking a skilled and proactive Marketing Project Manager.</div>
<h3><a href="https://www.rozee.pk/performance-marketing-executive-lahore-jobs-1949936?utm_source=jobSearch">Performance Marketing Executive</a></h3>
<div>The Clothing Crew, Lahore, Pakistan</div>
<div>We are a rapidly growing fashion e-commerce brand seeking a Performance Marketing Executive.</div>
"""


def test_strip_tags_and_scan():
    assert strip_tags("<b>Hello</b> &amp; world") == "Hello & world"
    cards = scan_job_cards(
        UPWORK_HTML,
        re.compile(r"^https?://(?:www\.)?upwork\.com/jobs/[^?\s\"']*_~\d+"),
        limit=10,
    )
    assert len(cards) == 2
    assert cards[0]["title"] == "Laravel Developer Needed"
    assert "_~022115140979947015773" in cards[0]["url"]
    assert "Hourly: $15.00 - $35.00" in cards[0]["segment"]


def test_parse_indeed_page_extracts_full_leads():
    jobs = parse_indeed_page(INDEED_HTML)
    assert len(jobs) == 2
    first, second = jobs
    assert first.title == "Marketing Assistant"
    assert first.company == "BELAY"
    assert first.url == "https://www.indeed.com/viewjob?jk=720753a51257041e"
    # $28–$33/hour annualised honestly (2080 h)
    assert first.salary_min == 28 * 2080
    assert first.salary_max == 33 * 2080
    assert "marketing operators" in first.description
    assert second.company == "JJS & Associates"
    assert second.salary_min == 52000 and second.salary_max == 64000
    assert second.source_name == "indeed"


def test_parse_upwork_page_rates_and_urls():
    jobs = parse_upwork_page(UPWORK_HTML)
    assert len(jobs) == 2
    hourly, fixed = jobs
    assert hourly.title == "Laravel Developer Needed"
    assert hourly.salary_min == 15 and hourly.salary_max == 35
    assert hourly.url.endswith("/")
    assert "intermediate" in hourly.tags
    assert fixed.salary_min == 2500 and fixed.salary_max == 2500
    assert "WordPress Developer Needed" in fixed.title


def test_parse_rozee_page_strips_tracking_and_extracts_company():
    jobs = parse_rozee_page(ROZEE_HTML)
    assert len(jobs) == 2
    first, second = jobs
    assert first.url == "https://www.rozee.pk/marketing-project-manager-3-5-years-lahore-jobs-1949895"
    assert "utm_" not in first.url
    assert first.company == "ScaleMax Digital"
    assert first.country == "Pakistan"
    assert second.company == "The Clothing Crew"
    assert second.salary_min == 0 and second.salary_max == 0  # no fabrication of PKR→USD


def test_all_new_sources_registered():
    sources = get_all_sources()
    for name in ("indeed", "upwork", "rozee", "hn_demand", "reddit", "pinterest"):
        assert name in sources, f"missing source: {name}"
    # Key-gated sources are honestly flagged until the owner provides credentials.
    assert sources["reddit"].requires_key is True
    assert sources["pinterest"].requires_key is True
    # Free/keyless connectors:
    for name in ("indeed", "upwork", "rozee", "hn_demand"):
        assert sources[name].requires_key is False


def test_upwork_is_no_longer_the_dead_rss_feed():
    up = get_source("upwork")
    assert up is not None
    assert up.source_type == "scraper"  # the old RSS feed is a 404


def test_sync_all_skips_key_gated_sources(monkeypatch):
    import asyncio
    import app.services.sync as sync_mod

    calls: list[str] = []

    class _FakeSource:
        requires_key = False

        async def fetch(self, limit=50, **kwargs):
            calls.append("fetched")
            return []

    class _FakeKeySource:
        requires_key = True

        async def fetch(self, limit=50, **kwargs):
            calls.append("keyed")
            return []

    class _FakeDB:
        def commit(self):  # noqa: D102 — no-op commit for empty batches
            calls.append("commit")

    monkeypatch.setattr(
        sync_mod,
        "get_all_sources",
        lambda: {"free_one": _FakeSource(), "keyed_one": _FakeKeySource()},
    )
    monkeypatch.setattr(
        sync_mod,
        "get_source",
        lambda name: {"free_one": _FakeSource(), "keyed_one": _FakeKeySource()}.get(name),
    )

    out = asyncio.run(sync_mod.sync_all_sources(_FakeDB(), limit_per_source=1))
    assert "free_one" in out
    assert "keyed_one" not in out  # skipped — never fetched without credentials
    assert calls == ["fetched", "commit"]
