@echo off
title MBPW - Starting...
color 0A
echo.
echo  ============================================
echo   MMA Business Prosperity Weapon - Starting
echo  ============================================
echo.

:: Kill any existing instances
echo [1/5] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

:: Start Backend
echo [2/5] Starting backend on port 8000...
start "MBPW-Backend" cmd /c "cd /d "%~dp0backend" && "C:\Python314\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait for backend
echo [3/5] Waiting for backend...
timeout /t 5 /nobreak >nul

:: Seed database if empty
echo [4/5] Checking database...
curl -s -X POST http://localhost:8000/api/seed >nul 2>&1

:: Start Frontend
echo [5/5] Starting frontend on port 3000...
start "MBPW-Frontend" cmd /c "cd /d "%~dp0" && "C:\Users\Taurus Tech\nodejs-v20\node-v20.19.0-win-x64\node.exe" node_modules\next\dist\bin\next dev --turbopack"

:: Wait then open browser
echo.
echo Waiting for frontend to compile...
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo  ============================================
echo   MBPW is running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo  ============================================
echo.
echo  Close this window. Backend and frontend
echo  keep running until you close them.
echo.
pause
