"""Indeed connector — reads the public job-search results pages.

Indeed has no open publisher API; this reads the server-rendered results page
of public searches (best-effort: if the page structure changes or the request
is throttled, sync reports fetched=0 instead of inventing data).
"""

import re
from typing import List
from datetime import datetime

import httpx

from app.services.sources.base import BaseSource, NormalizedJob
from app.services.sources._htmlscan import scan_job_cards

# href forms: /viewjob?jk=<hex>, /rc/clk?jk=<hex> (absolute or relative)
_JK_RE = re.compile(r"^(?:https?://(?:www\.)?indeed\.com)?/(?:viewjob|rc/clk)\?[^#]*\bjk=([0-9a-f]{12,24})", re.IGNORECASE)

_PAY_RE = re.compile(
    r"(?:Up to )?\$\s*([\d,]+(?:\.\d+)?)\s*(?:-\s*\$?\s*([\d,]+(?:\.\d+)?))?\s*(an hour|a year|a month|a week)?",
    re.IGNORECASE,
)
_MULT = {"an hour": 2080, "a year": 1, "a month": 12, "a week": 52}

_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def _clean(href: str) -> str | None:
    from urllib.parse import urlparse, parse_qs

    raw = href.split("#", 1)[0]
    parsed = urlparse(raw if raw.startswith("http") else f"https://www.indeed.com{raw}")
    jk = (parse_qs(parsed.query).get("jk") or [None])[0]
    if not jk:
        return None
    return f"https://www.indeed.com/viewjob?jk={jk}"


def parse_indeed_page(html: str, limit: int = 20) -> List[NormalizedJob]:
    cards = scan_job_cards(html, _JK_RE, limit=limit, url_cleaner=_clean)
    jobs: List[NormalizedJob] = []
    for card in cards:
        url = card["url"]
        jk = url.rsplit("jk=", 1)[-1]
        if not url or not card["title"] or not jk:
            continue
        seg = card["segment"]
        raw = card.get("raw_segment", "")
        # Company: prefer Indeed's own company element, else split the leading
        # text before the location/pay markers ("BELAY Remote - $28 an hour …").
        company = ""
        m_class = re.search(r'class="[^"]*company[^"]*"[^>]*>\s*([^<]{2,80})\s*<', raw, re.IGNORECASE)
        if m_class:
            from html import unescape

            company = unescape(m_class.group(1)).strip()
        if not company:
            head = re.split(
                r"\s+(?:Remote\b|Full-time\b|Contract\b|Part-time\b|Perm(?:anent)?\b|\$)",
                seg,
                maxsplit=1,
            )[0]
            company = head.strip()[:80] or "Indeed employer"
        salary_min = salary_max = 0.0
        m_pay = _PAY_RE.search(seg)
        if m_pay:
            lo = float(m_pay.group(1).replace(",", ""))
            hi = float(m_pay.group(2).replace(",", "")) if m_pay.group(2) else lo
            mult = _MULT.get((m_pay.group(3) or "a year").lower(), 1)
            salary_min, salary_max = lo * mult, hi * mult
        desc = seg[:1200]
        jobs.append(
            NormalizedJob(
                title=card["title"],
                company=company,
                description=desc,
                url=url,
                location="Remote",
                salary_min=salary_min,
                salary_max=salary_max,
                source_name="indeed",
                source_url="https://www.indeed.com",
                published_at=datetime.utcnow(),
                tags=[],
            )
        )
    return jobs


class IndeedSource(BaseSource):
    name = "indeed"
    display_name = "Indeed"
    source_type = "scraper"
    url = "https://www.indeed.com"
    requires_key = False

    QUERIES = ["marketing assistant remote", "web developer remote", "graphic designer remote"]

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
                        "https://www.indeed.com/jobs",
                        params={"q": q, "l": "Remote", "sort": "date"},
                    )
                    resp.raise_for_status()
                    for job in parse_indeed_page(resp.text, limit=per_query):
                        if job.url in seen:
                            continue
                        seen.add(job.url)
                        jobs.append(job)
                        if len(jobs) >= limit:
                            break
                except Exception:  # noqa: BLE001 — one throttled query must not fail the sync
                    continue
        return jobs
