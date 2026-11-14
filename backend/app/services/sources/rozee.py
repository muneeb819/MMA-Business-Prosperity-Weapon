"""ROZEE.PK connector — Pakistan's job market (public search pages).

Search endpoint: https://www.rozee.pk/job/jsearch/q/<query>
Job links:       https://www.rozee.pk/<slug>-jobs-<id>?utm_source=…
"""

import re
from typing import List
from datetime import datetime
from urllib.parse import quote

import httpx

from app.services.sources.base import BaseSource, NormalizedJob
from app.services.sources._htmlscan import scan_job_cards

# Job detail URLs on rozee (slug may contain %-encoded chars) — strip tracking query.
_JOB_RE = re.compile(r"^https?://(?:www\.)?rozee\.pk/[A-Za-z0-9%._\-]+-jobs-\d+", re.IGNORECASE)

_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def _clean(href: str) -> str | None:
    m = _JOB_RE.match(href.split("#", 1)[0])
    return m.group(0) if m else None


def parse_rozee_page(html: str, limit: int = 20) -> List[NormalizedJob]:
    cards = scan_job_cards(html, _JOB_RE, limit=limit, url_cleaner=_clean)
    jobs: List[NormalizedJob] = []
    for card in cards:
        seg = card["segment"]
        # Segment shape: "COMPANY NAME, City, Pakistan  description…  Nov 13, 20262 Years  skill skill …"
        company, location = "", "Pakistan"
        m_co = re.match(r"\s*([^,|]{2,90}),\s*([A-Za-z .()''-]{2,40}),\s*Pakistan\b", seg)
        if m_co:
            company = m_co.group(1).strip()
            location = f"{m_co.group(2).strip()}, Pakistan"
        if not company:
            m_co2 = re.match(r"\s*([^,|]{2,90}),\s*Pakistan\b", seg)
            company = m_co2.group(1).strip() if m_co2 else "ROZEE employer"
        # Description = the first sentence-ish block after company/location.
        desc = seg[:1200]
        jobs.append(
            NormalizedJob(
                title=card["title"],
                company=company,
                description=desc,
                url=card["url"],
                location=location,
                country="Pakistan",
                salary_min=0,
                salary_max=0,  # ROZEE shows PKR ranges inconsistently — never fabricate USD
                source_name="rozee",
                source_url="https://www.rozee.pk",
                published_at=datetime.utcnow(),
                tags=["pakistan"],
            )
        )
    return jobs


class RozeeSource(BaseSource):
    name = "rozee"
    display_name = "ROZEE.PK (Pakistan)"
    source_type = "scraper"
    url = "https://www.rozee.pk"
    requires_key = False

    QUERIES = ["marketing", "software", "sales", "design"]

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        jobs: List[NormalizedJob] = []
        seen: set[str] = set()
        per_query = max(5, limit // max(1, len(self.QUERIES)) + 2)
        async with httpx.AsyncClient(
            timeout=30, headers={"User-Agent": _UA, "Accept-Language": "en-US,en;q=0.9"}
        ) as client:
            for q in self.QUERIES:
                if len(jobs) >= limit:
                    break
                try:
                    resp = await client.get(
                        f"https://www.rozee.pk/job/jsearch/q/{quote(q)}"
                    )
                    resp.raise_for_status()
                    for job in parse_rozee_page(resp.text, limit=per_query):
                        if job.url in seen:
                            continue
                        seen.add(job.url)
                        jobs.append(job)
                        if len(jobs) >= limit:
                            break
                except Exception:  # noqa: BLE001 — tolerate per-query failures
                    continue
        return jobs
