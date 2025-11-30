@echo off
chcp 65001 >nul
title Restart Server & Test AI
echo ========================================
echo    RESTART SERVER & TEST AI
echo ========================================
echo.

echo [1/3] Đang dừng các process cũ (nếu có)...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Đang khởi động Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && node BE/app.js"
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Đang chạy test AI endpoints...
echo.
node BE/test-ai-endpoints.js

echo.
echo ========================================
echo    HOÀN TẤT
echo ========================================
echo.
echo Backend đang chạy tại: http://localhost:3001
echo.
echo Để test trên browser:
echo 1. Mở: http://localhost:5173/test-lab
echo 2. Hoặc đăng nhập và vào trang "Đăng tin"
echo.
pause

