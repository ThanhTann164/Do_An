@echo off
echo ========================================
echo Starting Backend and Frontend Servers
echo ========================================
echo.

echo [1/2] Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd /d D:\Do_An_Main\BE && npm start"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d D:\Do_An_Main\FE && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Servers are starting in separate windows
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
