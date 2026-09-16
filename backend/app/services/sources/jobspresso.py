from app.services.sources._rss import RSSBaseSource


class JobspressoSource(RSSBaseSource):
    name = "jobspresso"
    display_name = "Jobspresso"
    source_type = "rss"
    url = "https://jobspresso.co"
    feed_url = "https://jobspresso.co/feed/"
