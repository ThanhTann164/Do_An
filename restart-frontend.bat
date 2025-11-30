@echo off
chcp 65001 >nul
title Restart Frontend - Test Lab
echo ========================================
echo    RESTART FRONTEND - TEST LAB
echo ========================================
echo.

echo [1/3] Đang dừng các process frontend cũ...
taskkill /F /FI "WINDOWTITLE eq Frontend Server*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Vite*" 2>nul
timeout /t 2 /nobreak >nul
echo ✅ Đã dừng các process cũ

echo.
echo [2/3] Đang khởi động Frontend Server...
start "Frontend Server - Test Lab" cmd /k "cd /d %~dp0FE && npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ Frontend đã khởi động

echo.
echo [3/3] Đang chờ frontend sẵn sàng...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    HOÀN TẤT
echo ========================================
echo.
echo ✅ Frontend đã được restart
echo.
echo 🌐 Mở trình duyệt và truy cập:
echo    http://localhost:5173/test-lab
echo.
echo 📋 Kiểm tra logs trong cửa sổ "Frontend Server - Test Lab":
echo    - Tìm dòng: "Local: http://localhost:5173"
echo    - Phải thấy: "ready in X ms"
echo.
echo 🧪 Test Lab sẽ tự động reload khi có thay đổi code
echo.
pause

