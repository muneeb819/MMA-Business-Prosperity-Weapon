from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime


@dataclass
class NormalizedJob:
    title: str
    company: str
    description: str = ""
    url: str = ""
    location: str = ""
    country: str = ""
    salary_min: float = 0
    salary_max: float = 0
    currency: str = "USD"
    technologies: List[str] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)
    job_type: str = "full_time"
    remote: bool = False
    published_at: Optional[datetime] = None
    source_name: str = ""
    source_url: str = ""
    tags: List[str] = field(default_factory=list)


class BaseSource(ABC):
    name: str = "unknown"
    display_name: str = "Unknown Source"
    source_type: str = "api"
    url: str = ""
    requires_key: bool = False

    @abstractmethod
    async def fetch(self, limit: int = 50, **kwargs) -> List[NormalizedJob]:
        pass

    async def health_check(self) -> bool:
        try:
            jobs = await self.fetch(limit=1)
            return True
        except Exception:
            return False
