"""Upwork connector — reads the public job-search results pages.

Upwork's old public RSS feed is dead (404). This reads the server-rendered
public search page (best-effort: throttling or redesign → fetched=0, never
fabricated).
"""

import re
from typing import List
from datetime import datetime

import httpx

from app.services.sources.base import BaseSource, NormalizedJob
from app.services.sources._htmlscan import scan_job_cards

# https://www.upwork.com/jobs/<slug>_~<numeric-id>/
_JOB_RE = re.compile(r"^https?://(?:www\.)?upwork\.com/jobs/[^?\s\"']*_~\d+", re.IGNORECASE)

_HOURLY_RE = re.compile(r"Hourly:\s*\$?\s*([\d,]+(?:\.\d+)?)\s*-\s*\$?\s*([\d,]+(?:\.\d+)?)", re.IGNORECASE)
_BUDGET_RE = re.compile(r"Est\.\s*budget:\s*\$?\s*([\d,]+(?:\.\d+)?)", re.IGNORECASE)
_LEVEL_RE = re.compile(r"\b(Entry Level|Intermediate|Expert)\b", re.IGNORECASE)

_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def _clean(href: str) -> str | None:
    m = _JOB_RE.match(href.split("#", 1)[0])
    return m.group(0).rstrip("/") + "/" if m else None


def parse_upwork_page(html: str, limit: int = 20) -> List[NormalizedJob]:
    cards = scan_job_cards(html, _JOB_RE, limit=limit, url_cleaner=_clean)
    jobs: List[NormalizedJob] = []
    for card in cards:
        seg = card["segment"]
        salary_min = salary_max = 0.0
        m_h = _HOURLY_RE.search(seg)
        m_b = _BUDGET_RE.search(seg)
        if m_h:
            salary_min = float(m_h.group(1).replace(",", ""))
            salary_max = float(m_h.group(2).replace(",", ""))
        elif m_b:
            salary_min = salary_max = float(m_b.group(1).replace(",", ""))
        level = _LEVEL_RE.search(seg)
        tags = []
        if level:
            tags.append(level.group(1).lower().replace(" ", "_"))
        jobs.append(
            NormalizedJob(
                title=card["title"],
                company="Upwork client",
                description=seg[:1500],
                url=card["url"],
                location="Remote",
                salary_min=salary_min,
                salary_max=salary_max,
                source_name="upwork",
                source_url="https://www.upwork.com",
                published_at=datetime.utcnow(),
                tags=tags,
            )
        )
    return jobs


class UpworkSource(BaseSource):
    name = "upwork"
    display_name = "Upwork"
    source_type = "scraper"
    url = "https://www.upwork.com"
    requires_key = False

    QUERIES = ["marketing", "web development", "graphic design"]

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
                        "https://www.upwork.com/nx/search/jobs/",
                        params={"q": q},
                    )
                    resp.raise_for_status()
                    for job in parse_upwork_page(resp.text, limit=per_query):
                        if job.url in seen:
                            continue
                        seen.add(job.url)
                        jobs.append(job)
                        if len(jobs) >= limit:
                            break
                except Exception:  # noqa: BLE001 — tolerate throttling per query
                    continue
        return jobs
