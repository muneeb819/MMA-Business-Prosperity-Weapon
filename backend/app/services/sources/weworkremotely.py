import httpx
import re
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class WeWorkRemotelySource(BaseSource):
    name = "weworkremotely"
    display_name = "We Work Remotely"
    source_type = "rss"
    url = "https://weworkremotely.com"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        import xml.etree.ElementTree as ET
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get("https://weworkremotely.com/remote-jobs.rss")
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
                company = ""
                if " at " in title:
                    parts = title.rsplit(" at ", 1)
                    title = parts[0].strip()
                    company = parts[1].strip()
                elif title.count(":") == 1 or (":" in title and title.index(":") < len(title) * 0.6):
                    c, r = title.split(":", 1)
                    if c.strip():
                        company = c.strip()
                        title = r.strip() or title
                if not company and title.lower() in {"we work remotely", "hiring", "remotely"}:
                    company = title
                    title = ""
                clean_desc = re.sub(r"<[^>]+>", " ", desc)[:2000]
                
                # Extract email mentioned directly in RSS description
                apply_email = None
                emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", desc)
                if emails:
                    apply_email = emails[0]
                
                tags = []
                lower_desc = clean_desc.lower()
                for tech in ["python", "javascript", "typescript", "react", "node", "go", "rust", "java", "ruby", "php", "swift"]:
                    if tech in lower_desc:
                        tags.append(tech)

                jobs.append(NormalizedJob(
                    title=title,
                    company=company,
                    description=clean_desc,
                    url=link,
                    location="Remote",
                    technologies=tags,
                    remote=True,
                    published_at=pub_date,
                    source_name=self.name,
                    source_url=self.url,
                    tags=tags,
                    apply_email=apply_email,
                ))
            return jobs
