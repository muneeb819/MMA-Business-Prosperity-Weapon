# Security Fixes Applied

This is a patched version of the MMA Business Prosperity Weapon codebase, addressing
findings from the full project audit. Changes:

1. **Global endpoint authentication** (`backend/app/main.py`)
   - Every business-data router (leads, proposals, agents, analytics, search,
     notifications, crm, ai, connectors, knowledge, lead_sources, ai-teams,
     settings) now requires a valid JWT via a router-level
     `dependencies=[Depends(get_current_user)]`.
   - Only `/api/auth/register` and `/api/auth/login` remain fully open (as they must).
   - `admin.py`, `reports.py`, `acie.py`, and `hubspot.py` already enforced auth
     internally and are left as-is.
   - `outreach.py`: all routes now require a user JWT **except** `/api/outreach/cron`,
     which is a Vercel Cron target and cannot carry a user token. That endpoint now
     *requires* `CRON_SECRET` to be set (previously optional) and validates it on
     every call.

2. **Removed hardcoded admin credentials** (`backend/app/models/seed.py`)
   - The `admin@mbpw.com` / `admin123` default account is gone.
   - An initial superadmin is now only created if `ADMIN_INITIAL_PASSWORD` is
     explicitly set in the environment; otherwise bootstrap is skipped and the
     first user should be created via `/api/auth/register` then promoted via
     the admin API.

3. **Enforced JWT secret in production** (`backend/app/main.py`)
   - If `ENVIRONMENT=production` and `JWT_SECRET` is unset (or still the
     dev default), the app now refuses to start instead of silently using a
     known/shared secret.

4. **Locked down CORS**
   - Replaced `allow_origins=["*"]` with an explicit allow-list read from
     `ALLOWED_ORIGINS` (comma-separated), defaulting to `http://localhost:3000`
     for local dev.

5. **Removed the committed SQLite database file** (`backend/mbpw.db`)
   - It was already listed in `.gitignore` but had been committed previously;
     removed from this snapshot. Recommend purging it from git history
     (`git filter-repo` or BFG) if this repo has public/shared visibility.

## Action required before deploying
- Set `JWT_SECRET`, `CRON_SECRET`, and (optionally) `ADMIN_INITIAL_PASSWORD` in
  your environment. See `.env.example`.
- Set `ALLOWED_ORIGINS` to your real frontend domain(s).
- Update your Vercel Cron config (or any external caller) to pass
  `CRON_SECRET` — the cron endpoint will now return 500 without it.
- Confirm your frontend sends `Authorization: Bearer <token>` on every API
  call (it already stores the JWT from login/register — verify this is
  attached to axios/fetch calls for the routers listed above).

## Not fixed here (needs product/design decisions, flagged in the audit)
- The 15-agent "AI Teams" dashboard still simulates activity with a seeded
  RNG rather than running real agents — decide whether to wire it to real
  work or relabel it as a demo/simulation view.
- README's "client-side localStorage" description still doesn't match the
  actual server-side `sync.py` pipeline — needs a documentation pass.


## Additional fixes in this pass

6. **README corrected to match actual architecture**
   - Removed the inaccurate "leads fetched client-side / stored only in
     localStorage" description. The README now correctly documents that
     leads and proposals are persisted server-side (`backend/app/services/sync.py`
     → the `Lead` table), with localStorage used only as a display cache.
   - Added an explicit note that the 15-agent "AI Teams" dashboard
     (`/ai-teams`) currently renders simulated metrics from a seeded
     random generator, distinct from the 3 real automation agents in
     `backend/app/routers/agents.py` and the ACIE outreach pipeline.

7. **Fixed a broken Docker Compose deploy path**
   - `docker-compose.yml` referenced `Dockerfile.frontend`, which did not
     exist in the repo — `docker-compose up` would have failed immediately.
     Added a working multi-stage `Dockerfile.frontend` (Next.js build + run).

## Previously flagged items now considered resolved
- The "AI Teams" simulation vs. real-agent confusion is no longer a silent
  discrepancy — it's now explicitly documented in the README rather than
  fixed in code, since making all 15 agents do real work is a product
  decision (which real tasks should each map to?) beyond a pure bug fix.
  Flag this to your team if you want them wired to genuine work queues.
