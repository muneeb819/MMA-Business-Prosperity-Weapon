from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.models.database import get_db
from app.models.schema import Company, Contact

router = APIRouter()


class CompanyBase(BaseModel):
    name: str
    industry: str = ""
    country: str = ""
    website: str = ""
    revenue: float = 0
    status: str = "prospect"
    notes: str = ""


class CompanyResponse(BaseModel):
    id: str
    name: str
    industry: str = ""
    country: str = ""
    website: str = ""
    revenue: float = 0
    status: str = "prospect"
    notes: str = ""
    contacts: List[dict] = []
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class CompanyListItem(BaseModel):
    id: str
    name: str
    industry: str = ""
    country: str = ""
    website: str = ""
    revenue: float = 0
    status: str = "prospect"
    notes: str = ""
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class ContactBase(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    role: str = ""
    company_id: Optional[str] = None


class ContactResponse(BaseModel):
    id: str
    name: str
    email: str = ""
    phone: str = ""
    role: str = ""
    company_id: Optional[str] = None

    class Config:
        from_attributes = True


def _company_to_dict(company: Company, contacts: List[Contact] = None) -> dict:
    return {
        "id": company.id,
        "name": company.name,
        "industry": company.industry or "",
        "country": company.country or "",
        "website": company.website or "",
        "revenue": company.revenue or 0,
        "status": company.status or "prospect",
        "notes": company.notes or "",
        "contacts": [
            {
                "id": c.id,
                "name": c.name,
                "email": c.email or "",
                "phone": c.phone or "",
                "role": c.role or "",
                "company_id": c.company_id,
            }
            for c in (contacts or [])
        ],
        "created_at": company.created_at.isoformat() if company.created_at else None,
    }


def _company_list_dict(company: Company) -> dict:
    return {
        "id": company.id,
        "name": company.name,
        "industry": company.industry or "",
        "country": company.country or "",
        "website": company.website or "",
        "revenue": company.revenue or 0,
        "status": company.status or "prospect",
        "notes": company.notes or "",
        "created_at": company.created_at.isoformat() if company.created_at else None,
    }


def _contact_to_dict(contact: Contact) -> dict:
    return {
        "id": contact.id,
        "name": contact.name,
        "email": contact.email or "",
        "phone": contact.phone or "",
        "role": contact.role or "",
        "company_id": contact.company_id,
    }


# --- Company Endpoints ---

@router.get("/companies", response_model=List[CompanyListItem])
def get_companies(
    search: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Company)

    if status:
        query = query.filter(Company.status == status)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Company.name.ilike(term),
                Company.industry.ilike(term),
                Company.country.ilike(term),
            )
        )

    companies = query.order_by(Company.created_at.desc()).offset(skip).limit(limit).all()
    return [_company_list_dict(c) for c in companies]


@router.get("/companies/{company_id}")
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    contacts = db.query(Contact).filter(Contact.company_id == company_id).all()
    return _company_to_dict(company, contacts)


@router.post("/companies", response_model=CompanyListItem, status_code=201)
def create_company(company: CompanyBase, db: Session = Depends(get_db)):
    db_company = Company(
        id=str(uuid.uuid4()),
        name=company.name,
        industry=company.industry,
        country=company.country,
        website=company.website,
        revenue=company.revenue,
        status=company.status,
        notes=company.notes,
        created_at=datetime.utcnow(),
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return _company_list_dict(db_company)


@router.put("/companies/{company_id}", response_model=CompanyListItem)
def update_company(company_id: str, company: CompanyBase, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    db_company.name = company.name
    db_company.industry = company.industry
    db_company.country = company.country
    db_company.website = company.website
    db_company.revenue = company.revenue
    db_company.status = company.status
    db_company.notes = company.notes

    db.commit()
    db.refresh(db_company)
    return _company_list_dict(db_company)


@router.delete("/companies/{company_id}")
def delete_company(company_id: str, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    db.query(Contact).filter(Contact.company_id == company_id).delete()
    db.delete(db_company)
    db.commit()
    return {"message": "Company and associated contacts deleted successfully"}


# --- Contact Endpoints ---

@router.get("/contacts", response_model=List[ContactResponse])
def get_contacts(
    search: Optional[str] = None,
    company_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Contact)

    if company_id:
        query = query.filter(Contact.company_id == company_id)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Contact.name.ilike(term),
                Contact.email.ilike(term),
                Contact.role.ilike(term),
            )
        )

    contacts = query.offset(skip).limit(limit).all()
    return [_contact_to_dict(c) for c in contacts]


@router.get("/contacts/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: str, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return _contact_to_dict(contact)


@router.post("/contacts", response_model=ContactResponse, status_code=201)
def create_contact(contact: ContactBase, db: Session = Depends(get_db)):
    db_contact = Contact(
        id=str(uuid.uuid4()),
        name=contact.name,
        email=contact.email,
        phone=contact.phone,
        role=contact.role,
        company_id=contact.company_id,
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return _contact_to_dict(db_contact)


@router.put("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: str, contact: ContactBase, db: Session = Depends(get_db)):
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db_contact.name = contact.name
    db_contact.email = contact.email
    db_contact.phone = contact.phone
    db_contact.role = contact.role
    db_contact.company_id = contact.company_id

    db.commit()
    db.refresh(db_contact)
    return _contact_to_dict(db_contact)


@router.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str, db: Session = Depends(get_db)):
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(db_contact)
    db.commit()
    return {"message": "Contact deleted successfully"}
