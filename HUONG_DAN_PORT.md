# Hướng Dẫn Cấu Hình Port

## Cấu hình hiện tại

- **Frontend (Vite Dev Server)**: Port **3001**
  - URL: `http://localhost:3001`
  - Truy cập test-lab: `http://localhost:3001/test-lab`

- **Backend (Express Server)**: Port **3002**
  - API URL: `http://localhost:3002/api`
  - Frontend tự động proxy `/api/*` → `http://localhost:3002/api/*`

## Cách khởi động

### Bước 1: Khởi động Backend (Port 3002)
```bash
npm start
# Hoặc
cd BE
node app.js
```

### Bước 2: Khởi động Frontend (Port 3001)
```bash
cd FE
npm run dev
```

## Truy cập Test Lab

Sau khi cả 2 server đã chạy:
```
http://localhost:3001/test-lab
```

## Lưu ý

- Frontend dev server chạy trên port 3001
- Backend API server chạy trên port 3002
- Frontend tự động proxy các request `/api/*` đến backend
- Không cần cấu hình CORS vì đã có proxy

## Nếu muốn đổi lại

### Để Frontend dùng port 3001, Backend dùng 3002:
- ✅ Đã cấu hình sẵn

### Để Frontend dùng port 5173, Backend dùng 3001:
1. Sửa `FE/vite.config.js`: `port: 5173`
2. Sửa `FE/package.json`: `"dev": "vite --port 5173"`
3. Sửa `config.env`: `PORT=3001`
4. Sửa `FE/vite.config.js` proxy: `target: 'http://localhost:3001'`

