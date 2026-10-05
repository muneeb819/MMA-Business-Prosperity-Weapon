# Release readiness: SQL Server target

**Review date:** 2026-10-05
**Target database:** `MMA_Business_Prosperity_Weapon` (Microsoft SQL Server)
**Working branch:** `arena/01a10c59-mma-business-prosperity-weapon`
**Base revision at start of this change:** `e97cb0a`

## Current decision

**Code checks pass, but this is not yet verified live-ready.** The app now has SQL Server support and refuses unsafe production database/secret configuration. The database name alone does not identify a server that Vercel can reach. No SQL Server host, SQL-authentication credentials, Vercel project access, or production deployment access were available in this workspace, so no real database connection, migration, or deployed login/API check has been performed.

Do not promote this change to production until the database endpoint is reachable from the deployment, the initial migration is applied to the intended database, and the live health/authenticated-data checks pass. The initial migration expects an empty application schema; inspect/back up first if the database already contains tables or data.

## Completed in this change

- Added `mssql+pymssql` support and configurable `SQLSERVER_*` environment settings, defaulting to database `MMA_Business_Prosperity_Weapon`, port `1433`, and required TLS.
- Made application schema strings bounded Unicode types and long text SQL Server-compatible; updated report date grouping for MSSQL.
- Updated Alembic URL resolution and regenerated the initial schema migration for the current metadata.
- Made production reject SQLite, asynchronous/unsupported PostgreSQL drivers, missing SQL Server credentials, and SQL Server URLs without required TLS.
- Enforced a unique production `JWT_SECRET` of at least 32 characters.
- Switched browser API calls to same-origin `/api` paths, added server-side Next.js proxy rewrites for local/Docker use, and aligned API requests with the token saved by the login flow.
- Added offline SQL Server migration compilation to CI and documented secure setup, migration, backup, and restore gates.

## Verification performed locally

- Backend regression suite: **12 passed**.
- SQLite Alembic: clean upgrade, schema check, downgrade, re-upgrade, and second schema check passed.
- SQL Server: Alembic rendered the migration into MSSQL DDL without a live connection; generated DDL included the expected tables and `NVARCHAR(max)` fields. SQLAlchemy loaded the `mssql+pymssql` dialect. **No server connection was made.**
- Frontend: ESLint, TypeScript check, and Next.js production build passed.
- `npm audit --omit=dev`: **0 production dependency vulnerabilities**.
- `npm audit --audit-level=critical`: passed. Full audit still reports **5 high-severity findings** in the development-only ESLint dependency chain (`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`); the suggested automatic fix is a breaking downgrade, so it was not applied.

These checks verify code and offline schema rendering only. They do not verify SQL Server permissions/version/network/TLS behavior, production data migration, Vercel environment settings, or backup restore.

## Required release gates

1. In Vercel's encrypted environment settings, configure `SQLSERVER_HOST`, `SQLSERVER_USER`, `SQLSERVER_PASSWORD`, `SQLSERVER_DATABASE=MMA_Business_Prosperity_Weapon`, `SQLSERVER_PORT` (normally `1433`), and `SQLSERVER_ENCRYPTION=require`; or configure a full `mssql+pymssql` `DATABASE_URL` with `encryption=require`. Also set a strong `JWT_SECRET` (32+ characters) and `CRON_SECRET`. **Do not send passwords in chat.** SQL Server needs SQL authentication; SSMS Windows/Integrated Authentication will not work in the Linux function.
2. Ensure the SQL Server host is resolvable and reachable from the deployed function over TCP/TLS. Do not expose the database broadly to the internet. Use a restricted runtime account and a separately scoped migration account where possible.
3. Confirm the target database is empty or safely baselined, then run `cd backend && alembic -c alembic.ini upgrade head` using the migration account from a secure release environment. Verify with `alembic check` and a backup/restore test to a separate staging database.
4. Deploy to Vercel Preview and verify `/health`, registration/login, an authenticated leads read/write, and persistence after a fresh function invocation. Verify cron authorization and email only against a sandbox; do not send unsolicited production email as a smoke test.
5. Promote to production only after the Preview checks pass and the owner confirms the deployment.

The app is not marked live-ready until gates 1–4 are verified against the actual SQL Server and deployment.
