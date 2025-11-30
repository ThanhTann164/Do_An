@echo off
chcp 65001 >nul
title Check Backend Status
echo ========================================
echo    KIỂM TRA BACKEND STATUS
echo ========================================
echo.

echo [1/3] Kiểm tra process Node.js đang chạy...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I /N "node.exe">nul
if "%ERRORLEVEL%"=="0" (
    echo ✅ Node.js đang chạy
    tasklist /FI "IMAGENAME eq node.exe"
) else (
    echo ❌ Node.js không chạy
)

echo.
echo [2/3] Kiểm tra port 3001...
netstat -ano | findstr :3001
if "%ERRORLEVEL%"=="0" (
    echo ✅ Port 3001 đang được sử dụng
) else (
    echo ❌ Port 3001 không được sử dụng - Backend có thể chưa chạy
)

echo.
echo [3/3] Test API endpoint...
curl -s http://localhost:3001/api/test 2>nul
if "%ERRORLEVEL%"=="0" (
    echo ✅ Backend đang phản hồi
) else (
    echo ❌ Backend không phản hồi
)

echo.
echo ========================================
echo    KẾT QUẢ
echo ========================================
echo.
echo Nếu backend không chạy, hãy chạy: start-backend.bat
echo.
pause

