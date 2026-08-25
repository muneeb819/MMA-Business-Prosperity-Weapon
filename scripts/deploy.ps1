param(
  [Parameter(Position = 0)]
  [ValidateSet("preview", "prod")]
  [string]$Mode = "preview",

  [string]$Message = ""
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

function Ensure-Committed {
  $status = git status --porcelain
  if ($status) {
    $msg = if ($Message) { $Message } else { "chore: staged changes via deploy script" }
    git add -A
    git commit -m $msg 2>$null
  }
}

function Git-Checkout {
  param([string]$Branch)
  $current = (git rev-parse --abbrev-ref HEAD 2>$null).Trim()
  if ($current -ne $Branch) {
    git checkout $Branch 2>$null
    if ($LASTEXITCODE -ne 0) { git checkout -b $Branch 2>$null }
  }
}

if ($Mode -eq "preview") {
  Git-Checkout "develop"
  Ensure-Committed
  git push -u origin develop 2>$null

  Write-Host ""
  Write-Host "PREVIEW DEPLOY triggered for branch 'develop'." -ForegroundColor Cyan
  Write-Host "Vercel auto-builds a Preview deployment (NOT production)." -ForegroundColor Cyan
  Write-Host "Find the preview URL at the Vercel dashboard, or run:  vercel ls" -ForegroundColor Cyan
  Write-Host "Review it in the browser. When happy, run:" -ForegroundColor Cyan
  Write-Host "  .\scripts\deploy.ps1 prod" -ForegroundColor Yellow
}
else {
  Git-Checkout "develop"
  Ensure-Committed
  Git-Checkout "main"
  git merge develop --no-edit 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Error "Merge failed"; Pop-Location; exit 1 }
  git push origin main 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Error "Push failed"; Pop-Location; exit 1 }

  Write-Host ""
  Write-Host "PRODUCTION DEPLOY triggered (main)." -ForegroundColor Green
  Write-Host "Vercel will rebuild and replace the live site." -ForegroundColor Green
}

Pop-Location
