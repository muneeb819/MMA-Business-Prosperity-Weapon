from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import re
from starlette.middleware.base import BaseHTTPMiddleware
from app.models.database import create_tables
from app.routers import leads, proposals, agents, analytics, search, notifications, crm, ai, connectors, knowledge, auth, admin, reports, websocket, lead_sources, ai_teams, outreach, settings, acie
from app.middleware.error_handler import ErrorHandlerMiddleware

app = FastAPI(
    title="MMA Business Prosperity Weapon API",
    description="AI-powered Business Development Platform Backend",
    version="2.0.0",
    redirect_slashes=False,
)


class _TrailingSlashNormalizer(BaseHTTPMiddleware):
    """Vercel strips trailing slashes before invoking the serverless function, which
    made FastAPI's redirect_slashes loop forever. Normalize API resource roots
    internally (no HTTP redirect) so /api/leads matches the /api/leads/ route."""

    async def dispatch(self, request, call_next):
        path = request.scope.get("path", "")
        if re.fullmatch(r"/api/[\w-]+", path):
            request.scope["path"] = path + "/"
            request.scope["raw_path"] = (path + "/").encode()
        return await call_next(request)


app.add_middleware(_TrailingSlashNormalizer)
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
        from app.models.seed import _ensure_admin_user
        from app.models.database import SessionLocal
        db = SessionLocal()
        try:
            _ensure_admin_user(db)
        finally:
            db.close()
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
app.include_router(ai_teams.router, prefix="/api/ai-teams", tags=["AI Teams"])
app.include_router(outreach.router, prefix="/api/outreach", tags=["Outreach"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(acie.router, prefix="/api/acie", tags=["ACIE"])


@app.get("/")
async def root():
    return {
        "name": "MMA Business Prosperity Weapon",
        "version": "2.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
