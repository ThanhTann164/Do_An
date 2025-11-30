@echo off
chcp 65001 >nul
title Xem Logs Backend
echo ========================================
echo    HƯỚNG DẪN XEM LOGS BACKEND
echo ========================================
echo.
echo 📍 LOGS HIỂN THỊ Ở ĐÂU?
echo.
echo 1. Tìm cửa sổ Terminal đang chạy "npm start"
echo    - Có thể là cửa sổ "Backend Server - AI Debug"
echo    - Hoặc cửa sổ bạn vừa chạy lệnh npm start
echo.
echo 2. Xem logs trong cửa sổ đó:
echo    - Logs khởi động: Ở đầu terminal (scroll lên)
echo    - Logs khi test:  Hiển thị real-time khi click nút AI
echo.
echo ========================================
echo    LOGS KHI KHỞI ĐỘNG
echo ========================================
echo.
echo Bạn sẽ thấy:
echo   🔑 [AI Controller] GEMINI_API_KEY check: { hasKey: true, ... }
echo   🤖 [AI Controller] Gemini initialization: { ... }
echo   Server is running on port 3001
echo.
echo ========================================
echo    LOGS KHI TEST AI
echo ========================================
echo.
echo Khi click nút AI trên Test Lab, bạn sẽ thấy:
echo   📊 [AI] Analyzing market for: { ... }
echo   🔍 [AI] Gemini Input: { ... }
echo   📝 [AI] Raw response from Gemini: ...
echo   ✅ [AI] JSON parsed successfully
echo   🔍 [AI] Gemini Output: { ... }
echo.
echo ========================================
echo    NẾU KHÔNG THẤY TERMINAL
echo ========================================
echo.
echo Chạy lệnh sau để mở terminal mới:
echo   npm start
echo.
echo Giữ cửa sổ terminal này mở để xem logs!
echo.
pause

