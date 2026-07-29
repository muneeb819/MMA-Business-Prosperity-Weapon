from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.database import create_tables
from app.routers import leads, proposals, agents, analytics, search, notifications, crm, ai, connectors, knowledge, auth, admin, reports, websocket
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


@app.on_event("startup")
def on_startup():
    create_tables()


app.include_router(leads.router)
app.include_router(proposals.router)
app.include_router(agents.router)
app.include_router(analytics.router)
app.include_router(search.router)
app.include_router(notifications.router)
app.include_router(crm.router)
app.include_router(ai.router)
app.include_router(connectors.router)
app.include_router(knowledge.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(reports.router)
app.include_router(websocket.router)


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
