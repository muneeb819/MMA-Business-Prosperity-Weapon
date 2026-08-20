from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import create_tables
from app.routers import leads, proposals, agents, analytics, search, notifications, crm, ai, connectors, knowledge, auth, admin, reports, websocket, lead_sources
from app.middleware.error_handler import ErrorHandlerMiddleware

app = FastAPI(
    title="MMA Business Prosperity Weapon API",
    description="AI-powered Business Development Platform Backend",
    version="2.0.0",
)

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def ensure_db(request: Request, call_next):
    create_tables()
    try:
        from app.models.database import seed_if_needed
        seed_if_needed()
    except Exception:
        pass
    return await call_next(request)


app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(proposals.router, prefix="/api/proposals", tags=["Proposals"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(search.router, prefix="/api/search", tags=["AI Search"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(crm.router, prefix="/api/crm", tags=["CRM"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Services"])
app.include_router(connectors.router, prefix="/api/connectors", tags=["Connectors"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Base"])
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(reports.router)
app.include_router(websocket.router)
app.include_router(lead_sources.router)


@app.post("/api/seed")
def seed_database():
    from app.models.seed import seed_all
    from app.models.database import SessionLocal
    db = SessionLocal()
    try:
        result = seed_all(db)
        return result
    finally:
        db.close()


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
