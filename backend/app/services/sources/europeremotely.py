from app.services.sources._rss import RSSBaseSource


class EuropeRemotelySource(RSSBaseSource):
    name = "europeremotely"
    display_name = "Europe Remotely"
    source_type = "rss"
    url = "https://europeremotely.com"
    feed_url = "https://europeremotely.com/rss"
