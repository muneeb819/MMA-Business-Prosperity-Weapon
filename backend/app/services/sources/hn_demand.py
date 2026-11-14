"""Hacker News discussions where people publicly look for help/freelancers.

Powered by the free Algolia HN Search API (keyless). This targets the
"people discussing their issues and looking for solutions" side: recent
stories whose text matches buying-intent phrases.
"""

import time
from typing import List
from datetime import datetime

import httpx

from app.services.sources.base import BaseSource, NormalizedJob

PHRASES = [
    "looking for a freelancer",
    "looking for a developer",
    "need someone to build",
    "hiring a freelance",
]

_UA = "MBPW-LeadSource/1.0 (business prospect research)"


class HNDiscussionsSource(BaseSource):
    name = "hn_demand"
    display_name = "Hacker News Discussions"
    source_type = "api"
    url = "https://news.ycombinator.com"
    requires_key = False

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        cutoff = int(time.time()) - 45 * 86400  # last 45 days only
        jobs: List[NormalizedJob] = []
        seen: set[str] = set()
        per_phrase = max(5, limit // len(PHRASES) + 2)
        async with httpx.AsyncClient(timeout=30, headers={"User-Agent": _UA}) as client:
            for phrase in PHRASES:
                if len(jobs) >= limit:
                    break
                try:
                    resp = await client.get(
                        "https://hn.algolia.com/api/v1/search",
                        params={
                            "query": phrase,
                            "tags": "story",
                            "hitsPerPage": per_phrase,
                            "numericFilters": f"created_at_i>{cutoff}",
                        },
                    )
                    resp.raise_for_status()
                    for hit in resp.json().get("hits", []):
                        oid = str(hit.get("objectID", ""))
                        if not oid or oid in seen:
                            continue
                        title = (hit.get("title") or "").strip()
                        body = (hit.get("story_text") or hit.get("url") or "").strip()
                        if not title or len(title) < 12:
                            continue
                        seen.add(oid)
                        jobs.append(
                            NormalizedJob(
                                title=title[:300],
                                company=f"HN: {hit.get('author', 'user')}",
                                description=(body or title)[:1500],
                                url=f"https://news.ycombinator.com/item?id={oid}",
                                location="Remote",
                                source_name="hn_demand",
                                source_url="https://news.ycombinator.com",
                                published_at=datetime.utcfromtimestamp(
                                    int(hit.get("created_at_i") or time.time())
                                ),
                                tags=["discussion", "hacker-news"],
                            )
                        )
                        if len(jobs) >= limit:
                            break
                except Exception:  # noqa: BLE001 — one bad phrase must not fail the sync
                    continue
        return jobs
