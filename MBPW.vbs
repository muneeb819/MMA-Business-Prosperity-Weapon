Set WshShell = CreateObject("WScript.Shell")
projectDir = Replace(WScript.ScriptFullName, WScript.ScriptName, "")

' Kill old instances
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %a >nul 2>&1", 0, True
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %a >nul 2>&1", 0, True
WScript.Sleep 1000

' Start backend
WshShell.Run "cmd /c title MBPW-Backend && cd /d """ & projectDir & "backend"" && ""C:\Python314\python.exe"" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload", 1, False
WScript.Sleep 5000

' Seed database
WshShell.Run "cmd /c curl -s -X POST http://localhost:8000/api/seed >nul 2>&1", 0, True
WScript.Sleep 1000

' Start frontend
WshShell.Run "cmd /c title MBPW-Frontend && cd /d """ & projectDir & """ && ""C:\Users\Taurus Tech\nodejs-v20\node-v20.19.0-win-x64\node.exe"" node_modules\.bin\next dev --turbopack", 1, False
WScript.Sleep 10000

' Open browser
WshShell.Run "http://localhost:3000"
