import httpx
import xml.etree.ElementTree as ET
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class RemotiveSource(BaseSource):
    name = "remotive"
    display_name = "Remotive"
    source_type = "rss"
    url = "https://remotive.com"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get("https://remotive.com/remote-jobs/feed")
            resp.raise_for_status()
            root = ET.fromstring(resp.text)
            jobs = []
            for item in root.findall(".//item"):
                if len(jobs) >= limit:
                    break
                title = item.findtext("title", "")
                link = item.findtext("link", "")
                desc = item.findtext("description", "")
                pub_date_str = item.findtext("pubDate", "")
                pub_date = None
                if pub_date_str:
                    try:
                        from email.utils import parsedate_to_datetime
                        pub_date = parsedate_to_datetime(pub_date_str)
                    except Exception:
                        pass
                category = item.findtext("category", "")
                company = ""
                if "—" in title:
                    parts = title.split("—", 1)
                    company = parts[0].strip()
                    title = parts[1].strip()
                elif " at " in title.lower():
                    parts = title.split(" at ", 1)
                    title = parts[0].strip()
                    company = parts[1].strip()
                jobs.append(NormalizedJob(
                    title=title,
                    company=company,
                    description=desc[:2000],
                    url=link,
                    location="Remote",
                    country="",
                    technologies=[category] if category else [],
                    job_type="full_time",
                    remote=True,
                    published_at=pub_date,
                    source_name=self.name,
                    source_url=self.url,
                    tags=[category] if category else [],
                ))
            return jobs
