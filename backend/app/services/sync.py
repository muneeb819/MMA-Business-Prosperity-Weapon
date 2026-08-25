import asyncio
import hashlib
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.schema import Lead
from app.services.sources import get_all_sources, get_source
from app.services.sources.base import NormalizedJob


def _make_id(job: NormalizedJob) -> str:
    raw = f"{job.title}|{job.company}|{job.url}"
    return hashlib.md5(raw.encode()).hexdigest()[:16]


def _guess_country(job: NormalizedJob) -> str:
    if job.country:
        return job.country
    loc = job.location.lower()
    mapping = {
        "united states": "United States", "usa": "United States", "us": "United States",
        "san francisco": "United States", "new york": "United States", "seattle": "United States",
        "austin": "United States", "boston": "United States", "chicago": "United States",
        "los angeles": "United States", "remote (us)": "United States",
        "united kingdom": "United Kingdom", "uk": "United Kingdom", "london": "United Kingdom",
        "germany": "Germany", "berlin": "Germany", "munich": "Germany",
        "canada": "Canada", "toronto": "Canada", "vancouver": "Canada",
        "india": "India", "bangalore": "India", "mumbai": "India",
        "australia": "Australia", "sydney": "Australia", "melbourne": "Australia",
        "france": "France", "paris": "France",
        "netherlands": "Netherlands", "amsterdam": "Netherlands",
        "brazil": "Brazil", "sao paulo": "Brazil",
        "japan": "Japan", "tokyo": "Japan",
        "singapore": "Singapore",
        "europe": "Europe", "eu": "Europe",
        "worldwide": "Global", "global": "Global", "anywhere": "Global",
    }
    for key, val in mapping.items():
        if key in loc:
            return val
    return "Global"


def _guess_revenue(job: NormalizedJob) -> float:
    if job.salary_max > 0:
        return job.salary_max * 0.3
    title_lower = job.title.lower()
    if any(w in title_lower for w in ["enterprise", "director", "vp", "head of", "principal"]):
        return 100000
    if any(w in title_lower for w in ["senior", "lead", "staff"]):
        return 50000
    if any(w in title_lower for w in ["mid", "intermediate"]):
        return 30000
    return 20000


def _guess_urgency(job: NormalizedJob) -> str:
    if not job.published_at:
        return "medium"
    age_hours = (datetime.utcnow() - job.published_at.replace(tzinfo=None)).total_seconds() / 3600
    if age_hours < 24:
        return "high"
    if age_hours < 72:
        return "medium"
    return "low"


def _guess_project_size(job: NormalizedJob) -> str:
    title_lower = job.title.lower()
    if any(w in title_lower for w in ["enterprise", "large scale", "complex", "platform"]):
        return "large"
    if any(w in title_lower for w in ["senior", "lead", "full stack", "architect"]):
        return "medium"
    return "small"


def job_to_lead(job: NormalizedJob) -> dict:
    lead_data = {
        "id": f"live-{_make_id(job)}",
        "title": job.title,
        "description": job.description,
        "client_name": job.company,
        "company": job.company,
        "email": "",
        "phone": "",
        "country": _guess_country(job),
        "budget_min": job.salary_min,
        "budget_max": job.salary_max,
        "deadline": "",
        "technologies": job.technologies,
        "skills": job.skills,
        "platform": job.source_name,
        "job_type": job.job_type or "full_time",
        "status": "new",
        "urgency": _guess_urgency(job),
        "difficulty": 50,
        "success_probability": 60,
        "risk_level": "medium",
        "expected_revenue": _guess_revenue(job),
        "competition": 0,
        "project_size": _guess_project_size(job),
        "payment_method": "Escrow",
        "client_history": f"Sourced from {job.source_name}",
        "url": job.url,
        "notes": f"Auto-discovered from {job.source_name} on {datetime.utcnow().strftime('%Y-%m-%d')}",
        "tags": job.tags + [job.source_name],
        "found_at": job.published_at or datetime.utcnow(),
        "analyzed_at": None,
    }

    try:
        from app.services import enrichment

        _enr = enrichment.enrich(job.company, verify=False)
        if _enr.get("email"):
            lead_data["email"] = _enr["email"]
            lead_data["tags"] = lead_data["tags"] + [f"enriched:{_enr['source']}"]
    except Exception:  # noqa: BLE001
        pass

    return lead_data


async def sync_source(source_name: str, db: Session, limit: int = 50) -> dict:
    source = get_source(source_name)
    if not source:
        return {"error": f"Source '{source_name}' not found"}
    try:
        raw_jobs = await source.fetch(limit=limit)
    except Exception as e:
        return {"error": str(e), "source": source_name, "fetched": 0, "new": 0, "updated": 0}

    fetched = len(raw_jobs)
    new_count = 0
    updated_count = 0

    for job in raw_jobs:
        lead_data = job_to_lead(job)
        existing = db.query(Lead).filter(Lead.id == lead_data["id"]).first()
        if existing:
            existing.title = lead_data["title"]
            existing.description = lead_data["description"]
            existing.notes = lead_data["notes"]
            existing.tags = lead_data["tags"]
            updated_count += 1
        else:
            db_lead = Lead(**{k: v for k, v in lead_data.items() if hasattr(Lead, k)})
            db.add(db_lead)
            new_count += 1

    db.commit()
    return {
        "source": source_name,
        "fetched": fetched,
        "new": new_count,
        "updated": updated_count,
    }


async def sync_all_sources(db: Session, limit_per_source: int = 30) -> dict:
    results = {}
    sources = get_all_sources()
    tasks = []
    for name, source in sources.items():
        if source.requires_key:
            continue
        tasks.append(sync_source(name, db, limit=limit_per_source))

    done = await asyncio.gather(*tasks, return_exceptions=True)
    for result in done:
        if isinstance(result, dict):
            results[result.get("source", "unknown")] = result
        else:
            results["error"] = {"error": str(result)}
    return results


def get_source_status() -> List[dict]:
    sources = get_all_sources()
    return [
        {
            "name": s.name,
            "display_name": s.display_name,
            "source_type": s.source_type,
            "url": s.url,
            "requires_key": s.requires_key,
        }
        for s in sources.values()
    ]
