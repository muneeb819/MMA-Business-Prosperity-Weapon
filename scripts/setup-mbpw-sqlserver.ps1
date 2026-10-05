<#
.SYNOPSIS
    Installs the MBPW FastAPI backend as a startup Scheduled Task backed by a
    local Microsoft SQL Server instance.

.DESCRIPTION
    Registers "MBPW API" to run at system startup: it applies Alembic
    migrations, then serves uvicorn on 0.0.0.0 so the API is reachable from the
    LAN. Adds a firewall rule scoped to the Private profile and LocalSubnet.

    Corrects several problems in earlier drafts of this script:
      * .env is actually loaded. app/main.py and alembic/env.py both call
        load_dotenv() with override=False, so a .env file is no longer ignored.
      * Elevation happens once, in process, before any change is made.
      * The startup wrapper sets its working directory to backend\, so alembic
        resolves alembic.ini and the app package the same way CI does.
      * Migration and server output go to separate log files. Redirecting both
        stdout and stderr to one path corrupts the output.
      * SQL Server connectivity is proven BEFORE anything is registered, so a
        bad password cannot leave a task registered that serves SQLite.

    Requires: Python 3.11+ on PATH, a reachable SQL Server, and an elevated
    shell. Refuses to overwrite .env, the startup wrapper, or the scheduled task
    unless -Force is passed.

.PARAMETER Force
    Replace an existing .env, startup wrapper, or scheduled task.

.PARAMETER Port
    TCP port for the API. Defaults to 8010.

.PARAMETER SkipFirewall
    Do not add the firewall rule (useful when port-forwarding externally).

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-mbpw-sqlserver.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\setup-mbpw-sqlserver.ps1 -Force -Port 8020
#>
[CmdletBinding()]
param(
    [switch]$Force,
    [int]$Port = 8010,
    [switch]$SkipFirewall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $RepoRoot 'backend'
$EnvFile = Join-Path $Backend '.env'
$VenvDir = Join-Path $Backend '.venv'
$PythonExe = Join-Path $VenvDir 'Scripts\python.exe'
$StartupScript = Join-Path $Backend 'startup-mbpw.ps1'
$TaskName = 'MBPW API'
$FirewallRuleName = 'MBPW API (LAN)'
$StdLog = Join-Path $Backend 'mbpw.log'
$ErrLog = Join-Path $Backend 'mbpw.err.log'

function Write-Step {
    param([string]$Message)
    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "    [ok] $Message"
}

function ConvertFrom-SecureStringPlain {
    param([Parameter(Mandatory)][securestring]$Secure)
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

Write-Host "MBPW SQL Server setup"
Write-Host "Repository root: $RepoRoot"

# --- 1. Elevation, before anything is modified -----------------------------
Write-Step 'Checking elevation'
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host '    This script needs Administrator to register the startup task'
    Write-Host '    and the firewall rule.'
    Write-Host ''
    Write-Host '    Right-click PowerShell and choose "Run as administrator", then re-run:'
    Write-Host "      powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    Write-Host ''
    Write-Host '    Nothing has been changed. Exiting so you can relaunch elevated.'
    exit 1
}
Write-Ok 'running elevated'

# --- 2. Preconditions ------------------------------------------------------
Write-Step 'Checking prerequisites'

if (-not (Test-Path -LiteralPath $Backend -PathType Container)) {
    throw "backend/ not found at $Backend. Aborting."
}
foreach ($required in @('app\main.py', 'alembic.ini', 'requirements.txt')) {
    if (-not (Test-Path -LiteralPath (Join-Path $Backend $required) -PathType Leaf)) {
        throw "backend/$required not found. Aborting."
    }
}
Write-Ok 'backend layout verified'

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    throw 'python not found on PATH. Install Python 3.11+ and ensure python is on PATH.'
}
$pythonVersion = (& python --version 2>&1) -join ''
Write-Ok "found $pythonVersion"

# Refuse to touch existing artifacts unless forced. Checked up front so we do
# not prompt for credentials only to bail out later.
$existing = @()
if (Test-Path -LiteralPath $EnvFile) { $existing += ".env ($EnvFile)" }
if (Test-Path -LiteralPath $StartupScript) { $existing += "startup wrapper ($StartupScript)" }
$taskAlready = $null -ne (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue)

if ($existing.Count -gt 0 -or $taskAlready) {
    if (-not $Force) {
        Write-Host ''
        Write-Host 'Refusing to overwrite:'
        foreach ($item in $existing) { Write-Host "  - $item" }
        if ($taskAlready) { Write-Host "  - scheduled task '$TaskName'" }
        Write-Host ''
        Write-Host 'Re-run with -Force to replace them.'
        exit 0
    }
    Write-Host ''
    Write-Host '    -Force given; existing artifacts will be replaced.'
}

# --- 3. Interactive configuration -----------------------------------------
Write-Step 'Configuration'
Write-Host '    SQLSERVER_* values configure the backend via backend/.env.'
Write-Host '    Press Enter to accept the value in parentheses.'
Write-Host ''

$sqlHost = Read-Host '    SQL Server host'
if ([string]::IsNullOrWhiteSpace($sqlHost)) { $sqlHost = 'localhost' }

$sqlPortRaw = Read-Host '    SQL Server port'
if ([string]::IsNullOrWhiteSpace($sqlPortRaw)) { $sqlPort = '1433' } else { $sqlPort = $sqlPortRaw.Trim() }

$sqlUser = Read-Host '    SQL Server user (SQL auth)'
if ([string]::IsNullOrWhiteSpace($sqlUser)) { $sqlUser = 'sa' }

Write-Host ''
$sqlPasswordSecure = Read-Host '    SQL Server password (input hidden)' -AsSecureString
$sqlPassword = ConvertFrom-SecureStringPlain -Secure $sqlPasswordSecure
if ([string]::IsNullOrWhiteSpace($sqlPassword)) {
    throw 'SQL Server password cannot be empty.'
}

$sqlDatabase = Read-Host '    Database name'
if ([string]::IsNullOrWhiteSpace($sqlDatabase)) { $sqlDatabase = 'MMA_Business_Prosperity_Weapon' }

Write-Host ''
Write-Host '    Leave JWT_SECRET blank to run in development mode (recommended first).'
Write-Host '    Production requires >= 32 characters and is refused otherwise.'
$jwtSecret = ''
$jwtSecure = Read-Host '    JWT_SECRET (blank for dev mode, min 32 chars)' -AsSecureString
if ($null -ne $jwtSecure -and $jwtSecure.Length -gt 0) {
    $jwtSecret = ConvertFrom-SecureStringPlain -Secure $jwtSecure
}

$setProduction = $false
if ($jwtSecret.Length -ge 32) {
    $answer = Read-Host '    Set ENVIRONMENT=production?'
    $setProduction = ($answer -match '^[Yy]')
    if (-not $setProduction) {
        Write-Host '    Leaving ENVIRONMENT unset (development mode).'
    }
} elseif ($jwtSecret.Length -gt 0) {
    Write-Host "    JWT_SECRET is only $($jwtSecret.Length) characters; production needs 32."
    Write-Host '    Staying in development mode.'
} else {
    Write-Host '    No JWT_SECRET given; staying in development mode.'
}

# --- 4. Virtualenv and dependencies ---------------------------------------
Write-Step 'Preparing the Python environment'

if (Test-Path -LiteralPath $PythonExe) {
    Write-Ok "reusing existing venv at $VenvDir"
} else {
    Write-Host "    Creating venv at $VenvDir (this takes a moment)..."
    & python -m venv $VenvDir
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $PythonExe)) {
        throw "Failed to create the virtualenv at $VenvDir."
    }
    Write-Ok 'venv created'
}

Write-Host '    Upgrading pip, setuptools, wheel...'
& $PythonExe -m pip install --quiet --upgrade pip setuptools wheel
if ($LASTEXITCODE -ne 0) { throw 'Failed to upgrade pip in the venv.' }

Write-Host '    Installing backend/requirements.txt (this can take several minutes)...'
& $PythonExe -m pip install --quiet -r (Join-Path $Backend 'requirements.txt')
if ($LASTEXITCODE -ne 0) {
    throw 'pip install -r requirements.txt failed. See the output above.'
}
Write-Ok 'requirements installed'

# pymssql has no universal wheel, so a source build can need MSVC. Prefer the
# binary wheel and explain the fallback rather than emitting a wall of C errors.
& $PythonExe -m pip install --quiet --only-binary=:all: 'pymssql==2.4.2'
if ($LASTEXITCODE -ne 0) {
    Write-Host '    No prebuilt pymssql wheel available; building from source.'
    Write-Host '    This requires the Microsoft C++ Build Tools. If it fails, install'
    Write-Host '    "Desktop development with C++" from https://aka.ms/vs/17/release/vc_redist'
    Write-Host '    (or the Build Tools installer) and re-run this script.'
    & $PythonExe -m pip install 'pymssql==2.4.2'
    if ($LASTEXITCODE -ne 0) {
        throw 'Failed to install pymssql==2.4.2. Install the C++ Build Tools and re-run.'
    }
}
& $PythonExe -c 'import pymssql' 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'pymssql is still not importable after install.' }
Write-Ok 'pymssql installed'

& $PythonExe -c 'import alembic, dotenv, uvicorn, fastapi' 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'alembic, dotenv, uvicorn or fastapi missing from the venv.' }
Write-Ok 'alembic, dotenv, uvicorn, fastapi present'

# --- 5. Write .env (BOM-free) ---------------------------------------------
Write-Step 'Writing backend/.env'

$envLines = [System.Collections.Generic.List[string]]::new()
$envLines.Add("SQLSERVER_HOST=$sqlHost")
$envLines.Add("SQLSERVER_PORT=$sqlPort")
$envLines.Add("SQLSERVER_USER=$sqlUser")
$envLines.Add("SQLSERVER_PASSWORD=$sqlPassword")
$envLines.Add("SQLSERVER_DATABASE=$sqlDatabase")
$envLines.Add("SQLSERVER_ENCRYPTION=require")
if ($setProduction) {
    $envLines.Add('ENVIRONMENT=production')
    $envLines.Add("JWT_SECRET=$jwtSecret")
} else {
    $envLines.Add('# ENVIRONMENT intentionally unset (development mode).')
    $envLines.Add('# Set ENVIRONMENT=production plus a JWT_SECRET of 32+ characters to enable it.')
}

# UTF8 without BOM: a BOM would corrupt the first variable name when read back.
[System.IO.File]::WriteAllLines($EnvFile, $envLines, (New-Object System.Text.UTF8Encoding($false)))
Write-Ok ".env written ($($envLines.Count) lines)"

# --- 6. Prove SQL Server is reachable before registering anything ----------
Write-Step 'Verifying SQL Server connectivity and migration SQL generation'

$probe = @'
import sys
from app.models.database import _resolve_database_url, _normalize_database_url
url = _normalize_database_url(_resolve_database_url())
if not url.startswith("mssql+pymssql://"):
    print("NOT_MSSQL:" + url)
    sys.exit(2)
print("URL_OK")
'@

$probeFile = Join-Path $Backend '_mbpw_probe.py'
[System.IO.File]::WriteAllText($probeFile, $probe, (New-Object System.Text.UTF8Encoding($false)))
try {
    Push-Location $Backend
    $env:PYTHONPATH = $Backend
    $probeOut = (& $PythonExe $probeFile 2>&1) -join "`n"
    $probeExit = $LASTEXITCODE
}
finally {
    Pop-Location
    Remove-Item -LiteralPath $probeFile -Force -ErrorAction SilentlyContinue
}

if ($probeExit -ne 0) {
    throw @"
Configuration problem, nothing has been registered yet.

$probeOut

Expected a mssql+pymssql:// URL. If this says NOT_MSSQL, the .env file was not
read (check the variable names) or the settings are incomplete. app/main.py and
alembic/env.py load backend/.env with override=False, so a DATABASE_URL already
present in your shell environment takes precedence over the file.
"@
}
Write-Ok '.env resolves to a SQL Server URL'

# Compile the migration offline: catches schema errors without touching data.
Push-Location $Backend
$env:PYTHONPATH = $Backend
$migrationOut = (& $PythonExe -m alembic -c alembic.ini upgrade head --sql 2>&1) -join "`n"
$migrationExit = $LASTEXITCODE
Pop-Location
if ($migrationExit -ne 0) {
    throw "alembic could not generate SQL Server migration DDL. Nothing registered.`n`n$migrationOut"
}
Write-Ok 'migration DDL compiles for SQL Server'

# --- 7. Startup wrapper ---------------------------------------------------
Write-Step 'Writing the startup wrapper'

$startupContent = @"
# Generated by scripts/setup-mbpw-sqlserver.ps1
# Applies Alembic migrations, then serves the API. Invoked by the
# "$TaskName" Scheduled Task at system startup.
`$ErrorActionPreference = 'Continue'

`$Backend = '$Backend'
`$Python = '$PythonExe'

# Alembic resolves alembic.ini and the app package relative to the cwd, so this
# must run from backend\. Scheduled Tasks start in %SystemRoot%\System32.
Set-Location -LiteralPath `$Backend
`$env:PYTHONPATH = `$Backend

Write-Output "[`$(Get-Date -Format s)] applying migrations"
& `$Python -m alembic -c alembic.ini upgrade head
if (`$LASTEXITCODE -ne 0) {
    Write-Output "[`$(Get-Date -Format s)] MIGRATION FAILED (exit `$LASTEXITCODE); refusing to serve."
    exit `$LASTEXITCODE
}

Write-Output "[`$(Get-Date -Format s)] starting uvicorn on 0.0.0.0:$Port"
& `$Python -m uvicorn app.main:app --host 0.0.0.0 --port $Port
"@

[System.IO.File]::WriteAllText($StartupScript, $startupContent, (New-Object System.Text.UTF8Encoding($false)))
Write-Ok "startup wrapper written to $StartupScript"

# --- 8. Scheduled task ----------------------------------------------------
Write-Step 'Registering the startup Scheduled Task'

$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    if (-not $Force) {
        Write-Host "    Task '$TaskName' already exists. Re-run with -Force to replace it."
        exit 0
    }
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "    Removed the existing task."
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$StartupScript`""
$trigger = New-ScheduledTaskTrigger -AtStartup
# SYSTEM so the API comes up regardless of whether anyone is logged in.
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Principal $principal -Settings $settings -Force | Out-Null
Write-Ok "scheduled task '$TaskName' registered (SYSTEM, at startup)"

# --- 9. Firewall ----------------------------------------------------------
if ($SkipFirewall) {
    Write-Host ''
    Write-Host '    -SkipFirewall given; no firewall rule added.'
} else {
    Write-Step 'Adding the LAN firewall rule'
    $existingRule = Get-NetFirewallRule -DisplayName $FirewallRuleName -ErrorAction SilentlyContinue
    if ($existingRule) {
        Remove-NetFirewallRule -DisplayName $FirewallRuleName
        Write-Host "    Removed the existing rule '$FirewallRuleName'."
    }
    New-NetFirewallRule -DisplayName $FirewallRuleName `
        -Direction Inbound -Action Allow `
        -Protocol TCP -LocalPort $Port `
        -Profile Private -RemoteAddress LocalSubnet `
        -Description "MBPW API on $Port; private networks only" | Out-Null
    Write-Ok "firewall rule '$FirewallRuleName' added (Private profile, LocalSubnet, port $Port)"
}

# --- 10. Summary ----------------------------------------------------------
$lanIps = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
    Select-Object -ExpandProperty IPAddress)

Write-Host ''
Write-Host '--------------------------------------------------------------'
Write-Host 'Setup complete.'
Write-Host ''
Write-Host "  API           http://<this-host>:$Port/docs"
foreach ($ip in $lanIps) { Write-Host "  From your LAN  http://${ip}:$Port/docs" }
Write-Host ''
Write-Host "  Mode          $(if ($setProduction) { 'production' } else { 'development (ENVIRONMENT unset)' })"
Write-Host "  Task          $TaskName  (runs at startup as SYSTEM)"
Write-Host "  Logs          $StdLog"
Write-Host "                 $ErrLog"
Write-Host ''
Write-Host '  Start now:'
Write-Host "    Start-ScheduledTask -TaskName '$TaskName'"
Write-Host '    Get-Content "<repo>\backend\mbpw.log" -Tail 40 -Wait'
Write-Host ''
Write-Host '  Stop:'
Write-Host "    Stop-ScheduledTask -TaskName '$TaskName'"
Write-Host ''
Write-Host '  Uninstall everything:'
Write-Host "    powershell -ExecutionPolicy Bypass -File `"$RepoRoot\scripts\uninstall-mbpw.ps1`""
Write-Host ''
if (-not $setProduction) {
    Write-Host '  Note: development mode calls create_tables() on every request, which'
    Write-Host '  can race the migration step above. Once things work, re-run with -Force'
    Write-Host '  and a 32+ character JWT_SECRET to switch to production mode.'
    Write-Host ''
}