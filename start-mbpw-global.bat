@echo off
title MBPW Cloudflare Tunnel
echo Starting MBPW Cloudflare Tunnel...
echo.
start "MBPW-Backend" cmd /c "cd /d C:\MMA Business Prosperity Weapon\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 3 /nobreak >nul
start "MBPW-Frontend" cmd /c "cd /d C:\MMA Business Prosperity Weapon && npx next dev -H 0.0.0.0 -p 3000"
echo Waiting for frontend...
timeout /t 20 /nobreak >nul
echo Starting Global Tunnel via Cloudflare...
start "MBPW-Tunnel" cmd /c "C:\Users\TAURUS~1\AppData\Local\Temp\opencode\cloudflared.exe tunnel --url http://localhost:3000"
echo.
echo ======================================
echo   MBPW IS LIVE!
echo ======================================
echo   Public URL: https://artwork-rankings-utc-environment.trycloudflare.com
echo   Local:      http://localhost:3000
echo   Login:      admin@mbpw.com / admin123
echo ======================================
echo.
echo  NOTE: The URL above may change if tunnel restarts.
echo  Check the tunnel window for the current URL.
echo.
pause
