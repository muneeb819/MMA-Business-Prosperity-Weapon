# Release baseline & staging readiness

**Review date:** 2026-10-05

**Target:** a non-production Vercel Preview deployment of the Arena session branch; production is not the target for this work.

## Baseline recorded

- **Working branch:** `arena/01a10c59-mma-business-prosperity-weapon`
- **Checked-out commit:** `294d9582773f799fd35443e305bb5f90496a6672`
- **Remote comparison:** `origin/main` resolved to the same commit during this review (`git ls-remote`, 2026-10-05).
- **Clone note:** this checkout is shallow. The result confirms the GitHub `main` tip at review time, not the existence of unseen history or any separate unpublished “complete updated” package.
- **Target deploy:** Vercel Preview only, after local checks pass and staging database/environment values are provided.

## Deployment verification state

- The repository README points to `https://full-repo.vercel.app`; it returned Vercel `404: DEPLOYMENT_NOT_FOUND` when checked on 2026-10-05.
- No Vercel CLI, linked `.vercel` project, or deployment credential/environment names were available in this workspace during the review.
- No managed PostgreSQL URL was available. A production deployment must not be attempted until a durable database is linked and migrations have been run.
- The code now rejects production startup without a PostgreSQL URL. This is intentionally fail-closed; it does not create or configure a managed database.

## Local verification (2026-10-05)

- `npm run lint` — passed with no errors or warnings.
- `npx tsc --noEmit` — passed.
- `npm run build` — passed on Next.js 16.3.8, with Inter loaded from the repository rather than Google Fonts.
- `npm audit --omit=dev` — zero production dependency vulnerabilities.
- Full `npm audit` still reports five high-severity findings in the development-only ESLint dependency chain (`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`). The registry's latest `braces` release is 3.0.3, which remains in the advisory range; npm only offered a breaking downgrade of `eslint-config-next` to 14.2.35. That downgrade and an out-of-range override were not applied. Recheck the lint toolchain when an upstream fix is available.
- Backend release tests — 9 passed. SQLite Alembic upgrade/check/downgrade/re-upgrade passed locally; this does not verify PostgreSQL behavior.
- GitHub Actions CI passed on code commit `95e74ed` (Frontend checks and Backend checks): [run 37325590525](https://github.com/muneeb819/MMA-Business-Prosperity-Weapon/actions/runs/37325590525). The workflow runs on Ubuntu 24.04 with Node 24-compatible actions, audits production dependencies, and fails on critical advisories; the known high findings are limited to the lint toolchain and are documented above.

## Release gates

1. Configure Vercel Preview environment variables using the deployment provider's secret store (at minimum `ENVIRONMENT=production` for a production-like API, `DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`, and `ALLOWED_ORIGINS`). Add OpenAI, SMTP, and source credentials only for explicitly enabled features.
2. Run `cd backend && alembic upgrade head` against the Preview database before serving application traffic.
3. Verify `/health`, registration/login, authenticated leads API, and the automated test/CI checks.
4. Verify a controlled source-sync → lead persistence → proposal draft → compliance-gated email sandbox flow. Do not send unsolicited production email as a smoke test.
5. Promote only after the Preview environment passes and the owner confirms the release.

No production deploy or real outbound email was performed as part of this code change.
