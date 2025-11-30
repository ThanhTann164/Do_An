@echo off
echo ========================================
echo   RESTARTING BACKEND SERVER
echo ========================================
echo.

echo [1/3] Stopping existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] Starting backend server...
cd BE
start "Backend Server" cmd /k "node app.js"

echo [3/3] Waiting for server to start...
timeout /t 5 >nul

echo.
echo ========================================
echo   SERVER RESTARTED!
echo   Backend: http://localhost:3001
echo ========================================
echo.
echo Press any key to exit...
pause >nul



