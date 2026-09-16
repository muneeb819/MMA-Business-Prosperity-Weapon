import re
import httpx
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, List, Optional

from app.services.sources.base import BaseSource, NormalizedJob

UA = {"User-Agent": "MMA-Business-Prosperity-Weapon/1.0"}


async def fetch_rss(url: str, timeout: int = 30) -> str:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(url, headers=UA, follow_redirects=True)
        resp.raise_for_status()
        return resp.text


def _strip_html(text: str) -> str:
    if not text:
        return ""
    return re.sub(r"<[^>]+>", " ", text).replace("&nbsp;", " ").replace("&amp;", "&").strip()


def _parse_date(value: str) -> Optional[datetime]:
    if not value:
        return None
    value = value.strip()
    fmts = (
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S",
    )
    for fmt in fmts:
        try:
            return datetime.strptime(value, fmt)
        except Exception:
            continue
    return None


def _company_from_title(title: str) -> str:
    for sep in (" at ", " @ ", " — ", " - "):
        if sep in title:
            parts = title.split(sep)
            if len(parts) >= 2:
                return parts[-1].strip().strip(".,")
    return ""


def parse_rss_items(xml_text: str) -> List[Dict]:
    try:
        root = ET.fromstring(xml_text)
    except Exception:
        return []
    items: List[Dict] = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        if not title:
            continue
        items.append({
            "title": title,
            "link": (item.findtext("link") or "").strip(),
            "description": _strip_html(item.findtext("description") or "")[:2000],
            "pubDate": _parse_date(item.findtext("pubDate") or ""),
            "company": _company_from_title(title),
        })
    if not items:
        ns = "{http://www.w3.org/2005/Atom}"
        for entry in root.iter(ns + "entry"):
            title = (entry.findtext(ns + "title") or "").strip()
            if not title:
                continue
            link = ""
            for l in entry.findall(ns + "link"):
                link = l.get("href") or link
            content = _strip_html(entry.findtext(ns + "content") or entry.findtext(ns + "summary") or "")
            pub = _parse_date(entry.findtext(ns + "updated") or entry.findtext(ns + "published") or "")
            items.append({
                "title": title,
                "link": link,
                "description": content[:2000],
                "pubDate": pub,
                "company": _company_from_title(title),
            })
    return items


class RSSBaseSource(BaseSource):
    """Convenience base for RSS/Atom job feeds."""

    feed_url: str = ""

    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        xml = await fetch_rss(self.feed_url)
        jobs = []
        for it in parse_rss_items(xml)[:limit]:
            jobs.append(NormalizedJob(
                title=it["title"],
                company=it.get("company") or "",
                description=it["description"],
                url=it["link"],
                job_type="full_time",
                remote=True,
                published_at=it["pubDate"],
                source_name=self.name,
                source_url=self.url,
                tags=[],
            ))
        return jobs
