import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob

LEVER_COMPANIES = [
    "stripe", "airbnb", "netflix", "spotify", "shopify",
    "cloudflare", "twilio", "cloudfare", "gitlab", "postmates",
    "reddit", "pinterest", "quora", "medium", "cursor",
    "zapier", "segment", "heap", "mixpanel", "amplitude",
    "figma", "invision", "abstract", "zeal", "ramp",
]


class LeverSource(BaseSource):
    name = "lever"
    display_name = "Lever ATS"
    source_type = "ats"
    url = "https://lever.co"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        companies = kwargs.get("companies", LEVER_COMPANIES)
        jobs = []
        async with httpx.AsyncClient(timeout=15) as client:
            for company_slug in companies:
                if len(jobs) >= limit:
                    break
                try:
                    resp = await client.get(
                        f"https://api.lever.co/v0/postings/{company_slug}",
                        params={"mode": "json"},
                    )
                    if resp.status_code != 200:
                        continue
                    data = resp.json()
                    for j in data[:5]:
                        if len(jobs) >= limit:
                            break
                        created = j.get("createdAt")
                        pub_date = None
                        if created:
                            try:
                                pub_date = datetime.fromtimestamp(created / 1000)
                            except Exception:
                                pass
                        categories = j.get("categories", {})
                        dept = categories.get("team", "")
                        loc = categories.get("location", "")
                        jobs.append(NormalizedJob(
                            title=j.get("text", ""),
                            company=company_slug.replace("-", " ").title(),
                            description=(j.get("descriptionPlain", "") or j.get("description", ""))[:2000],
                            url=j.get("hostedUrl", ""),
                            location=loc,
                            job_type="full_time",
                            published_at=pub_date,
                            source_name=self.name,
                            source_url=self.url,
                            tags=[dept] if dept else [],
                        ))
                except Exception:
                    continue
        return jobs[:limit]
