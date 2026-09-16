import httpx
import re
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class RemoteOKSource(BaseSource):
    name = "remoteok"
    display_name = "RemoteOK"
    source_type = "rss"
    url = "https://remoteok.com"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        import xml.etree.ElementTree as ET
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get("https://remoteok.com/remote-jobs.rss")
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
                # RemoteOK titles: "🔥 Role at Company (Location)"
                company = ""
                if " at " in title:
                    parts = title.rsplit(" at ", 1)
                    title = parts[0].strip()
                    company = parts[1].strip()
                    # Remove trailing location parens
                    if "(" in company and company.endswith(")"):
                        company = company[:company.rindex("(")].strip()
                clean_desc = re.sub(r"<[^>]+>", " ", desc)[:2000]
                tags = []
                lower_desc = clean_desc.lower()
                for tech in ["python", "javascript", "typescript", "react", "node", "go", "rust", "java", "ruby", "php", "swift", "docker", "kubernetes", "aws", "gcp", "azure"]:
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
                ))
            return jobs