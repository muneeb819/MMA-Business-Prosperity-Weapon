Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3
Remove-Item "mbpw.db" -Force -ErrorAction SilentlyContinue
Start-Process -NoNewWindow -FilePath python -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000"
Start-Sleep -Seconds 6
$r = Invoke-RestMethod -Uri "http://localhost:8000/api/seed" -Method POST -TimeoutSec 10
Write-Host ($r | ConvertTo-Json)
