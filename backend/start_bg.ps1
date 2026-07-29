$proc = Start-Process -NoNewWindow -PassThru -FilePath python -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000"
Write-Host "Started PID: $($proc.Id)"
Start-Sleep -Seconds 5
try {
    $r = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Backend OK: $($r.StatusCode)"
} catch {
    Write-Host "Backend not ready yet"
}
