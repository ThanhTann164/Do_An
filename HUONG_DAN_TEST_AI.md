# Hướng Dẫn Test Chức Năng AI

## Bước 1: Cài Đặt Dependencies (Nếu Chưa Có)

Nếu chưa có `axios`, chạy:
```bash
cd BE
npm install axios
```

Hoặc từ thư mục gốc:
```bash
npm install axios --prefix BE
```

## Bước 2: Khởi Động Backend Server

**Cách 1: Dùng Script (Khuyên dùng)**
```bash
start-backend.bat
```

**Cách 2: Thủ công**
```bash
cd BE
npm start
```

Hoặc:
```bash
cd BE
node app.js
```

**Kiểm tra server đã chạy:**
- Mở browser: `http://localhost:3001/api/test` (nếu có route test)
- Hoặc xem terminal có log: `Server is running on port 3001`

## Bước 3: Chạy Test Script

**Cách 1: Dùng Script (Khuyên dùng)**
```bash
test-ai.bat
```

**Cách 2: Thủ công**
```bash
node BE/test-ai-endpoints.js
```

## Kết Quả Test

Script sẽ test 4 endpoints:
1. ✅ **Generate Description** - Tạo mô tả bất động sản
2. ✅ **Analyze Market** - Phân tích thị trường
3. ✅ **Optimize Title** - Tối ưu tiêu đề
4. ✅ **Optimize Description** - Tối ưu mô tả

### Output Mẫu:

```
🚀 Starting AI Endpoints Test Suite
API Base URL: http://localhost:3001

🧪 Testing: Generate Description
✅ SUCCESS (1234ms)
Status: 200
Response: {
  "success": true,
  "description": "..."
}

🧪 Testing: Analyze Market
✅ SUCCESS (2345ms)
Status: 200
Response: {
  "success": true,
  "data": {
    "valuation": "Hợp lý",
    "pros": [...],
    "cons": [...]
  }
}

📊 TEST SUMMARY
Total Tests: 4
✅ Passed: 4
❌ Failed: 0

🎉 All tests passed!
```

## Nếu Có Lỗi

### Lỗi: "Cannot find module 'axios'"
**Fix:**
```bash
cd BE
npm install axios
```

### Lỗi: "ECONNREFUSED" hoặc "No response from server"
**Fix:**
- Kiểm tra backend có đang chạy không
- Kiểm tra port 3001 có bị chiếm không
- Restart backend: `start-backend.bat`

### Lỗi: "GEMINI_API_KEY not found"
**Fix:**
- Kiểm tra file `config.env` có `GEMINI_API_KEY` không
- Restart backend sau khi thêm API key

### Lỗi: "500 Internal Server Error"
**Fix:**
- Xem logs trong terminal backend
- Kiểm tra API key có hợp lệ không
- Xem file `HUONG_DAN_FIX_500_AI.md` để debug chi tiết

## Test Trên Browser (Test Lab Page)

Sau khi backend chạy, mở browser:
```
http://localhost:5173/test-lab
```

1. Click "⚡ Fill Test Data"
2. Click "🤖 Analyze Market" hoặc "✨ Generate Description"
3. Xem kết quả

## Test Trên Create Post Page

1. Đăng nhập với tài khoản Premium
2. Vào trang "Đăng tin"
3. Điền thông tin
4. Click các nút AI:
   - "✨ AI Viết Mô Tả"
   - "🤖 AI Định Giá & Phân Tích"
   - "✨ AI Tối ưu tiêu đề"
   - "Tối ưu mô tả"

## Debug

Nếu test script fail, xem chi tiết:
- **Status code**: 200 = OK, 400 = Bad Request, 500 = Server Error
- **Error message**: Xem trong response
- **Backend logs**: Xem terminal backend để biết lỗi cụ thể

## Checklist

- [ ] Backend đang chạy (`start-backend.bat`)
- [ ] API key đã được load (xem logs backend)
- [ ] Test script chạy thành công (`test-ai.bat`)
- [ ] Tất cả 4 endpoints đều pass
- [ ] Test Lab page hoạt động (`http://localhost:5173/test-lab`)
- [ ] Create Post page hoạt động (với tài khoản Premium)

