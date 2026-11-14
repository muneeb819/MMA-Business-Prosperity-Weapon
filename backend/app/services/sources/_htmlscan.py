"""Shared helper for extracting job cards from server-rendered HTML pages.

Strategy (deliberately class-name agnostic): locate every anchor whose href
matches a platform-specific URL pattern, take the anchor's inner text as the
title, and capture the plain text between this anchor and the next match as
the card segment (company, pay, description, skills …). This survives markup
redesigns as long as the canonical job-URL patterns stay stable.
"""

from __future__ import annotations

import re
from html import unescape
from urllib.parse import urlparse, urlunparse

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")

HREF_RE = re.compile(r'href\s*=\s*"([^"]+)"', re.IGNORECASE)


def strip_tags(fragment: str) -> str:
    """Collapse an HTML fragment to whitespace-normalised plain text."""
    return _WS_RE.sub(" ", unescape(_TAG_RE.sub(" ", fragment))).strip()


def clean_url(href: str, base: str = "") -> str:
    """Normalise an href: resolve relative paths and drop tracking params."""
    href = unescape(href.strip())
    if base and href.startswith("/"):
        href = f"{base.rstrip('/')}{href}"
    parsed = urlparse(href)
    query = "&".join(
        part
        for part in parsed.query.split("&")
        if part and not part.lower().startswith(("utm_", "referrer_url"))
    )
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", query, ""))


def scan_job_cards(
    html: str,
    href_pattern: re.Pattern[str],
    limit: int = 40,
    base: str = "",
    url_cleaner=None,
) -> list[dict]:
    """Return [{url, title, segment}] for anchors whose href matches pattern.

    ``href_pattern`` is matched against the raw href value (query stripped by
    callers via url_cleaner when needed). ``segment`` is the plain text between
    the end of this anchor and the start of the next matching anchor.
    """
    cards: list[dict] = []
    anchors: list[tuple[int, int, str, str]] = []  # (a_start, a_end_close, url, title)

    pos = 0
    while True:
        m = HREF_RE.search(html, pos)
        if not m:
            break
        href_raw = m.group(1)
        pm = href_pattern.search(href_raw)
        if pm:
            a_start = html.rfind("<a", 0, m.start())
            if a_start >= 0 and html.find("</a>", m.end()) != -1:
                a_close_gt = html.find(">", m.end())
                a_end = html.find("</a>", a_close_gt)
                if a_close_gt != -1 and a_end != -1:
                    title = strip_tags(html[a_close_gt + 1 : a_end])
                    anchors.append((a_start, a_end + 4, href_raw, title))
                    pos = a_end + 4
                    if len(anchors) > limit * 3:  # safety valve for giant pages
                        break
                    continue
        pos = m.end()

    seen: set[str] = set()
    for i, (a_start, a_end, href_raw, title) in enumerate(anchors):
        if len(cards) >= limit:
            break
        url = url_cleaner(href_raw) if url_cleaner else clean_url(href_raw, base)
        if not url or url in seen:
            continue
        next_start = anchors[i + 1][0] if i + 1 < len(anchors) else len(html)
        raw = html[a_end:min(next_start, a_end + 6000)]
        segment = strip_tags(raw)
        seen.add(url)
        if not title:
            continue
        cards.append({"url": url, "title": title, "segment": segment, "raw_segment": raw})
    return cards
