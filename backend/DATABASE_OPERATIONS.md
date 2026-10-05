# Database operations

## Production requirements

Production must use a durable PostgreSQL or Microsoft SQL Server database. The requested SQL Server database name is `MMA_Business_Prosperity_Weapon`; it is also the default when `SQLSERVER_DATABASE` is omitted. Production refuses SQLite and never creates tables from request middleware. Apply Alembic migrations as a release step before sending traffic.

For SQL Server, configure these variables in the hosting provider's encrypted secret store:

- `SQLSERVER_HOST`: a DNS name or IP reachable from the application host (host only, not a named instance).
- `SQLSERVER_PORT`: TCP port, normally `1433`.
- `SQLSERVER_DATABASE`: `MMA_Business_Prosperity_Weapon`.
- `SQLSERVER_USER` and `SQLSERVER_PASSWORD`: a SQL Server SQL-authentication login.
- `SQLSERVER_ENCRYPTION`: defaults to `require`; keep TLS enabled for production.

Alternatively, provide a full `DATABASE_URL` using the `mssql+pymssql` SQLAlchemy driver and the query option `encryption=require` (for example, `mssql+pymssql://USER:PASSWORD@HOST:1433/MMA_Business_Prosperity_Weapon?charset=utf8&encryption=require`). Production rejects SQL Server URLs without SQL authentication credentials or required TLS. Do not set both URL and split credentials unless you intend `DATABASE_URL` to take precedence. PostgreSQL URLs remain supported for deployments that use PostgreSQL.

**Connectivity matters:** a database name created in SSMS is not itself a network endpoint. Vercel's Linux functions must be able to resolve and reach the SQL Server host over TCP. A SQL Server running only on a developer's workstation or behind an inaccessible firewall will not work. `pymssql` uses SQL username/password authentication; Windows/Integrated Authentication from an SSMS session is not available to this deployment. Do not expose SQL Server broadly to the internet—use the hosting provider's supported network controls and allow-listing.

Use separate principals where possible: a runtime login limited to `db_datareader` and `db_datawriter`, and a migration login granted only the DDL permissions required to apply schema changes (for example, `db_ddladmin` scoped to this database). Keep migration credentials out of the long-lived app environment when feasible. Never grant `sysadmin` or database-owner access to the runtime app account just to make startup succeed.

Do not store database URLs or passwords in the repository. Put them in the hosting provider's encrypted environment-variable store. Also configure `JWT_SECRET` to a unique value of at least 32 characters; production startup refuses the development default or a short secret.

## Apply and verify migrations

The checked-in initial migration creates the application's tables in an empty database. If the SQL Server database already contains manually created application tables or data, stop and inspect/back up the schema before running it; do not attempt to overwrite or drop existing objects.

Set the migration principal's connection settings through a secure shell/secret manager, then run from the repository root:

```sh
cd backend
ENVIRONMENT=production alembic -c alembic.ini upgrade head
ENVIRONMENT=production alembic -c alembic.ini check
```

With split SQL Server settings, Alembic builds an escaped `mssql+pymssql` URL from `SQLSERVER_HOST`, `SQLSERVER_USER`, `SQLSERVER_PASSWORD`, and the optional port/database/encryption values. If using a `DATABASE_URL`, it takes precedence. Never put a real password directly in shell history or a command pasted into a ticket/chat; prefer the platform's secure release-job environment.

To validate migrations locally without production credentials, use a disposable SQLite database (development/test only):

```sh
cd backend
ENVIRONMENT=test DATABASE_URL=sqlite:////tmp/mbpw-migration-test.db alembic -c alembic.ini upgrade head
ENVIRONMENT=test DATABASE_URL=sqlite:////tmp/mbpw-migration-test.db alembic -c alembic.ini check
```

CI also compiles the migration to SQL Server DDL offline. That proves SQLAlchemy/Alembic can render the schema, but it does **not** prove network connectivity, server permissions, SQL Server version compatibility, or a successful live migration.

Never run a downgrade or destructive restore against production without an approved maintenance window and a verified backup.

## Backup and restore procedure

Enable the SQL Server provider's automated point-in-time backups and retention policy. Before launch, test a restore into a separate staging database and verify row counts, authentication, lead/proposal relationships, and ACIE/outreach state. For self-managed SQL Server, use native `BACKUP DATABASE`/`RESTORE DATABASE` procedures and remember that backup file paths are on the database server, not the developer's workstation. Managed SQL services may require provider-specific export/restore tools instead.

For deployments that use PostgreSQL, keep an encrypted, access-controlled dump in addition to provider backups:

```sh
: "${DATABASE_URL:?Set DATABASE_URL in the secure shell environment}"
pg_dump --dbname="$DATABASE_URL" --format=custom --no-owner --file="mbpw-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

Restore only into a disposable/staging database first. `--clean` drops restored objects and is destructive:

```sh
: "${DATABASE_URL:?Set DATABASE_URL to the approved restore target}"
pg_restore --dbname="$DATABASE_URL" --clean --if-exists --no-owner --exit-on-error ./approved-backup.dump
```

## Verification status

The initial schema and report date grouping are SQL Server-aware, and CI can compile the Alembic migration to MSSQL DDL without contacting a server. SQLite migration/test runs provide portable regression coverage. A real SQL Server connection, live migration, backup/restore test, deployment health check, and authenticated end-to-end request still require a reachable SQL Server host, correctly scoped SQL credentials, and access to the hosting project. Do not treat offline compilation as proof that production is live-ready.
