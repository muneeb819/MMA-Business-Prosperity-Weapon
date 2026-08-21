# MBPW - MMA Business Prosperity Weapon

> AI-powered business development platform that hunts opportunities, generates proposals, and automates outreach across global job markets.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://full-repo.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)

**Live:** [full-repo.vercel.app](https://full-repo.vercel.app) | **Login:** dmin@mbpw.com / dmin123

---

## What It Does

The platform runs a full **4-stage pipeline**:

| Stage | Description |
|-------|-------------|
| **Hunting** | Fetches real leads from 6 live job boards client-side (Himalayas, RemoteOK, Remotive, We Work Remotely, Arbeitnow, Findwork) |
| **Landing** | Leads stored in browser localStorage, viewable across Leads, Opportunity Hunter, and Proposals pages |
| **Outreach** | AI generates tailored proposals using OpenAI (cover letter, technical plan, cost estimate, call to action) |
| **Response** | Submit proposals, send emails via SMTP (falls back to mailto: links), track status through pipeline |

---

## Pages

| Route | Purpose |
|-------|---------|
| / | Dashboard with live stats, charts, activity feed |
| /leads | Browse, filter, sort all live leads from 6 job boards |
| /opportunity-hunter | Start Hunter to fetch leads, Auto-Outreach to generate proposals |
| /proposals | Generate AI proposals, submit, send email, export PDF |
| /ai-search | Natural language search across leads and proposals |
| /connectors | Manage job board connectors, trigger sync |
| /crm | Company and contact management |
| /knowledge | Knowledge base entries |
| /analytics | Charts and metrics |
| /reports | Pipeline analysis, performance reports |
| /admin | System stats, user management, audit logs |
| /calendar | Monthly view with events |
| /team | Team cards with performance |
| /notifications | Notification center |
| /settings | Profile, preferences, billing |
| /favorites | Bookmarked items |
| /login | JWT authentication |

---

## Tech Stack

### Frontend
- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS v4** + Radix UI primitives
- **Recharts** (charts), **Framer Motion** (animations)
- **Lucide** icons, **shadcn/ui** components

### Backend (FastAPI - Vercel Serverless)
- Python 3.12 + FastAPI + SQLAlchemy
- OpenAI API for AI proposal generation
- JWT auth with RBAC middleware
- Mangum adapter for Vercel serverless

### Data Architecture
- **Leads:** Fetched client-side from 6 public job board APIs, stored in localStorage
- **Proposals:** Generated via backend AI, stored in localStorage
- **Backend:** In-memory SQLite (ephemeral), used only for AI generation and email sending
- All data persists across page loads via localStorage (survives Vercel cold starts)

---

## Quick Start

`ash
git clone https://github.com/muneeb819/MMA-Business-Prosperity-Weapon.git
cd MMA-Business-Prosperity-Weapon
npm install
npm run dev
`

Frontend runs on http://localhost:3000.

Backend (optional, for AI proposal generation):
`ash
pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --port 8001
`

---

## Deployment

Deployed on Vercel with dual builds (Next.js frontend + Python serverless backend):

`ash
npx vercel --prod
`

The ercel.json configures:
- @vercel/next for the frontend
- @vercel/python for /api/index.py (FastAPI via Mangum)
- Rewrites all /api/* routes to the Python handler

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| NEXT_PUBLIC_API_URL | Backend API base URL | Yes (default: http://localhost:8001) |
| OPENAI_API_KEY | For AI proposal generation | Optional (falls back to template proposals) |
| SMTP_HOST | Email server host | Optional (falls back to mailto: links) |
| SMTP_USER | Email username | Optional |
| SMTP_PASSWORD | Email password | Optional |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login, returns JWT |
| POST | /api/auth/register | Register new user |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/leads | List all leads |
| POST | /api/leads | Create lead |
| PUT | /api/leads/{id} | Update lead |
| DELETE | /api/leads/{id} | Delete lead |
| POST | /api/leads/{id}/analyze | AI analysis |

### Proposals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/proposals | List all proposals |
| POST | /api/proposals | Create proposal |
| POST | /api/proposals/generate | AI-generate proposal (accepts leadData) |
| POST | /api/proposals/{id}/submit | Submit proposal |
| POST | /api/proposals/{id}/send-email | Send proposal via email |

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/agents | List all agents |
| POST | /api/agents/{id}/run | Run agent (fetch/analyze/generate) |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | List notifications |
| GET | /api/reports/pipeline | Pipeline report |
| GET | /api/reports/performance | Performance report |
| GET | /api/admin/system/stats | System statistics |
| POST | /api/lead-sources/sync-all | Sync all lead sources |
| POST | /api/search/natural-language | AI search |

---

## Live Job Board Sources

All sources are fetched **client-side** (no API keys needed):

| Source | API | Type |
|--------|-----|------|
| Himalayas | himalayas.app/jobs/api | JSON API |
| RemoteOK | emoteok.com/api | JSON API |
| Remotive | emotive.com/remote-jobs/feed | RSS/XML |
| We Work Remotely | weworkremotely.com/remote-jobs.rss | RSS/XML |
| Arbeitnow | rbeitnow.com/api/job-board-api | JSON API |
| Findwork | indwork.dev/api/jobs/ | JSON API |

---

## Project Structure

`
MMA-Business-Prosperity-Weapon/
├── api/
│   ├── index.py                  # Vercel serverless entry (Mangum)
│   └── requirements.txt          # Python deps for Vercel
├── backend/
│   └── app/
│       ├── main.py               # FastAPI app, CORS, middleware
│       ├── models/
│       │   ├── database.py       # SQLAlchemy + in-memory SQLite
│       │   ├── schema.py         # All DB models
│       │   └── seed.py           # Admin user seeding
│       ├── routers/              # 16 API routers
│       │   ├── auth.py           # JWT login/register, RBAC
│       │   ├── leads.py          # Leads CRUD + AI analysis
│       │   ├── proposals.py      # Proposals + AI generation + email
│       │   ├── agents.py         # Agent orchestration
│       │   ├── connectors.py     # Connector management + sync
│       │   ├── admin.py          # System stats, users, audit
│       │   ├── reports.py        # Pipeline & performance reports
│       │   └── ...
│       └── services/
│           ├── ai_service.py     # OpenAI integration
│           ├── sync.py           # Lead sync orchestrator
│           └── sources/          # 12 source fetchers
├── src/
│   ├── app/                      # 17 Next.js pages
│   ├── components/               # UI components
│   │   ├── opportunity-hunter/   # Hunter pipeline UI
│   │   ├── proposals/            # Proposal management UI
│   │   ├── leads/                # Lead browsing UI
│   │   └── ui/                   # shadcn primitives
│   └── lib/
│       ├── api.ts                # API client with JWT auth
│       ├── live-sources.ts       # Client-side job board fetchers
│       ├── pipeline.ts           # Shared localStorage helpers
│       └── types.ts              # TypeScript types
├── vercel.json                   # Vercel deployment config
└── package.json
`

---

## License

Private - MMA Business Prosperity Weapon
