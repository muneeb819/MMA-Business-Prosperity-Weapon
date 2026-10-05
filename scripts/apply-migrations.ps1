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