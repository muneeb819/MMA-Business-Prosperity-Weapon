# Database operations

## Production requirements

- Production (`ENVIRONMENT=production` or `VERCEL_ENV=production`) must use managed PostgreSQL through `DATABASE_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, or `POSTGRES_PRISMA_URL`.
- The application now refuses to start if no supported URL is present or if production is pointed at SQLite. It never falls back to in-memory SQLite in production.
- Do not store database URLs in the repository. Configure them through the hosting provider's encrypted environment-variable store.
- Production tables are created by Alembic migrations, not by request middleware. Run migrations as a release step before deploying traffic.

## Apply and verify migrations

From the repository root, after securely setting `DATABASE_URL`:

```sh
cd backend
alembic -c alembic.ini upgrade head
alembic -c alembic.ini check
```

To test locally without credentials, use a disposable SQLite file (development/test only):

```sh
cd backend
ENVIRONMENT=test DATABASE_URL=sqlite:////tmp/mbpw-migration-test.db alembic -c alembic.ini upgrade head
ENVIRONMENT=test DATABASE_URL=sqlite:////tmp/mbpw-migration-test.db alembic -c alembic.ini check
```

Never run a downgrade or destructive restore against a production database without an approved maintenance window and a verified backup.

## Backup and restore procedure

The managed PostgreSQL provider should retain its own point-in-time backups. Keep an additional encrypted, access-controlled dump according to the organization's retention policy. These commands do not print or save the URL; `DATABASE_URL` must come from the secure environment:

```sh
: "${DATABASE_URL:?Set DATABASE_URL in the secure shell environment}"
pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --file="mbpw-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

Restore only into a disposable/staging database first, then verify row counts, authentication, lead/proposal relationships, and the ACIE/outreach state. `--clean` drops restored objects and is destructive:

```sh
: "${DATABASE_URL:?Set DATABASE_URL to the approved restore target}"
pg_restore --dbname="$DATABASE_URL" --clean --if-exists --no-owner --exit-on-error ./approved-backup.dump
```

## Verification still requiring provider access

This repository review verified Alembic upgrade, schema comparison, downgrade, and re-upgrade using a disposable local SQLite database. It did **not** configure a managed PostgreSQL instance, run PostgreSQL backup/restore, or verify a Vercel environment. Those steps require an approved provider project and credentials supplied via its secret store.
