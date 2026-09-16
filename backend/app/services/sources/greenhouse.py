import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob

GREENHOUSE_COMPANIES = [
    "stripe", "airbnb", "spotify", "discord", "figma", "notion",
    "linear", "vercel", "supabase", "posthog", "retool", "retool",
    "datadog", "twilio", "cloudflare", "netlify", "hashicorp",
    "gitlab", "github", "atlassian", "mongodb", "elastic",
    "databricks", "snowflake", "crowdstrike", "paloaltonetworks",
    "zoom", "slack", "dropbox", "snap", "pinterest", "reddit",
    "coinbase", "robinhood", "plaid", "instacart", "doordash",
    "flexport", "ramp", "brex", "mercury", "rippling",
    "anthropic", "openai", "scale-ai", "weights-and-biases",
    "dbt-labs", "airbyte", "metabase", "grafana-labs",
]


class GreenhouseSource(BaseSource):
    name = "greenhouse"
    display_name = "Greenhouse ATS"
    source_type = "ats"
    url = "https://greenhouse.io"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        companies = kwargs.get("companies", GREENHOUSE_COMPANIES)
        jobs = []
        async with httpx.AsyncClient(timeout=15) as client:
            for company_slug in companies:
                if len(jobs) >= limit:
                    break
                try:
                    resp = await client.get(
                        f"https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs",
                        params={"content": "false"},
                    )
                    if resp.status_code != 200:
                        continue
                    data = resp.json()
                    for j in data.get("jobs", [])[:5]:
                        loc = j.get("location", {})
                        location_name = loc.get("name", "") if isinstance(loc, dict) else str(loc)
                        pub_date = None
                        if j.get("first_published"):
                            try:
                                pub_date = datetime.fromisoformat(j["first_published"].replace("Z", "+00:00"))
                            except Exception:
                                pass
                        jobs.append(NormalizedJob(
                            title=j.get("title", ""),
                            company=company_slug.replace("-", " ").title(),
                            description=(j.get("content", "") or "")[:2000],
                            url=j.get("absolute_url", ""),
                            location=location_name,
                            published_at=pub_date,
                            source_name=self.name,
                            source_url=self.url,
                            tags=[],
                        ))
                except Exception:
                    continue
        return jobs[:limit]
