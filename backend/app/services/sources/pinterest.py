"""Pinterest connector — product/service-seeking pins via the official API.

Requires a FREE Pinterest developer access token (developers.pinterest.com →
create app → generate access token) exported as PINTEREST_ACCESS_TOKEN.
Until it exists the source is flagged requires_key=True, so daily sync skips
it and the Connectors page shows "API key needed".
"""

import os
from typing import List
from datetime import datetime

import httpx

from app.services.sources.base import BaseSource, NormalizedJob

QUERIES = [
    "looking for a web designer",
    "need logo design",
    "looking for marketing help",
]


class PinterestSource(BaseSource):
    name = "pinterest"
    display_name = "Pinterest (product/service intent)"
    source_type = "api"
    url = "https://www.pinterest.com"
    requires_key = True  # flipped to False automatically once the token exists

    def __init__(self):
        if os.getenv("PINTEREST_ACCESS_TOKEN"):
            self.requires_key = False

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        token = os.getenv("PINTEREST_ACCESS_TOKEN", "")
        if not token:
            raise RuntimeError(
                "Pinterest access token not configured — create an app at "
                "developers.pinterest.com and set PINTEREST_ACCESS_TOKEN."
            )
        jobs: List[NormalizedJob] = []
        seen: set[str] = set()
        per_query = max(5, limit // max(1, len(QUERIES)) + 2)
        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        async with httpx.AsyncClient(timeout=30, headers=headers) as client:
            for q in QUERIES:
                if len(jobs) >= limit:
                    break
                try:
                    resp = await client.get(
                        "https://api.pinterest.com/v5/search/pins",
                        params={"query": q, "page_size": min(25, per_query)},
                    )
                    resp.raise_for_status()
                    for item in resp.json().get("items", []):
                        pin_id = str(item.get("id") or "")
                        if not pin_id or pin_id in seen:
                            continue
                        seen.add(pin_id)
                        link = item.get("link") or f"https://www.pinterest.com/pin/{pin_id}/"
                        jobs.append(
                            NormalizedJob(
                                title=(item.get("title") or q)[:300],
                                company="Pinterest user",
                                description=(item.get("description") or q)[:1500],
                                url=link,
                                location="Remote",
                                source_name="pinterest",
                                source_url="https://www.pinterest.com",
                                published_at=datetime.utcnow(),
                                tags=["pinterest"],
                            )
                        )
                        if len(jobs) >= limit:
                            break
                except Exception:  # noqa: BLE001 — tolerate per-query failures
                    continue
        return jobs
