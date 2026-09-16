$log = "backend.log"
$proc = Start-Process -NoNewWindow -PassThru -FilePath python -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8001" -RedirectStandardOutput $log -RedirectStandardError $log
Start-Sleep -Seconds 3
Write-Host "PID: $($proc.Id)"
if ($proc.HasExited) {
    Write-Host "EXITED:"
    Get-Content $log -Tail 10
} else {
    Write-Host "Running on port 8001"
}
