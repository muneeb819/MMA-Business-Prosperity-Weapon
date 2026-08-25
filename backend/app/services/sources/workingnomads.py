from app.services.sources._rss import RSSBaseSource


class WorkingNomadsSource(RSSBaseSource):
    name = "workingnomads"
    display_name = "Working Nomads"
    source_type = "rss"
    url = "https://www.workingnomads.co"
    feed_url = "https://www.workingnomads.co/feeds/jobs.rss"
