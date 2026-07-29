from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.models.database import get_db
from app.models.schema import KnowledgeEntry

router = APIRouter()


class KnowledgeEntryResponse(BaseModel):
    id: str
    title: str
    entry_type: str
    content: str
    tags: List[str] = []
    source: str = ""
    source_url: str = ""
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class KnowledgeCreateRequest(BaseModel):
    title: str
    entry_type: str
    content: str
    tags: List[str] = []
    source: str = ""
    source_url: str = ""


class KnowledgeUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    source: Optional[str] = None
    source_url: Optional[str] = None


def _entry_to_dict(entry: KnowledgeEntry) -> dict:
    return {
        "id": entry.id,
        "title": entry.title,
        "entryType": entry.entry_type,
        "content": entry.content,
        "tags": entry.tags or [],
        "source": entry.source or "",
        "sourceUrl": entry.source_url or "",
        "createdAt": entry.created_at.isoformat() if entry.created_at else None,
        "updatedAt": entry.updated_at.isoformat() if entry.updated_at else None,
    }


@router.get("/")
def list_knowledge(
    entry_type: Optional[str] = Query(None, alias="type"),
    tag: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(KnowledgeEntry)
    if entry_type:
        query = query.filter(KnowledgeEntry.entry_type == entry_type)
    if tag:
        query = query.filter(KnowledgeEntry.tags.any(tag))
    if search:
        query = query.filter(
            KnowledgeEntry.title.ilike(f"%{search}%")
            | KnowledgeEntry.content.ilike(f"%{search}%")
        )
    entries = query.order_by(desc(KnowledgeEntry.created_at)).offset(skip).limit(limit).all()
    return [_entry_to_dict(e) for e in entries]


@router.get("/{entry_id}")
def get_knowledge_entry(entry_id: str, db: Session = Depends(get_db)):
    entry = db.query(KnowledgeEntry).filter(KnowledgeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    return _entry_to_dict(entry)


@router.post("/", status_code=201)
def create_knowledge_entry(request: KnowledgeCreateRequest, db: Session = Depends(get_db)):
    entry = KnowledgeEntry(
        id=str(uuid.uuid4()),
        title=request.title,
        entry_type=request.entry_type,
        content=request.content,
        tags=request.tags,
        source=request.source,
        source_url=request.source_url,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _entry_to_dict(entry)


@router.put("/{entry_id}")
def update_knowledge_entry(entry_id: str, request: KnowledgeUpdateRequest, db: Session = Depends(get_db)):
    entry = db.query(KnowledgeEntry).filter(KnowledgeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    if request.title is not None:
        entry.title = request.title
    if request.content is not None:
        entry.content = request.content
    if request.tags is not None:
        entry.tags = request.tags
    if request.source is not None:
        entry.source = request.source
    if request.source_url is not None:
        entry.source_url = request.source_url
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return _entry_to_dict(entry)


@router.delete("/{entry_id}")
def delete_knowledge_entry(entry_id: str, db: Session = Depends(get_db)):
    entry = db.query(KnowledgeEntry).filter(KnowledgeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Knowledge entry deleted"}


@router.get("/types/list")
def get_entry_types(db: Session = Depends(get_db)):
    results = db.query(KnowledgeEntry.entry_type).distinct().all()
    return [r[0] for r in results]
