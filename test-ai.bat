@echo off
chcp 65001 >nul
title Test AI Endpoints
echo ========================================
echo    TEST AI ENDPOINTS
echo ========================================
echo.
echo Đang chạy test các chức năng AI...
echo.
cd /d %~dp0
node BE/test-ai-endpoints.js
echo.
pause

