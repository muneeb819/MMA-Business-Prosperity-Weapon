from sqlalchemy import Column, Unicode, Float, Integer, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database_types import LONG_TEXT
from app.models.database import Base
from datetime import datetime
import uuid

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Unicode(128), primary_key=True)
    title = Column(Unicode(512), nullable=False)
    description = Column(LONG_TEXT)
    client_name = Column(Unicode(255))
    company = Column(Unicode(255))
    email = Column(Unicode(320))
    phone = Column(Unicode(255))
    country = Column(Unicode(255))
    budget_min = Column(Float)
    budget_max = Column(Float)
    deadline = Column(Unicode(255))
    technologies = Column(JSON, default=[])
    skills = Column(JSON, default=[])
    platform = Column(Unicode(255))
    job_type = Column(Unicode(255))
    status = Column(Unicode(255), default="new")
    urgency = Column(Unicode(255), default="medium")
    difficulty = Column(Float, default=50)
    success_probability = Column(Float, default=50)
    risk_level = Column(Unicode(255), default="medium")
    expected_revenue = Column(Float, default=0)
    competition = Column(Integer, default=0)
    project_size = Column(Unicode(255), default="medium")
    payment_method = Column(Unicode(255), default="Escrow")
    client_history = Column(LONG_TEXT)
    url = Column(Unicode(2048))
    notes = Column(LONG_TEXT)
    tags = Column(JSON, default=[])
    found_at = Column(DateTime, default=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)
    
    proposals = relationship("Proposal", back_populates="lead", primaryjoin="Lead.id==Proposal.lead_id", foreign_keys="Proposal.lead_id")

class Proposal(Base):
    __tablename__ = "proposals"
    
    id = Column(Unicode(128), primary_key=True)
    lead_id = Column(Unicode(128))  # FK handled at app level
    title = Column(Unicode(512), nullable=False)
    cover_letter = Column(LONG_TEXT)
    introduction = Column(LONG_TEXT)
    technical_plan = Column(LONG_TEXT)
    timeline = Column(Unicode(255))
    cost_estimate = Column(LONG_TEXT)
    portfolio_suggestions = Column(JSON, default=[])
    call_to_action = Column(LONG_TEXT)
    win_probability = Column(Float, default=0)
    status = Column(Unicode(255), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    
    lead = relationship("Lead", back_populates="proposals", primaryjoin="Proposal.lead_id==Lead.id", foreign_keys="Proposal.lead_id")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Unicode(128), primary_key=True)
    name = Column(Unicode(255), nullable=False)
    industry = Column(Unicode(255))
    country = Column(Unicode(255))
    website = Column(Unicode(2048))
    revenue = Column(Float, default=0)
    status = Column(Unicode(255), default="prospect")
    notes = Column(LONG_TEXT)
    created_at = Column(DateTime, default=datetime.utcnow)

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Unicode(128), primary_key=True)
    name = Column(Unicode(255), nullable=False)
    email = Column(Unicode(320))
    phone = Column(Unicode(255))
    role = Column(Unicode(255))
    company_id = Column(Unicode(128))  # FK handled at app level

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Unicode(128), primary_key=True)
    type = Column(Unicode(255))
    title = Column(Unicode(512))
    message = Column(LONG_TEXT)
    lead_id = Column(Unicode(128), nullable=True)  # FK handled at app level
    read = Column(Boolean, default=False)
    priority = Column(Unicode(255), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

class Connector(Base):
    __tablename__ = "connectors"
    
    id = Column(Unicode(128), primary_key=True)
    name = Column(Unicode(255), nullable=False)
    type = Column(Unicode(255), nullable=False)
    platform = Column(Unicode(255))
    status = Column(Unicode(255), default="inactive")
    config = Column(JSON, default={})
    last_sync_at = Column(DateTime, nullable=True)
    sync_count = Column(Integer, default=0)
    leads_found = Column(Integer, default=0)
    error_message = Column(LONG_TEXT, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    
    id = Column(Unicode(128), primary_key=True)
    agent_id = Column(Unicode(128))
    action = Column(Unicode(255))
    details = Column(LONG_TEXT)
    status = Column(Unicode(255), default="success")
    timestamp = Column(DateTime, default=datetime.utcnow)


class Outreach(Base):
    __tablename__ = "outreach"

    id = Column(Unicode(128), primary_key=True)
    lead_id = Column(Unicode(128), nullable=True)  # FK handled at app level
    client_name = Column(Unicode(255))
    company = Column(Unicode(255))
    email = Column(Unicode(320))
    channel = Column(Unicode(255), default="email")
    step = Column(Integer, default=0)
    step_label = Column(Unicode(512))
    subject = Column(Unicode(512))
    body_text = Column(LONG_TEXT)
    status = Column(Unicode(255), default="simulated")
    simulated = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OutreachState(Base):
    """Per-lead automation state for the progressive outreach engine."""

    __tablename__ = "outreach_states"

    lead_id = Column(Unicode(128), primary_key=True)  # FK handled at app level
    enrolled = Column(Boolean, default=True)
    current_step = Column(Integer, default=-1)
    status = Column(Unicode(255), default="active")
    last_sent_at = Column(DateTime, nullable=True)
    next_due_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class KnowledgeEntry(Base):
    __tablename__ = "knowledge_base"

    id = Column(Unicode(128), primary_key=True)
    title = Column(Unicode(512), nullable=False)
    entry_type = Column(Unicode(255), nullable=False)
    content = Column(LONG_TEXT, nullable=False)
    tags = Column(JSON, default=[])
    source = Column(Unicode(255), default="")
    source_url = Column(Unicode(2048), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AppConfig(Base):
    __tablename__ = "app_config"

    key = Column(Unicode(128), primary_key=True)
    value = Column(LONG_TEXT)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ContactIntel(Base):
    """ACIE contact record — the decision object that drives outreach.

    Mirrors the pipeline: Identity -> Employment -> Email -> Phone -> Sources ->
    Intelligence -> Lifecycle. Key scalars are queryable; the full profile is
    kept as structured JSON for the decision engine.
    """
    __tablename__ = "contact_intel"

    lead_id = Column(Unicode(128), primary_key=True)  # ties to a lead (client company)
    person_id = Column(Unicode(128), index=True, nullable=True)  # resolved person identity id
    name = Column(Unicode(255))                               # contact person name (if known)
    company = Column(Unicode(255))
    domain = Column(Unicode(255))
    title = Column(Unicode(512))
    email = Column(Unicode(320))
    phone = Column(Unicode(255))
    lifecycle = Column(Unicode(255), default="DISCOVERED")
    channel = Column(Unicode(255), default="email")
    contact_confidence = Column(Float, default=0)
    identity_confidence = Column(Float, default=0)
    employment_confidence = Column(Float, default=0)
    email_confidence = Column(Float, default=0)
    phone_confidence = Column(Float, default=0)
    risk_score = Column(Float, default=0)
    freshness_score = Column(Float, default=0)
    verification_status = Column(Unicode(255), default="unknown")
    supply_status = Column(Unicode(255), default="ok")
    provider = Column(Unicode(128), default="")
    profile = Column(JSON, default={})
    last_contacted = Column(DateTime, nullable=True)
    last_verified = Column(DateTime, nullable=True)
    next_verification = Column(DateTime, nullable=True)
    bounce_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProviderPerformance(Base):
    """Learning engine store: per-provider evidence quality."""
    __tablename__ = "provider_performance"

    provider = Column(Unicode(128), primary_key=True)
    event_type = Column(Unicode(128), primary_key=True)
    count = Column(Integer, default=0)
    weighted = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OutreachFeedback(Base):
    """Captured outreach outcome for the feedback intelligence loop."""
    __tablename__ = "outreach_feedback"

    id = Column(Unicode(128), primary_key=True)
    lead_id = Column(Unicode(128), index=True)
    channel = Column(Unicode(255), default="email")
    outcome = Column(Unicode(255), default="no_response")
    provider = Column(Unicode(128), default="")
    confidence_at_time = Column(Float, default=0)
    detail = Column(LONG_TEXT)
    created_at = Column(DateTime, default=datetime.utcnow)
