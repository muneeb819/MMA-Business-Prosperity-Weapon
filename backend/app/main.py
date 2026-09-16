from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
import re
from starlette.middleware.base import BaseHTTPMiddleware
from app.models.database import create_tables
from app.routers import leads, proposals, agents, analytics, search, notifications, crm, ai, connectors, knowledge, auth, admin, reports, websocket, lead_sources, ai_teams, outreach, settings, acie, hubspot
from app.routers.auth import get_current_user
from app.middleware.error_handler import ErrorHandlerMiddleware

# --- Fail fast on insecure/missing secrets in production ---------------------
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
_DEFAULT_JWT_SECRET = "mbpw-dev-secret-change-in-prod"
if ENVIRONMENT == "production" and os.getenv("JWT_SECRET", _DEFAULT_JWT_SECRET) == _DEFAULT_JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET must be set to a strong, unique value in production. "
        "Refusing to start with the default development secret."
    )

app = FastAPI(
    title="MMA Business Prosperity Weapon API",
    description="AI-powered Business Development Platform Backend",
    version="2.0.1",
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

# --- CORS: real allow-list instead of "*" + credentials -----------------------
_default_origins = "http://localhost:3000"
_allowed_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
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


# --- Routers -------------------------------------------------------------------
# Every business-data router now requires an authenticated user via the
# router-level `dependencies=` list. Only /api/auth (login/register) and the
# health/root endpoints remain open. Webhook/cron-style endpoints that cannot
# carry a user JWT (e.g. the outreach cron) are protected separately inside
# their own router using a shared-secret header check.
_auth_dep = [Depends(get_current_user)]

app.include_router(leads.router, prefix="/api/leads", tags=["Leads"], dependencies=_auth_dep)
app.include_router(proposals.router, prefix="/api/proposals", tags=["Proposals"], dependencies=_auth_dep)
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"], dependencies=_auth_dep)
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"], dependencies=_auth_dep)
app.include_router(search.router, prefix="/api/search", tags=["AI Search"], dependencies=_auth_dep)
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"], dependencies=_auth_dep)
app.include_router(crm.router, prefix="/api/crm", tags=["CRM"], dependencies=_auth_dep)
app.include_router(ai.router, prefix="/api/ai", tags=["AI Services"], dependencies=_auth_dep)
app.include_router(connectors.router, prefix="/api/connectors", tags=["Connectors"], dependencies=_auth_dep)
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Base"], dependencies=_auth_dep)
app.include_router(auth.router)  # login/register must stay open
app.include_router(admin.router)  # already enforces require_role internally
app.include_router(reports.router)  # already enforces get_current_user internally
app.include_router(websocket.router)
app.include_router(lead_sources.router, dependencies=_auth_dep)
app.include_router(ai_teams.router, prefix="/api/ai-teams", tags=["AI Teams"], dependencies=_auth_dep)
app.include_router(outreach.router, prefix="/api/outreach", tags=["Outreach"])  # /cron is secret-guarded; other routes auth internally
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"], dependencies=_auth_dep)
app.include_router(acie.router, prefix="/api/acie", tags=["ACIE"])  # already enforces auth internally
app.include_router(hubspot.router, prefix="/api/hubspot", tags=["HubSpot"])  # already enforces auth internally


@app.get("/")
async def root():
    return {
        "name": "MMA Business Prosperity Weapon",
        "version": "2.0.1",
        "status": "operational",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
