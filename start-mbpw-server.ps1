# MBPW Server Launcher
# MMA Business Prosperity Weapon - Full Stack Server

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  MBPW SERVER LAUNCHER" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_DIR = "C:\MMA Business Prosperity Weapon"
$FRONTEND_PORT = 3000
$BACKEND_PORT = 8001

# Kill existing processes on these ports
Write-Host "[1/4] Cleaning up ports..." -ForegroundColor Yellow
$p3000 = netstat -ano | Select-String ":${FRONTEND_PORT} "
if ($p3000) { ($p3000.ToString() -split '\s+')[-1] | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }
$p8001 = netstat -ano | Select-String ":${BACKEND_PORT} "
if ($p8001) { ($p8001.ToString() -split '\s+')[-1] | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }
Start-Sleep 1
Write-Host "  Ports cleared!"

# Start Backend
Write-Host "[2/4] Starting Backend (FastAPI)..." -ForegroundColor Yellow
$be = Start-Process -NoNewWindow -FilePath "python" -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port ${BACKEND_PORT} --reload" -WorkingDirectory "$PROJECT_DIR\backend" -PassThru
Start-Sleep 2
Write-Host "  Backend PID: $($be.Id)"

# Start Frontend
Write-Host "[3/4] Starting Frontend (Next.js)..." -ForegroundColor Yellow
$fe = Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "next dev -H 0.0.0.0 -p ${FRONTEND_PORT}" -WorkingDirectory $PROJECT_DIR -PassThru
Write-Host "  Frontend PID: $($fe.Id)"

Write-Host ""
Write-Host "[4/4] Waiting for servers..." -ForegroundColor Yellow
Start-Sleep 15

# Verify
$beOk = $false; try { $beOk = (Invoke-WebRequest -Uri "http://localhost:${BACKEND_PORT}/health" -TimeoutSec 3 -UseBasicParsing).StatusCode -eq 200 } catch {}
$feOk = $false; try { $feOk = (Invoke-WebRequest -Uri "http://localhost:${FRONTEND_PORT}" -TimeoutSec 5 -UseBasicParsing).StatusCode -eq 200 } catch {}

Write-Host ""
if ($beOk -and $feOk) {
  Write-Host "======================================" -ForegroundColor Green
  Write-Host "  MBPW SERVER IS RUNNING!" -ForegroundColor Green
  Write-Host "======================================" -ForegroundColor Green
  Write-Host "  Frontend: http://localhost:${FRONTEND_PORT}" -ForegroundColor White
  Write-Host "  Backend:  http://localhost:${BACKEND_PORT}" -ForegroundColor White
  Write-Host "  Login:    admin@mbpw.com / admin123" -ForegroundColor White
  Write-Host ""
  Write-Host "  Press Ctrl+C to stop all servers" -ForegroundColor Gray
  Write-Host "======================================" -ForegroundColor Green
} else {
  Write-Host "WARNING: Some servers may not be ready yet." -ForegroundColor Yellow
  if (!$feOk) { Write-Host "  Frontend: Still starting (may need 10-15s more)" }
  if (!$beOk) { Write-Host "  Backend:  Still starting" }
}

# Keep script running
while ($true) { Start-Sleep 10 }
