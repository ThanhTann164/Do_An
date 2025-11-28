@echo off
echo ====================================
echo   KHOI DONG HE THONG CHAT REALTIME
echo ====================================
echo.

echo [1/4] Kiem tra dependencies...
cd FE
if not exist "node_modules\socket.io-client" (
    echo Installing socket.io-client...
    call npm install socket.io-client
)
cd ..

echo.
echo [2/4] Tao database tables (neu chua co)...
node BE\scripts\createChatTables.js

echo.
echo [3/4] Khoi dong Backend server...
start cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo.
echo [4/4] Khoi dong Frontend...
start cmd /k "cd FE && npm run dev"

echo.
echo ====================================
echo   DA KHOI DONG THANH CONG!
echo ====================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Dang nhap voi:
echo   Email: admin@smarthome.com
echo   Password: Admin@123
echo.
echo Nhan phim bat ky de dong...
pause > nul

