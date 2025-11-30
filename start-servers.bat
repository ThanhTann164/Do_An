@echo off
chcp 65001 >nul
echo ========================================
echo    KHỞI ĐỘNG SERVER
echo ========================================
echo.

echo [1/2] Đang khởi động Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && npm start"
timeout /t 3 /nobreak >nul

echo [2/2] Đang khởi động Frontend Server...
start "Frontend Server" cmd /k "cd /d %~dp0FE && npm run dev"

echo.
echo ========================================
echo    SERVER ĐÃ ĐƯỢC KHỞI ĐỘNG
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Đóng cửa sổ này để tiếp tục...
pause

