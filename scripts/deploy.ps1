param(
  [Parameter(Position = 0)]
  [ValidateSet("preview", "prod")]
  [string]$Mode = "preview",

  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

function Ensure-Committed {
  $status = git status --porcelain
  if ($status) {
    $msg = if ($Message) { $Message } else { "chore: staged changes via deploy script" }
    git add -A
    git commit -m $msg
  }
}

if ($Mode -eq "preview") {
  # Make sure we are on develop (create it from main if missing)
  $branch = git rev-parse --abbrev-ref HEAD
  if ($branch -ne "develop") {
    git checkout develop 2>$null
    if ($LASTEXITCODE -ne 0) { git checkout -b develop }
  }
  Ensure-Committed
  git push -u origin develop

  Write-Host ""
  Write-Host "PREVIEW DEPLOY triggered for branch 'develop'." -ForegroundColor Cyan
  Write-Host "Vercel auto-builds a Preview deployment (NOT production)." -ForegroundColor Cyan
  Write-Host "Find the preview URL at the Vercel dashboard, or run:  vercel ls" -ForegroundColor Cyan
  Write-Host "Review it in the browser. When happy, run:" -ForegroundColor Cyan
  Write-Host "  .\scripts\deploy.ps1 prod" -ForegroundColor Yellow
}
else {
  # Promote develop -> main (production)
  git checkout develop
  Ensure-Committed
  git checkout main
  git merge develop --no-edit
  git push origin main

  Write-Host ""
  Write-Host "PRODUCTION DEPLOY triggered (main)." -ForegroundColor Green
  Write-Host "Vercel will rebuild and replace the live site." -ForegroundColor Green
}

Pop-Location
