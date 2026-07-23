from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class CompanyBase(BaseModel):
    name: str
    industry: str
    country: str
    website: str
    notes: str = ""

class ContactBase(BaseModel):
    name: str
    email: str
    phone: str
    role: str
    company_id: str

@router.get("/companies")
async def get_companies():
    """Get all CRM companies."""
    return []

@router.post("/companies")
async def create_company(company: CompanyBase):
    """Create a new company."""
    return {**company.model_dump(), "id": "new-company-id"}

@router.get("/companies/{company_id}")
async def get_company(company_id: str):
    """Get a specific company."""
    raise HTTPException(status_code=404, detail="Company not found")

@router.put("/companies/{company_id}")
async def update_company(company_id: str, company: CompanyBase):
    """Update a company."""
    return {**company.model_dump(), "id": company_id}

@router.get("/contacts")
async def get_contacts():
    """Get all CRM contacts."""
    return []

@router.post("/contacts")
async def create_contact(contact: ContactBase):
    """Create a new contact."""
    return {**contact.model_dump(), "id": "new-contact-id"}

@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: str):
    """Get a specific contact."""
    raise HTTPException(status_code=404, detail="Contact not found")

@router.put("/contacts/{contact_id}")
async def update_contact(contact_id: str, contact: ContactBase):
    """Update a contact."""
    return {**contact.model_dump(), "id": contact_id}

@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str):
    """Delete a contact."""
    return {"message": "Contact deleted successfully"}
