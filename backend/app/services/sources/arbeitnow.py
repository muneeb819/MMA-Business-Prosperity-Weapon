import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class ArbeitnowSource(BaseSource):
    name = "arbeitnow"
    display_name = "Arbeitnow"
    source_type = "api"
    url = "https://www.arbeitnow.com"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get("https://www.arbeitnow.com/api/job-board-api")
            resp.raise_for_status()
            data = resp.json()
            jobs = []
            for j in data.get("data", [])[:limit]:
                tags = j.get("tags", []) or []
                pub_date = None
                if j.get("created_at"):
                    try:
                        pub_date = datetime.fromisoformat(j["created_at"].replace("Z", "+00:00"))
                    except Exception:
                        pass
                jobs.append(NormalizedJob(
                    title=j.get("title", ""),
                    company=j.get("company_name", ""),
                    description=j.get("description", "")[:2000],
                    url=j.get("url", ""),
                    location=j.get("location", ""),
                    remote=j.get("remote", False),
                    technologies=tags,
                    published_at=pub_date,
                    source_name=self.name,
                    source_url=self.url,
                    tags=tags,
                ))
            return jobs
