from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.services.sync import sync_source, sync_all_sources, get_source_status

router = APIRouter()


@router.get("/api/lead-sources")
def list_sources():
    return get_source_status()


@router.post("/api/lead-sources/sync/{source_name}")
async def trigger_sync(source_name: str, limit: int = 50, db: Session = Depends(get_db)):
    result = await sync_source(source_name, db, limit=limit)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/api/lead-sources/sync-all")
async def trigger_sync_all(limit: int = 30, db: Session = Depends(get_db)):
    results = await sync_all_sources(db, limit_per_source=limit)
    total_new = sum(r.get("new", 0) for r in results.values() if isinstance(r, dict))
    total_fetched = sum(r.get("fetched", 0) for r in results.values() if isinstance(r, dict))
    return {
        "results": results,
        "summary": {
            "sources_synced": len(results),
            "total_fetched": total_fetched,
            "total_new": total_new,
        },
    }
