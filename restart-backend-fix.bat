@echo off
chcp 65001 >nul
title Restart Backend - Fix AI Errors
echo ========================================
echo    RESTART BACKEND - FIX AI ERRORS
echo ========================================
echo.

echo [1/4] Đang dừng các process Node.js cũ...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Đã dừng các process cũ

echo.
echo [2/4] Kiểm tra API key trong config.env...
findstr /C:"GEMINI_API_KEY" config.env >nul
if "%ERRORLEVEL%"=="0" (
    echo ✅ API key tìm thấy trong config.env
) else (
    echo ❌ API key KHÔNG tìm thấy trong config.env
    echo    Vui lòng kiểm tra file config.env
    pause
    exit /b 1
)

echo.
echo [3/4] Đang khởi động Backend Server...
start "Backend Server - AI Debug" cmd /k "cd /d %~dp0 && node BE/app.js"
timeout /t 5 /nobreak >nul
echo ✅ Backend đã khởi động

echo.
echo [4/4] Đang chờ backend sẵn sàng...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    HOÀN TẤT
echo ========================================
echo.
echo ✅ Backend đã được restart
echo.
echo 📋 Kiểm tra logs trong cửa sổ "Backend Server - AI Debug":
echo    - Tìm dòng: "🔑 [AI Controller] GEMINI_API_KEY check"
echo    - Phải có: "hasKey: true"
echo    - Tìm dòng: "🤖 [AI Controller] Gemini initialization"
echo    - Phải có: "hasGenAI: true, hasModel: true"
echo.
echo 🧪 Bây giờ test lại trên Test Lab:
echo    1. Refresh trang: http://localhost:5173/test-lab
echo    2. Click "⚡ Fill Test Data"
echo    3. Click "🤖 Analyze Market" hoặc "✨ Generate Description"
echo    4. Xem logs trong cửa sổ backend để biết lỗi chi tiết
echo.
echo ⚠️  Nếu vẫn lỗi, xem logs backend và gửi cho tôi:
echo    - Error message
echo    - Error stack
echo    - Raw response (nếu có)
echo.
pause

