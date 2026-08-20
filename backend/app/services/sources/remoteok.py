import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class RemoteOKSource(BaseSource):
    name = "remoteok"
    display_name = "RemoteOK"
    source_type = "api"
    url = "https://remoteok.com"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                "https://remoteok.com/api",
                headers={"User-Agent": "MBPW-Lead-Generator/1.0"},
            )
            resp.raise_for_status()
            raw = resp.json()
            jobs = []
            for j in raw:
                if not isinstance(j, dict) or "id" not in j:
                    continue
                tags = j.get("tags", []) or []
                salary_min = j.get("salary_min") or 0
                salary_max = j.get("salary_max") or 0
                date_str = j.get("date", "")
                pub_date = None
                if date_str:
                    try:
                        pub_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    except Exception:
                        pass
                jobs.append(NormalizedJob(
                    title=j.get("position", ""),
                    company=j.get("company", ""),
                    description=j.get("description", "")[:2000],
                    url=j.get("url", f"https://remoteok.com/remote-jobs/{j.get('id', '')}"),
                    location=j.get("location", ""),
                    salary_min=salary_min,
                    salary_max=salary_max,
                    technologies=tags,
                    job_type="full_time",
                    remote=True,
                    published_at=pub_date,
                    source_name=self.name,
                    source_url=self.url,
                    tags=tags,
                ))
            return jobs[:limit]
