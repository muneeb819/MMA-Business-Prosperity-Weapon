import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class FindworkSource(BaseSource):
    name = "findwork"
    display_name = "Findwork"
    source_type = "api"
    url = "https://findwork.dev"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                "https://findwork.dev/api/jobs/",
                params={"order_by": "date_posted", "search": kwargs.get("search", "")},
            )
            resp.raise_for_status()
            data = resp.json()
            jobs = []
            for j in data.get("results", [])[:limit]:
                emp = j.get("employment_type", "")
                role = j.get("role", "")
                techs = j.get("technology_roles", []) or []
                pub_date = None
                if j.get("date_posted"):
                    try:
                        pub_date = datetime.fromisoformat(j["date_posted"].replace("Z", "+00:00"))
                    except Exception:
                        pass
                jobs.append(NormalizedJob(
                    title=j.get("text", ""),
                    company=j.get("company_name", ""),
                    description=j.get("text", "")[:2000],
                    url=j.get("url", ""),
                    location=j.get("location", ""),
                    technologies=techs,
                    job_type="full_time" if "full" in emp.lower() else "contract",
                    remote=j.get("remote", False),
                    published_at=pub_date,
                    source_name=self.name,
                    source_url=self.url,
                    tags=techs,
                ))
            return jobs
