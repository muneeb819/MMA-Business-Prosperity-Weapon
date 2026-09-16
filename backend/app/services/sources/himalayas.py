import httpx
from typing import List
from app.services.sources.base import BaseSource, NormalizedJob


class HimalayasSource(BaseSource):
    name = "himalayas"
    display_name = "Himalayas"
    source_type = "api"
    url = "https://himalayas.app"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        jobs = []
        offset = 0
        async with httpx.AsyncClient(timeout=30) as client:
            while len(jobs) < limit:
                batch_size = min(20, limit - len(jobs))
                resp = await client.get(
                    "https://himalayas.app/jobs/api",
                    params={"limit": batch_size, "offset": offset},
                )
                resp.raise_for_status()
                data = resp.json()
                for j in data.get("jobs", []):
                    salary = j.get("salary") or {}
                    jobs.append(NormalizedJob(
                        title=j.get("title", ""),
                        company=j.get("companyName", ""),
                        description=j.get("description", "")[:2000],
                        url=j.get("url", ""),
                        location=j.get("location", ""),
                        country=j.get("country", ""),
                        salary_min=salary.get("min", 0) or 0,
                        salary_max=salary.get("max", 0) or 0,
                        currency=salary.get("currency", "USD"),
                        technologies=[t.get("name", "") for t in j.get("technologies", [])],
                        job_type="full_time" if j.get("employmentType") == "Full-time" else "contract",
                        remote=j.get("remote", False),
                        source_name=self.name,
                        source_url=self.url,
                        tags=[j.get("seniority", ""), j.get("employmentType", "")],
                    ))
                if not data.get("jobs") or len(data["jobs"]) < batch_size:
                    break
                offset += batch_size
        return jobs[:limit]
