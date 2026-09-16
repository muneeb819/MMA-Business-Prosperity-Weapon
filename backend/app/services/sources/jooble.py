import os
import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class JoobleSource(BaseSource):
    name = "jooble"
    display_name = "Jooble"
    source_type = "api"
    url = "https://jooble.org"
    requires_key = True

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        api_key = os.getenv("JOOBLE_API_KEY", "")
        if not api_key:
            return []
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"https://jooble.org/api/{api_key}",
                json={
                    "keywords": kwargs.get("search", "software engineer"),
                    "location": kwargs.get("location", ""),
                },
            )
            resp.raise_for_status()
            data = resp.json()
            jobs = []
            for j in data.get("jobs", [])[:limit]:
                salary_str = j.get("salary", "")
                salary_min = 0
                salary_max = 0
                if salary_str:
                    import re
                    nums = re.findall(r"[\d,]+", salary_str.replace(",", ""))
                    if len(nums) >= 2:
                        salary_min = float(nums[0])
                        salary_max = float(nums[1])
                    elif len(nums) == 1:
                        salary_max = float(nums[0])
                jobs.append(NormalizedJob(
                    title=j.get("title", ""),
                    company=j.get("company", ""),
                    description=j.get("snippet", "")[:2000],
                    url=j.get("link", ""),
                    location=j.get("location", ""),
                    salary_min=salary_min,
                    salary_max=salary_max,
                    published_at=datetime.fromisoformat(j.get("pubDate", "").replace("Z", "+00:00")) if j.get("pubDate") else None,
                    source_name=self.name,
                    source_url=self.url,
                    tags=[],
                ))
            return jobs
