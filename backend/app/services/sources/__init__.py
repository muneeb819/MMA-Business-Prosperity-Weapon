from app.services.sources.base import BaseSource, NormalizedJob
from app.services.sources.himalayas import HimalayasSource
from app.services.sources.remoteok import RemoteOKSource
from app.services.sources.remotive import RemotiveSource
from app.services.sources.greenhouse import GreenhouseSource
from app.services.sources.lever import LeverSource
from app.services.sources.ashby import AshbySource
from app.services.sources.hn_hiring import HNHiringSource
from app.services.sources.arbeitnow import ArbeitnowSource
from app.services.sources.findwork import FindworkSource
from app.services.sources.weworkremotely import WeWorkRemotelySource
from app.services.sources.adzuna import AdzunaSource
from app.services.sources.jooble import JoobleSource
from app.services.sources.upwork import UpworkSource
from app.services.sources.workingnomads import WorkingNomadsSource
from app.services.sources.jobspresso import JobspressoSource
from app.services.sources.remoteco import RemoteCoSource
from app.services.sources.europeremotely import EuropeRemotelySource

ALL_SOURCES: dict[str, BaseSource] = {}


def register_source(source: BaseSource):
    ALL_SOURCES[source.name] = source


register_source(HimalayasSource())
register_source(RemoteOKSource())
register_source(RemotiveSource())
register_source(GreenhouseSource())
register_source(LeverSource())
register_source(AshbySource())
register_source(HNHiringSource())
register_source(ArbeitnowSource())
register_source(FindworkSource())
register_source(WeWorkRemotelySource())
register_source(AdzunaSource())
register_source(JoobleSource())
register_source(UpworkSource())
register_source(WorkingNomadsSource())
register_source(JobspressoSource())
register_source(RemoteCoSource())
register_source(EuropeRemotelySource())


def get_source(name: str) -> BaseSource | None:
    return ALL_SOURCES.get(name)


def get_all_sources() -> dict[str, BaseSource]:
    return ALL_SOURCES.copy()
