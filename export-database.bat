@echo off
chcp 65001 >nul
echo ========================================
echo    XUẤT DATABASE TỪ MYSQL
echo ========================================
echo.

REM Đọc thông tin từ config.env
for /f "tokens=2 delims==" %%a in ('findstr "DB_NAME" config.env') do set DB_NAME=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DB_USER" config.env') do set DB_USER=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DB_PASSWORD" config.env') do set DB_PASSWORD=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DB_HOST" config.env') do set DB_HOST=%%a
for /f "tokens=2 delims==" %%a in ('findstr "DB_PORT" config.env') do set DB_PORT=%%a

echo Thông tin Database:
echo - Host: %DB_HOST%
echo - Port: %DB_PORT%
echo - Database: %DB_NAME%
echo - User: %DB_USER%
echo.

REM Tạo tên file với timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set mytime=%mytime: =0%
set FILENAME=backup_%DB_NAME%_%mydate%_%mytime%.sql

echo Đang xuất database...
echo File sẽ được lưu tại: %FILENAME%
echo.

REM Kiểm tra xem mysqldump có trong PATH không
where mysqldump >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [LỖI] Không tìm thấy mysqldump trong PATH!
    echo.
    echo Vui lòng thêm MySQL bin vào PATH hoặc chỉ định đường dẫn đầy đủ.
    echo Ví dụ: C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe
    echo.
    pause
    exit /b 1
)

REM Xuất database
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% > %FILENAME%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [THÀNH CÔNG] Database đã được xuất thành công!
    echo File: %FILENAME%
    echo.
    
    REM Hiển thị kích thước file
    for %%A in (%FILENAME%) do echo Kích thước: %%~zA bytes
) else (
    echo.
    echo [LỖI] Không thể xuất database!
    echo Vui lòng kiểm tra:
    echo 1. MySQL đang chạy
    echo 2. Thông tin đăng nhập trong config.env đúng
    echo 3. User có quyền truy cập database
)

echo.
pause


