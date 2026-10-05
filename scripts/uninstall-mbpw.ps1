<#
.SYNOPSIS
    Removes everything scripts/setup-mbpw-sqlserver.ps1 installs.

.DESCRIPTION
    Deletes, in order: the Scheduled Task (stopping it first if it is running),
    the firewall rule, the generated startup wrapper, backend/.env, and the
    mbpw log files. Leaves backend/.venv in place because deleting it is slow and
    reinstalling it is slower; pass -RemoveVenv to drop it too.

    Refuses to touch backend/.env unless -RemoveEnv is passed, so an accidental
    run cannot discard credentials or JWT_SECRET you may still need.

    Requires an elevated shell: the task and firewall rule cannot be modified
    otherwise.

.PARAMETER RemoveEnv
    Also delete backend/.env (contains the SQL Server password).

.PARAMETER RemoveVenv
    Also delete backend/.venv and every dependency installed into it.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-mbpw.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\uninstall-mbpw.ps1 -RemoveEnv -RemoveVenv
#>
[CmdletBinding()]
param(
    [switch]$RemoveEnv,
    [switch]$RemoveVenv
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $RepoRoot 'backend'
$EnvFile = Join-Path $Backend '.env'
$VenvDir = Join-Path $Backend '.venv'
$StartupScript = Join-Path $Backend 'startup-mbpw.ps1'
$TaskName = 'MBPW API'
$FirewallRuleName = 'MBPW API (LAN)'
$LogFiles = @(
    (Join-Path $Backend 'mbpw.log'),
    (Join-Path $Backend 'mbpw.err.log')
)

Write-Host 'MBPW uninstall'
Write-Host "Repository root: $RepoRoot"
Write-Host ''

# --- Elevation ------------------------------------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host 'This script needs Administrator to remove the scheduled task and firewall rule.'
    Write-Host ''
    Write-Host 'Nothing has been changed. Re-run from an elevated PowerShell, for example:'
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit 1
}

# --- Scheduled task -------------------------------------------------------
Write-Host '==> Scheduled task'
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
    $state = $task.State
    if ($state -eq 'Running') {
        Write-Host "    Task is Running; stopping '$TaskName' first."
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
        $deadline = (Get-Date).AddSeconds(15)
        while ((Get-Date) -lt $deadline) {
            $current = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
            if ($null -eq $current -or $current.State -ne 'Running') { break }
            Start-Sleep -Milliseconds 500
        }
    }
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "    [ok] Removed scheduled task '$TaskName' (was $state)."
} else {
    Write-Host "    [ok] No scheduled task named '$TaskName'."
}

# --- Firewall rule -------------------------------------------------------
Write-Host ''
Write-Host '==> Firewall rule'
$rule = Get-NetFirewallRule -DisplayName $FirewallRuleName -ErrorAction SilentlyContinue
if ($rule) {
    Remove-NetFirewallRule -DisplayName $FirewallRuleName
    Write-Host "    [ok] Removed firewall rule '$FirewallRuleName'."
} else {
    Write-Host "    [ok] No firewall rule named '$FirewallRuleName'."
}

# --- Startup wrapper -----------------------------------------------------
Write-Host ''
Write-Host '==> Startup wrapper'
if (Test-Path -LiteralPath $StartupScript -PathType Leaf) {
    Remove-Item -LiteralPath $StartupScript -Force
    Write-Host "    [ok] Removed $StartupScript"
} else {
    Write-Host "    [ok] No startup wrapper at $StartupScript"
}

# --- Logs ----------------------------------------------------------------
Write-Host ''
Write-Host '==> Logs'
$removedAny = $false
foreach ($log in $LogFiles) {
    if (Test-Path -LiteralPath $log -PathType Leaf) {
        Remove-Item -LiteralPath $log -Force
        Write-Host "    [ok] Removed $log"
        $removedAny = $true
    }
}
if (-not $removedAny) { Write-Host '    [ok] No log files present.' }

# --- .env ----------------------------------------------------------------
Write-Host ''
Write-Host '==> Environment file'
if (Test-Path -LiteralPath $EnvFile -PathType Leaf) {
    if ($RemoveEnv) {
        Remove-Item -LiteralPath $EnvFile -Force
        Write-Host "    [ok] Removed $EnvFile (contained your SQL Server password)."
    } else {
        Write-Host "    Kept $EnvFile"
        Write-Host '    It holds your SQL Server password. Re-run with -RemoveEnv to delete it.'
    }
} else {
    Write-Host "    [ok] No .env at $EnvFile"
}

# --- Virtualenv ----------------------------------------------------------
Write-Host ''
Write-Host '==> Virtualenv'
if (Test-Path -LiteralPath $VenvDir -PathType Container) {
    if ($RemoveVenv) {
        Write-Host "    Removing $VenvDir (this can take a minute)..."
        Remove-Item -LiteralPath $VenvDir -Recurse -Force
        Write-Host '    [ok] Virtualenv removed.'
    } else {
        Write-Host "    Kept $VenvDir"
        Write-Host '    Re-run with -RemoveVenv to delete it and every installed dependency.'
    }
} else {
    Write-Host "    [ok] No virtualenv at $VenvDir"
}

Write-Host ''
Write-Host '--------------------------------------------------------------'
Write-Host 'Uninstall complete.'
Write-Host ''
Write-Host 'Not touched by this script:'
Write-Host '  backend/app, backend/alembic, backend/requirements.txt'
Write-Host '  docker-compose.yml, docker-compose.postgres.yml'
Write-Host '  .github/workflows/ci.yml, README.md'
Write-Host '  scripts/setup-postgres-dev.ps1'
Write-Host ''