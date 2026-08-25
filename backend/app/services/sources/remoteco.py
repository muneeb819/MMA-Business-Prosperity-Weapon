from app.services.sources._rss import RSSBaseSource


class RemoteCoSource(RSSBaseSource):
    name = "remoteco"
    display_name = "Remote.co"
    source_type = "rss"
    url = "https://remote.co"
    feed_url = "https://remote.co/remote-jobs/feed/"
