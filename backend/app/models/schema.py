from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base
from datetime import datetime
import uuid

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    client_name = Column(String)
    company = Column(String)
    email = Column(String)
    phone = Column(String)
    country = Column(String)
    budget_min = Column(Float)
    budget_max = Column(Float)
    deadline = Column(String)
    technologies = Column(JSON, default=[])
    skills = Column(JSON, default=[])
    platform = Column(String)
    job_type = Column(String)
    status = Column(String, default="new")
    urgency = Column(String, default="medium")
    difficulty = Column(Float, default=50)
    success_probability = Column(Float, default=50)
    risk_level = Column(String, default="medium")
    expected_revenue = Column(Float, default=0)
    competition = Column(Integer, default=0)
    project_size = Column(String, default="medium")
    payment_method = Column(String, default="Escrow")
    client_history = Column(Text)
    url = Column(String)
    notes = Column(Text)
    tags = Column(JSON, default=[])
    found_at = Column(DateTime, default=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)
    
    proposals = relationship("Proposal", back_populates="lead", primaryjoin="Lead.id==Proposal.lead_id", foreign_keys="Proposal.lead_id")

class Proposal(Base):
    __tablename__ = "proposals"
    
    id = Column(String, primary_key=True)
    lead_id = Column(String)  # FK handled at app level
    title = Column(String, nullable=False)
    cover_letter = Column(Text)
    introduction = Column(Text)
    technical_plan = Column(Text)
    timeline = Column(String)
    cost_estimate = Column(Text)
    portfolio_suggestions = Column(JSON, default=[])
    call_to_action = Column(Text)
    win_probability = Column(Float, default=0)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    
    lead = relationship("Lead", back_populates="proposals", primaryjoin="Proposal.lead_id==Lead.id", foreign_keys="Proposal.lead_id")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    industry = Column(String)
    country = Column(String)
    website = Column(String)
    revenue = Column(Float, default=0)
    status = Column(String, default="prospect")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    role = Column(String)
    company_id = Column(String)  # FK handled at app level

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True)
    type = Column(String)
    title = Column(String)
    message = Column(Text)
    lead_id = Column(String, nullable=True)  # FK handled at app level
    read = Column(Boolean, default=False)
    priority = Column(String, default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

class Connector(Base):
    __tablename__ = "connectors"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    platform = Column(String)
    status = Column(String, default="inactive")
    config = Column(JSON, default={})
    last_sync_at = Column(DateTime, nullable=True)
    sync_count = Column(Integer, default=0)
    leads_found = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    
    id = Column(String, primary_key=True)
    agent_id = Column(String)
    action = Column(String)
    details = Column(Text)
    status = Column(String, default="success")
    timestamp = Column(DateTime, default=datetime.utcnow)


class Outreach(Base):
    __tablename__ = "outreach"

    id = Column(String, primary_key=True)
    lead_id = Column(String, nullable=True)  # FK handled at app level
    client_name = Column(String)
    company = Column(String)
    email = Column(String)
    channel = Column(String, default="email")
    step = Column(Integer, default=0)
    step_label = Column(String)
    subject = Column(String)
    body_text = Column(Text)
    status = Column(String, default="simulated")
    simulated = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OutreachState(Base):
    """Per-lead automation state for the progressive outreach engine."""

    __tablename__ = "outreach_states"

    lead_id = Column(String, primary_key=True)  # FK handled at app level
    enrolled = Column(Boolean, default=True)
    current_step = Column(Integer, default=-1)
    status = Column(String, default="active")
    last_sent_at = Column(DateTime, nullable=True)
    next_due_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class KnowledgeEntry(Base):
    __tablename__ = "knowledge_base"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    entry_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=[])
    source = Column(String, default="")
    source_url = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AppConfig(Base):
    __tablename__ = "app_config"

    key = Column(String, primary_key=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)


class ContactIntel(Base):
    """ACIE contact record — the decision object that drives outreach.

    Mirrors the pipeline: Identity -> Employment -> Email -> Phone -> Sources ->
    Intelligence -> Lifecycle. Key scalars are queryable; the full profile is
    kept as structured JSON for the decision engine.
    """
    __tablename__ = "contact_intel"

    lead_id = Column(String, primary_key=True)  # ties to a lead (client company)
    person_id = Column(String, index=True, nullable=True)  # resolved person identity id
    name = Column(String)                               # contact person name (if known)
    company = Column(String)
    domain = Column(String)
    title = Column(String)
    email = Column(String)
    phone = Column(String)
    lifecycle = Column(String, default="DISCOVERED")
    channel = Column(String, default="email")
    contact_confidence = Column(Float, default=0)
    identity_confidence = Column(Float, default=0)
    employment_confidence = Column(Float, default=0)
    email_confidence = Column(Float, default=0)
    phone_confidence = Column(Float, default=0)
    risk_score = Column(Float, default=0)
    freshness_score = Column(Float, default=0)
    verification_status = Column(String, default="unknown")
    supply_status = Column(String, default="ok")
    provider = Column(String, default="")
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

    provider = Column(String, primary_key=True)
    event_type = Column(String, primary_key=True)
    count = Column(Integer, default=0)
    weighted = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class OutreachFeedback(Base):
    """Captured outreach outcome for the feedback intelligence loop."""
    __tablename__ = "outreach_feedback"

    id = Column(String, primary_key=True)
    lead_id = Column(String, index=True)
    channel = Column(String, default="email")
    outcome = Column(String, default="no_response")
    provider = Column(String, default="")
    confidence_at_time = Column(Float, default=0)
    detail = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
