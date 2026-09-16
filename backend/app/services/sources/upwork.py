from app.services.sources._rss import RSSBaseSource


class UpworkSource(RSSBaseSource):
    name = "upwork"
    display_name = "Upwork"
    source_type = "rss"
    url = "https://www.upwork.com"
    feed_url = "https://www.upwork.com/ab/feed/jobs/rss?sort=recency"
