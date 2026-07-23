from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class CountryStat(BaseModel):
    country: str
    count: int
    revenue: float

class TechStat(BaseModel):
    tech: str
    count: int

class MonthlyRevenue(BaseModel):
    month: str
    revenue: float
    proposals: int

class PlatformStat(BaseModel):
    platform: str
    leads: int

class AgentPerf(BaseModel):
    agent: str
    efficiency: float
    tasks: int

@router.get("/dashboard")
async def get_dashboard_analytics():
    """Get complete dashboard analytics."""
    return {
        "total_leads": 347,
        "total_proposals": 89,
        "win_rate": 67.4,
        "total_revenue": 428500,
        "avg_deal_size": 24800,
        "conversion_rate": 25.6,
    }

@router.get("/revenue")
async def get_revenue_analytics():
    """Get revenue analytics."""
    return {
        "monthly": [
            {"month": "Jan", "revenue": 28000, "proposals": 8},
            {"month": "Feb", "revenue": 42000, "proposals": 11},
            {"month": "Mar", "revenue": 35000, "proposals": 9},
        ],
        "forecast": {"next_month": 65000, "next_quarter": 180000},
    }

@router.get("/countries")
async def get_country_analytics():
    """Get country-based analytics."""
    return {
        "top_countries": [
            {"country": "United States", "count": 142, "revenue": 245000},
            {"country": "Germany", "count": 45, "revenue": 68000},
        ]
    }

@router.get("/technologies")
async def get_technology_analytics():
    """Get technology demand analytics."""
    return {
        "top_technologies": [
            {"tech": "React", "count": 89},
            {"tech": "Python", "count": 76},
        ]
    }

@router.get("/platforms")
async def get_platform_analytics():
    """Get platform breakdown analytics."""
    return {
        "platforms": [
            {"platform": "LinkedIn", "leads": 89},
            {"platform": "Upwork", "leads": 67},
        ]
    }

@router.get("/agents")
async def get_agent_analytics():
    """Get AI agent performance analytics."""
    return {
        "performance": [
            {"agent": "Opportunity Hunter", "efficiency": 94.2, "tasks": 1247},
            {"agent": "Lead Analyzer", "efficiency": 97.1, "tasks": 892},
            {"agent": "Proposal Generator", "efficiency": 92.8, "tasks": 634},
        ]
    }
