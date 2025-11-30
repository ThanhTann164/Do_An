@echo off
chcp 65001 >nul
title Frontend Server - Port 5173
echo ========================================
echo    FRONTEND SERVER
echo ========================================
echo.
echo Đang khởi động Frontend Server...
echo Port: 5173
echo.
cd /d %~dp0FE
npm run dev
pause

