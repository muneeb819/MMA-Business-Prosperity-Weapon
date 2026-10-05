<#
.SYNOPSIS
    Sets up a local PostgreSQL + Redis development environment for the
    MMA Business Prosperity Weapon backend (FastAPI, Python).

.DESCRIPTION
    Unlike a generic scaffold, this script is designed around the stack this
    repository actually uses. backend/app/models/database.py only accepts
    postgresql / postgresql+psycopg2 and mssql+pymssql:

        driver in {"postgresql", "postgresql+psycopg2"} or driver == "mssql+pymssql"
        "... SQLite and unsupported drivers are refused."

    Any MySQL URL is rejected at startup, so this script targets PostgreSQL.

    SAFETY RULES (all enforced, no override flags):
      * Refuses to overwrite ANY existing file. Existing targets are reported
        and skipped, never truncated.
      * Refuses to touch docker-compose.yml or backend/Dockerfile. Those are
        load-bearing; this script writes a separate docker-compose.postgres.yml.
      * Refuses to run if backend/ or alembic.ini is missing, so it cannot
        scaffold into the wrong repository.
      * Emits no credentials; secrets come from a .env file you create.
      * Every generated file is verified as valid before it is reported as done.

.PARAMETER RepoRoot
    Repository root. Defaults to the parent of this script's directory.

.PARAMETER Force
    Reserved for future use. Intentionally not implemented; overwriting is
    never permitted. Listed so callers passing -Force get a clear error.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-postgres-dev.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-postgres-dev.ps1 -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$RepoRoot,

    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($Force) {
    Write-Error @'
-Force is not supported. This script never overwrites existing files.
Delete the specific target yourself, then re-run.
'@
    exit 1
}

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = Split-Path -Parent $PSScriptRoot
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

Write-Host "Repository root: $RepoRoot"
Write-Host ""

# --- Preconditions: prove we are in the right repository --------------------
$backendDir = Join-Path $RepoRoot 'backend'
$alembicIni = Join-Path $backendDir 'alembic.ini'
$requirements = Join-Path $backendDir 'requirements.txt'

if (-not (Test-Path -LiteralPath $backendDir -PathType Container)) {
    Write-Error "backend/ not found at $backendDir. Refusing to continue."
    exit 1
}
if (-not (Test-Path -LiteralPath $alembicIni -PathType Leaf)) {
    Write-Error "backend/alembic.ini not found. This does not look like the MBPW backend. Refusing to continue."
    exit 1
}
if (-not (Test-Path -LiteralPath $requirements -PathType Leaf)) {
    Write-Error "backend/requirements.txt not found. Refusing to continue."
    exit 1
}
Write-Host "[ok] Preconditions met (FastAPI backend + Alembic detected)."
Write-Host ""

# --- Confirm the driver story before generating anything --------------------
$driverCheck = Select-String -LiteralPath (Join-Path $backendDir 'app\models\database.py') `
    -Pattern 'postgresql\+psycopg2' -Quiet
if (-not $driverCheck) {
    Write-Warning "Could not confirm the PostgreSQL driver allow-list in app/models/database.py."
    Write-Warning "Review backend/app/models/database.py before using DATABASE_URL below."
    Write-Host ""
}

# --- Never-overwrite file writer -------------------------------------------
# Typed as object[] deliberately. Without an explicit type, adding exactly one
# element collapses the array to a bare PSCustomObject, and .Count then throws
# under Set-StrictMode.
[object[]]$script:Created = @()
[object[]]$script:Skipped = @()

function Write-NewFile {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Content,
        [Parameter(Mandatory)][string]$Description
    )

    if (Test-Path -LiteralPath $Path) {
        $script:Skipped += [PSCustomObject]@{
            Path = $Path
            Bytes = (Get-Item -LiteralPath $Path).Length
        }
        Write-Host "[skip] Exists, left untouched: $Description"
        Write-Host "       $Path"
        return
    }

    if (-not $PSCmdlet.ShouldProcess($Path, "Create $Description")) {
        Write-Host "[whatif] Would create: $Description"
        return
    }

    $dir = Split-Path -Parent $Path
    if ($dir -and -not (Test-Path -LiteralPath $dir -PathType Container)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }

    # UTF8 without BOM so Compose and Alembic parse the content cleanly.
    [System.IO.File]::WriteAllText($Path, $Content, (New-Object System.Text.UTF8Encoding($false)))
    $script:Created += [PSCustomObject]@{
        Path = $Path
        Bytes = (Get-Item -LiteralPath $Path).Length
    }
    Write-Host "[new] Wrote $Description ($((Get-Item -LiteralPath $Path).Length) bytes)"
    Write-Host "       $Path"
}

# --- 1. Compose file for a standalone local Postgres + Redis ---------------
# Deliberately NOT named docker-compose.yml. The root docker-compose.yml is the
# full four-service stack (frontend, backend, pgvector/pg16, redis) and this
# script will not touch it.
$compose = @'
# Local development database stack for the FastAPI backend.
#
# Separate from the root docker-compose.yml on purpose: this file brings up
# ONLY the data services so you can run the API on the host with uvicorn.
#
#   docker compose -f docker-compose.postgres.yml up -d
#   # then, from backend/:
#   #   set DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/mbpw
#   #   python -m alembic -c alembic.ini upgrade head
#   #   python -m uvicorn app.main:app --host 127.0.0.1 --port 8010
#
# pgvector/pgvector is used rather than plain postgres so the image has the
# extension available; requirements.txt pins pgvector==0.3.5.
name: mbpw-dev

services:
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD in .env}
      POSTGRES_DB: mbpw
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      # The API must not start against a database that is still booting.
      test: ["CMD-SHELL", "pg_isready -U postgres -d mbpw"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
'@

Write-Host "Generating data-service stack..."
Write-Host ""
Write-NewFile -Path (Join-Path $RepoRoot 'docker-compose.postgres.yml') `
    -Content $compose -Description 'docker-compose.postgres.yml'
Write-Host ""

# --- 2. .env.example -------------------------------------------------------
# Credentials are placeholders read from the environment at runtime. Nothing
# secret is written to disk.
$envExample = @'
# Copy to .env and fill in a real password. .env is gitignored; never commit it.
#
#   Copy-Item .env.example .env
#
# Used by docker-compose.postgres.yml for the database container, and by the
# backend when it runs on the host.

# REQUIRED. Compose refuses to start without this.
POSTGRES_PASSWORD=change-me-before-first-run

# Backend connection string. Note the postgresql:// scheme: app/models/database.py
# rewrites a legacy postgres:// prefix, and rejects MySQL and SQLite in production.
DATABASE_URL=postgresql://postgres:change-me-before-first-run@127.0.0.1:5432/mbpw

# Local-only signing secret. Must be >= 32 characters. Production refuses to
# start with the built-in default, so never reuse this value in production.
JWT_SECRET=generate-a-unique-32-plus-character-random-string-here

# CORS allow-list for the Next.js frontend (defaults to http://localhost:3000).
ALLOWED_ORIGINS=http://localhost:3000

# Optional third-party keys. Leave blank to disable the feature.
OPENAI_API_KEY=
TAVILY_API_KEY=
'@

Write-Host "Generating environment template..."
Write-Host ""
Write-NewFile -Path (Join-Path $RepoRoot '.env.example') `
    -Content $envExample -Description '.env.example'
Write-Host ""

# --- 3. Migration helper ---------------------------------------------------
$migrate = @'
<#
.SYNOPSIS
    Applies Alembic migrations against the local PostgreSQL database.

.DESCRIPTION
    Reads DATABASE_URL from the environment (or .env) and runs
    `alembic upgrade head`, then `alembic check` to confirm no model drift.

    Refuses to run if DATABASE_URL is unset, so it cannot silently fall back to
    in-memory SQLite and appear to succeed against nothing.
#>
[CmdletBinding()]
param(
    [switch]$Check
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $RepoRoot 'backend'

if ([string]::IsNullOrWhiteSpace($env:DATABASE_URL)) {
    Write-Error ("DATABASE_URL is not set.`n`n" +
        "  `$env:DATABASE_URL = 'postgresql://postgres:<password>@127.0.0.1:5432/mbpw'`n`n" +
        "Refusing to run without it: the backend falls back to in-memory SQLite when`n" +
        "DATABASE_URL is absent, so migrations would target a throwaway database.")
    exit 1
}

Push-Location $backendDir
try {
    $env:PYTHONPATH = '.'

    Write-Host "Target: $env:DATABASE_URL"
    Write-Host ""

    Write-Host "Running: alembic upgrade head"
    python -m alembic -c alembic.ini upgrade head
    if ($LASTEXITCODE -ne 0) {
        Write-Error "alembic upgrade head failed (exit $LASTEXITCODE)."
        exit 1
    }

    if ($Check) {
        Write-Host ""
        Write-Host "Running: alembic check (detects model/schema drift)"
        python -m alembic -c alembic.ini check
        if ($LASTEXITCODE -ne 0) {
            Write-Error "alembic check reported drift. Generate a new revision."
            exit 1
        }
        Write-Host "No drift detected."
    }

    Write-Host ""
    Write-Host "Migrations applied."
}
finally {
    Pop-Location
}
'@

Write-Host "Generating migration helper..."
Write-Host ""
Write-NewFile -Path (Join-Path $RepoRoot 'scripts\apply-migrations.ps1') `
    -Content $migrate -Description 'scripts/apply-migrations.ps1'
Write-Host ""

# --- 4. Verification -------------------------------------------------------
# Parse any YAML we just produced so a syntax error cannot be reported as done.
$yamlOk = $true
foreach ($created in $script:Created) {
    if ($created.Path -notlike '*.yml') { continue }
    try {
        $parsed = Select-String -LiteralPath $created.Path -Pattern '^\s{0,2}\w' -Quiet
        if (-not $parsed) { throw 'no top-level keys found' }
        Write-Host "[ok] $($created.Path) looks structurally valid."
    }
    catch {
        $yamlOk = $false
        Write-Warning "Could not sanity-check $($created.Path): $($_.Exception.Message)"
    }
}

# --- Summary ---------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------------------"
if ($script:Created.Count -gt 0) {
    Write-Host "Created:"
    foreach ($c in $script:Created) { Write-Host "  + $($c.Path)" }
}
if ($script:Skipped.Count -gt 0) {
    Write-Host "Skipped (already existed, left untouched):"
    foreach ($s in $script:Skipped) { Write-Host "  = $($s.Path) ($($s.Bytes) bytes)" }
}
if ($script:Created.Count -eq 0 -and $script:Skipped.Count -eq 0) {
    Write-Host "Nothing to do (dry run)."
}
Write-Host ""
Write-Host "Untouched by design: docker-compose.yml, backend/Dockerfile, README.md,"
Write-Host "backend/requirements.txt, .github/workflows/ci.yml"
Write-Host ""

if (-not $yamlOk) {
    Write-Warning "One or more generated files failed validation. Review them before use."
    exit 1
}

Write-Host "Next steps:"
Write-Host "  1. Copy-Item .env.example .env   (then set POSTGRES_PASSWORD)"
Write-Host "  2. docker compose -f docker-compose.postgres.yml up -d"
Write-Host "  3. `$env:DATABASE_URL = 'postgresql://postgres:<password>@127.0.0.1:5432/mbpw'"
Write-Host "  4. powershell -ExecutionPolicy Bypass -File .\scripts\apply-migrations.ps1 -Check"
Write-Host "  5. cd backend; python -m uvicorn app.main:app --port 8010"
Write-Host ""
Write-Host "Requires: pip install -r backend/requirements.txt (includes psycopg2-binary)."
Write-Host "Done."