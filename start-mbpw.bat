@echo off
title MBPW Server - MMA Business Prosperity Weapon
echo ======================================
echo   MBPW SERVER LAUNCHER
echo ======================================
echo.
echo Starting servers...
echo.
start "MBPW-Backend" cmd /c "cd /d C:\MMA Business Prosperity Weapon\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"
timeout /t 3 /nobreak >nul
start "MBPW-Frontend" cmd /c "cd /d C:\MMA Business Prosperity Weapon && npx next dev -H 0.0.0.0 -p 3000"
echo.
echo Waiting for servers to start...
timeout /t 20 /nobreak >nul
echo.
echo ======================================
echo   MBPW IS RUNNING!
echo ======================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8001
echo   Login:    admin@mbpw.com / admin123
echo.
echo   Close this window to stop the servers.
echo ======================================
echo.
pause
