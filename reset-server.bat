@echo off
echo ========================================
echo   RESET SERVER - DUNG TAT CA SERVICES
echo ========================================
echo.

echo [1/4] Dung Docker containers...
docker-compose down
if %errorlevel% neq 0 (
    echo Warning: Docker Compose may not be running
)

echo.
echo [2/4] Dung Backend Node.js (Port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo Dang dung process PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [3/4] Dung Redis (Port 6379)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":6379" ^| findstr "LISTENING"') do (
    echo Dang dung process PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [4/4] Dung MySQL (Port 3306)...
echo Note: MySQL service co the can quyen Admin
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3306" ^| findstr "LISTENING"') do (
    echo Dang dung process PID: %%a
    taskkill /F /PID %%a 2>nul
    if %errorlevel% neq 0 (
        echo Warning: Khong the dung MySQL process. Co the can quyen Admin.
        echo Ban co the dung MySQL service bang cach:
        echo   1. Mo Services (services.msc)
        echo   2. Tim "MySQL" service
        echo   3. Click chuot phai va chon "Stop"
    )
)

echo.
echo ========================================
echo   Kiem tra cac port con dang chay:
echo ========================================
netstat -ano | findstr ":3001 :3306 :6379" | findstr "LISTENING"
if %errorlevel% equ 0 (
    echo.
    echo Warning: Mot so port van con dang chay!
    echo Ban co the can dung thu cong hoac chay lai script voi quyen Admin.
) else (
    echo.
    echo ✓ Tat ca cac port da duoc giai phong!
)

echo.
echo ========================================
echo   RESET HOAN TAT
echo ========================================
echo.
echo De start lai Docker containers:
echo   docker-compose up -d
echo.
pause


