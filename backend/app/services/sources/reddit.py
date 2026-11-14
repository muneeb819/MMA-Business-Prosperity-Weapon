"""Reddit connector — subreddits where people seek services / hiring.

Requires a FREE Reddit API app (reddit.com/prefs/apps → create app →
"script"), exported as REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET. Until the
keys exist the source is flagged requires_key=True, so daily sync skips it
and the Connectors page shows "API key needed".
"""

import os
import time
from typing import List
from datetime import datetime

import httpx

from app.services.sources.base import BaseSource, NormalizedJob

# subreddit -> search query (hiring / service-seeking intent)
SUBREDDIT_QUERIES = {
    "forhire": "hiring",
    "slavelabour": "hiring",
    "smallbusiness": "looking for",
    "Entrepreneur": "looking for a",
    "startups": "need someone",
    "marketing": "looking for help",
}

_token_cache: dict = {"token": "", "exp": 0.0}


def _get_token(client: httpx.AsyncClient) -> str:
    if _token_cache["token"] and time.time() < _token_cache["exp"]:
        return _token_cache["token"]
    client_id = os.getenv("REDDIT_CLIENT_ID", "")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET", "")
    if not client_id or not client_secret:
        raise RuntimeError(
            "Reddit API credentials not configured — set REDDIT_CLIENT_ID and "
            "REDDIT_CLIENT_SECRET (free app at reddit.com/prefs/apps)."
        )
    resp = client.post(
        "https://www.reddit.com/api/v1/access_token",
        auth=(client_id, client_secret),
        data={"grant_type": "client_credentials"},
        headers={"User-Agent": "MBPW-LeadSource/1.0"},
    )
    resp.raise_for_status()
    data = resp.json()
    _token_cache["token"] = data["access_token"]
    _token_cache["exp"] = time.time() + float(data.get("expires_in", 3600)) - 60
    return _token_cache["token"]


class RedditSource(BaseSource):
    name = "reddit"
    display_name = "Reddit (hiring & service threads)"
    source_type = "api"
    url = "https://www.reddit.com"
    requires_key = True  # flipped to False automatically once credentials exist

    def __init__(self):
        if os.getenv("REDDIT_CLIENT_ID") and os.getenv("REDDIT_CLIENT_SECRET"):
            self.requires_key = False

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        jobs: List[NormalizedJob] = []
        seen: set[str] = set()
        per_sub = max(3, limit // len(SUBREDDIT_QUERIES) + 2)
        async with httpx.AsyncClient(timeout=30) as client:
            token = _get_token(client)
            headers = {
                "Authorization": f"Bearer {token}",
                "User-Agent": "MBPW-LeadSource/1.0",
            }
            for sub, query in SUBREDDIT_QUERIES.items():
                if len(jobs) >= limit:
                    break
                try:
                    resp = await client.get(
                        f"https://oauth.reddit.com/r/{sub}/search",
                        params={
                            "q": query,
                            "restrict_sr": 1,
                            "sort": "new",
                            "t": "week",
                            "limit": per_sub,
                            "raw_json": 1,
                        },
                        headers=headers,
                    )
                    resp.raise_for_status()
                    for child in resp.json().get("data", {}).get("children", []):
                        post = child.get("data") or {}
                        permalink = post.get("permalink") or ""
                        if not permalink or post.get("stickied"):
                            continue
                        url = f"https://www.reddit.com{permalink}"
                        if url in seen:
                            continue
                        seen.add(url)
                        jobs.append(
                            NormalizedJob(
                                title=(post.get("title") or "")[:300],
                                company=f"r/{sub}",
                                description=(post.get("selftext") or "")[:1500],
                                url=url,
                                location="Remote",
                                source_name="reddit",
                                source_url=f"https://www.reddit.com/r/{sub}",
                                published_at=datetime.utcfromtimestamp(
                                    float(post.get("created_utc") or time.time())
                                ),
                                tags=["reddit", sub],
                            )
                        )
                        if len(jobs) >= limit:
                            break
                except Exception:  # noqa: BLE001 — tolerate per-subreddit failures
                    continue
        return jobs
