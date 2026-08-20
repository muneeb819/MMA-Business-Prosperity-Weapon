import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob

ASHBY_COMPANIES = [
    "linear", "vercel", "supabase", "posthog", "retool",
    "plaid", "ramp", "brex", "mercury", "notion",
    "figma", "retool", "webflow", "codesandbox", "railway",
    "render", "neon", "turso", "drizzle", "leap",
]


class AshbySource(BaseSource):
    name = "ashby"
    display_name = "Ashby ATS"
    source_type = "ats"
    url = "https://ashbyhq.com"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        companies = kwargs.get("companies", ASHBY_COMPANIES)
        jobs = []
        async with httpx.AsyncClient(timeout=15) as client:
            for company_slug in companies:
                if len(jobs) >= limit:
                    break
                try:
                    resp = await client.get(
                        f"https://api.ashbyhq.com/posting-api/job-board/{company_slug}",
                    )
                    if resp.status_code != 200:
                        continue
                    data = resp.json()
                    for j in data.get("jobs", [])[:5]:
                        if len(jobs) >= limit:
                            break
                        if j.get("isListed") is False:
                            continue
                        pub_date = None
                        if j.get("publishedAt"):
                            try:
                                pub_date = datetime.fromisoformat(j["publishedAt"].replace("Z", "+00:00"))
                            except Exception:
                                pass
                        loc = j.get("locationName", "")
                        employment = j.get("employmentType", "")
                        jobs.append(NormalizedJob(
                            title=j.get("title", ""),
                            company=company_slug.replace("-", " ").title(),
                            description=(j.get("description", "") or "")[:2000],
                            url=j.get("jobUrl", j.get("applyUrl", "")),
                            location=loc,
                            job_type="full_time" if "full" in employment.lower() else "contract",
                            published_at=pub_date,
                            source_name=self.name,
                            source_url=self.url,
                            tags=[],
                        ))
                except Exception:
                    continue
        return jobs[:limit]
