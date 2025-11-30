# Hướng Dẫn Chạy Server

## Cách 1: Sử dụng Script Tự Động (Khuyên dùng)

### Windows:
Double-click file `start-servers.bat` - Script sẽ tự động mở 2 cửa sổ terminal:
- Backend Server (port 3001)
- Frontend Server (port 5173)

## Cách 2: Chạy Thủ Công

### Bước 1: Khởi động Backend

Mở terminal/PowerShell và chạy:

```bash
# Từ thư mục gốc
npm start

# Hoặc
node BE/app.js
```

Backend sẽ chạy tại: `http://localhost:3001`

### Bước 2: Khởi động Frontend (Terminal mới)

Mở terminal/PowerShell mới và chạy:

```bash
cd FE
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## Kiểm Tra Server Đã Chạy

### Backend:
- Mở trình duyệt: `http://localhost:3001/health`
- Hoặc: `http://localhost:3001/api/test`
- Kết quả mong đợi: `{"success": true, "message": "API working!"}`

### Frontend:
- Mở trình duyệt: `http://localhost:5173`
- Trang web sẽ hiển thị

## Xử Lý Lỗi

### Lỗi: "Port already in use"
**Giải pháp:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F
```

### Lỗi: "Cannot find module"
**Giải pháp:**
```bash
# Cài đặt lại dependencies
npm install

# Frontend
cd FE
npm install
```

### Lỗi: "Database connection failed"
**Giải pháp:**
1. Kiểm tra MySQL đang chạy
2. Kiểm tra file `config.env` có đúng thông tin không
3. Kiểm tra database `smarthome` đã tồn tại chưa

### Lỗi: "GEMINI_API_KEY not found"
**Giải pháp:**
1. Mở file `config.env`
2. Đảm bảo có dòng:
   ```
   GEMINI_API_KEY=AIzaSyBJIz8NYiodrK2UGnSyyp5YfeeqEaPKwFw
   ```
3. Restart server

## Lệnh Hữu Ích

### Kiểm tra port đang sử dụng:
```bash
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

### Xem log Backend:
- Mở cửa sổ terminal Backend
- Xem console output

### Xem log Frontend:
- Mở cửa sổ terminal Frontend
- Xem console output
- Hoặc mở DevTools (F12) trong trình duyệt

## Troubleshooting

### Server không khởi động:
1. Kiểm tra Node.js đã cài: `node --version`
2. Kiểm tra npm đã cài: `npm --version`
3. Kiểm tra dependencies: `npm list --depth=0`

### Backend lỗi khi start:
1. Kiểm tra file `config.env` tồn tại
2. Kiểm tra MySQL đang chạy
3. Xem error message trong terminal

### Frontend lỗi khi start:
1. Kiểm tra đã cài dependencies: `cd FE && npm install`
2. Kiểm tra port 5173 có bị chiếm không
3. Xem error message trong terminal

