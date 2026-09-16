import os
import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class AdzunaSource(BaseSource):
    name = "adzuna"
    display_name = "Adzuna"
    source_type = "api"
    url = "https://adzuna.com"
    requires_key = True

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        app_id = os.getenv("ADZUNA_APP_ID", "")
        app_key = os.getenv("ADZUNA_APP_KEY", "")
        if not app_id or not app_key:
            return []
        country = kwargs.get("country", "us")
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"https://api.adzuna.com/v1/api/jobs/{country}/search/1",
                params={
                    "app_id": app_id,
                    "app_key": app_key,
                    "results_per_page": min(limit, 50),
                    "what": kwargs.get("search", "software engineer"),
                    "max_days_old": 7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            jobs = []
            for j in data.get("results", [])[:limit]:
                loc = j.get("location", {})
                display_name = loc.get("display_name", "") if isinstance(loc, dict) else ""
                salary_min = j.get("salary_min") or 0
                salary_max = j.get("salary_max") or 0
                cat = j.get("category", {})
                category = cat.get("label", "") if isinstance(cat, dict) else ""
                tags = []
                if category:
                    tags.append(category)
                jobs.append(NormalizedJob(
                    title=j.get("title", ""),
                    company=j.get("company", {}).get("display_name", "") if isinstance(j.get("company"), dict) else "",
                    description=j.get("description", "")[:2000],
                    url=j.get("redirect_url", ""),
                    location=display_name,
                    salary_min=salary_min,
                    salary_max=salary_max,
                    technologies=tags,
                    published_at=datetime.fromisoformat(j.get("created", "").replace("Z", "+00:00")) if j.get("created") else None,
                    source_name=self.name,
                    source_url=self.url,
                    tags=tags,
                ))
            return jobs
