@echo off
chcp 65001 >nul
title Backend Server - Port 3001
echo ========================================
echo    BACKEND SERVER
echo ========================================
echo.
echo Đang khởi động Backend Server...
echo Port: 3001
echo.
cd /d %~dp0
node BE/app.js
pause

