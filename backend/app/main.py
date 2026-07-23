from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import leads, proposals, agents, analytics, search, notifications, crm

app = FastAPI(
    title="MMA Business Prosperity Weapon API",
    description="AI-powered Business Development Platform Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(proposals.router, prefix="/api/proposals", tags=["Proposals"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(search.router, prefix="/api/search", tags=["AI Search"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(crm.router, prefix="/api/crm", tags=["CRM"])

@app.get("/")
async def root():
    return {
        "name": "MMA Business Prosperity Weapon",
        "version": "1.0.0",
        "status": "operational",
        "agents": {
            "opportunity_hunter": "active",
            "lead_analyzer": "active",
            "proposal_generator": "active",
        },
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
