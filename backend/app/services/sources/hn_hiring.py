import httpx
from typing import List
from datetime import datetime
from app.services.sources.base import BaseSource, NormalizedJob


class HNHiringSource(BaseSource):
    name = "hn_hiring"
    display_name = "HN Who's Hiring"
    source_type = "api"
    url = "https://news.ycombinator.com"

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        async with httpx.AsyncClient(timeout=30) as client:
            search_resp = await client.get(
                "https://hn.algolia.com/api/v1/search",
                params={
                    "query": "Ask HN: Who is hiring?",
                    "tags": "story",
                    "hitsPerPage": 1,
                },
            )
            search_resp.raise_for_status()
            hits = search_resp.json().get("hits", [])
            if not hits:
                return []
            story_id = hits[0]["objectID"]
            item_resp = await client.get(
                f"https://hn.algolia.com/api/v1/items/{story_id}",
            )
            item_resp.raise_for_status()
            item_data = item_resp.json()
            jobs = []
            for child in item_data.get("children", []):
                if len(jobs) >= limit:
                    break
                text = child.get("text", "")
                if not text or len(text) < 50:
                    continue
                lines = text.split("\n")
                first_line = lines[0] if lines else text[:200]
                company = ""
                title = ""
                if "|" in first_line:
                    parts = first_line.split("|", 1)
                    title = parts[0].strip()
                    rest = parts[1].strip()
                    if rest:
                        company = rest.split("–")[0].strip().split("(")[0].strip()
                elif "–" in first_line:
                    parts = first_line.split("–", 1)
                    title = parts[0].strip()
                    company = parts[1].strip().split("(")[0].strip()
                else:
                    title = first_line[:100]
                url = f"https://news.ycombinator.com/item?id={child.get('id', '')}"
                tags = []
                lower_text = text.lower()
                for tech in ["python", "javascript", "typescript", "react", "node", "go", "rust", "java", "ruby", "php", "swift", "kotlin", "scala", "elixir"]:
                    if tech in lower_text:
                        tags.append(tech)
                remote = "remote" in lower_text
                jobs.append(NormalizedJob(
                    title=title[:200],
                    company=company[:100],
                    description=text[:2000],
                    url=url,
                    location="Remote" if remote else "",
                    technologies=tags,
                    remote=remote,
                    source_name=self.name,
                    source_url=self.url,
                    tags=tags,
                ))
            return jobs
