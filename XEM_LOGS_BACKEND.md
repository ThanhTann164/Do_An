# Hướng Dẫn Xem Logs Backend Để Debug Lỗi 500

## ⚠️ Vấn Đề Hiện Tại

Từ Test Lab, tôi thấy:
- **Market Analysis**: Trả về fallback `{ "valuation": "Chưa xác định", "pros": [], "cons": [] }`
  - ✅ Backend đã xử lý request
  - ❌ Có lỗi khi gọi Gemini API hoặc parse JSON
- **Generate Description**: Vẫn lỗi 500
  - ❌ Backend trả về 500 error

## 🔍 Cách Xem Logs Backend

### Bước 1: Mở Cửa Sổ Backend

Tìm cửa sổ terminal có title: **"Backend Server - AI Debug"**

Nếu không thấy, chạy lại:
```bash
restart-backend-fix.bat
```

### Bước 2: Xem Logs Khi Click Nút AI

Khi bạn click **"🤖 Analyze Market"** hoặc **"✨ Generate Description"** trên Test Lab, xem logs trong cửa sổ backend:

**Nếu thành công, bạn sẽ thấy:**
```
🤖 [AI] Generating description for: { propertyType: 'Nhà phố', ... }
📡 [AI] Calling Gemini API...
📝 [AI] Raw response from Gemini: [đoạn text từ Gemini]
✅ [AI] Description generated successfully
```

**Nếu lỗi, bạn sẽ thấy:**
```
❌ [AI] Error generating description: [error message]
❌ [AI] Error message: [chi tiết]
❌ [AI] Error name: [tên lỗi]
❌ [AI] Error code: [mã lỗi]
❌ [AI] Error stack: [stack trace]
```

### Bước 3: Copy Error Message

**Copy toàn bộ error message** và gửi cho tôi, bao gồm:
- Error message
- Error name
- Error code
- Error stack (nếu có)

## 🧪 Test Trực Tiếp API

Chạy script test:
```bash
cmd /c test-ai.bat
```

Hoặc test thủ công bằng curl:
```bash
curl -X POST http://localhost:3001/api/ai/generate-description ^
  -H "Content-Type: application/json" ^
  -d "{\"propertyType\":\"Căn hộ\",\"location\":\"Quận 1\",\"area\":50,\"price\":2000000000}"
```

## 📋 Các Lỗi Thường Gặp

### 1. "API key not valid" hoặc "Invalid API key"
**Nguyên nhân:** API key không hợp lệ

**Fix:**
- Kiểm tra API key trong `config.env`
- Tạo API key mới tại: https://makersuite.google.com/app/apikey
- Restart backend

### 2. "Quota exceeded" hoặc "Resource exhausted"
**Nguyên nhân:** API key đã hết quota

**Fix:**
- Kiểm tra usage tại Google Cloud Console
- Tạo API key mới hoặc nâng cấp plan

### 3. "Network error" hoặc "ECONNREFUSED"
**Nguyên nhân:** Không kết nối được đến Google API

**Fix:**
- Kiểm tra internet connection
- Kiểm tra firewall/proxy

### 4. "Model not found" hoặc "Invalid model"
**Nguyên nhân:** Model name không đúng

**Fix:**
- Kiểm tra trong code: `gemini-1.5-flash` có đúng không
- Xem file `BE/controllers/ai.controller.js` dòng 22

### 5. "Response parsing error"
**Nguyên nhân:** Gemini trả về format không đúng

**Fix:**
- Xem raw response trong logs
- Điều chỉnh prompt hoặc xử lý response

## ✅ Checklist Debug

- [ ] Backend đang chạy (cửa sổ "Backend Server - AI Debug")
- [ ] Logs hiển thị khi click nút AI
- [ ] Copy error message chi tiết
- [ ] Test với script `test-ai.bat`
- [ ] Kiểm tra API key trong `config.env`
- [ ] Restart backend sau khi sửa

## 📞 Gửi Thông Tin Để Debug

Gửi cho tôi:
1. **Logs từ terminal backend** (khi click nút AI)
2. **Error message** đầy đủ (message, name, code, stack)
3. **Response từ test script** (`test-ai.bat`)
4. **Raw response từ Gemini** (nếu có trong logs)

Tôi sẽ giúp bạn fix tiếp!

