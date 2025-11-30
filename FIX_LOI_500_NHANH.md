# Fix Lỗi 500 Nhanh - AI Endpoints

## ⚠️ Vấn Đề

Cả hai endpoint trả về **500 Internal Server Error**:
- `/api/ai/generate-description` 
- `/api/ai/analyze-market`

## 🔧 Fix Nhanh (3 Bước)

### Bước 1: Restart Backend

**Cách nhanh nhất:**
```bash
restart-backend-fix.bat
```

Script này sẽ:
- ✅ Dừng tất cả process Node.js cũ
- ✅ Kiểm tra API key trong config.env
- ✅ Khởi động backend mới
- ✅ Hiển thị hướng dẫn kiểm tra logs

**Hoặc thủ công:**
1. Dừng backend hiện tại (Ctrl+C trong terminal backend)
2. Chạy: `start-backend.bat`
3. Đợi 5 giây

### Bước 2: Kiểm Tra Logs Backend

Sau khi restart, xem terminal backend có hiển thị:

**✅ Nếu thấy:**
```
🔑 [AI Controller] GEMINI_API_KEY check: { hasKey: true, ... }
🤖 [AI Controller] Gemini initialization: { hasGenAI: true, hasModel: true, ... }
Server is running on port 3001
```

→ Backend đã sẵn sàng ✅

**❌ Nếu thấy:**
```
❌ [AI Controller] GEMINI_API_KEY or GOOGLE_AI_API_KEY not found
```

→ API key chưa được load → Kiểm tra `config.env`

### Bước 3: Test Lại

1. **Refresh trang Test Lab**: `http://localhost:5173/test-lab`
2. **Click "⚡ Fill Test Data"**
3. **Click "🤖 Analyze Market"** hoặc **"✨ Generate Description"**
4. **Xem logs backend** để biết lỗi chi tiết

## 📋 Xem Logs Chi Tiết

Khi bạn click nút AI, xem terminal backend:

**Nếu thành công:**
```
🤖 [AI] Generating description for: { propertyType: 'Căn hộ', ... }
📡 [AI] Calling Gemini API...
📝 [AI] Raw response from Gemini: ...
✅ [AI] Description generated successfully
```

**Nếu lỗi:**
```
❌ [AI] Error generating description: [error message]
❌ [AI] Error message: [chi tiết]
❌ [AI] Error stack: [stack trace]
```

→ Copy toàn bộ error message để debug

## 🔍 Các Lỗi Thường Gặp

### 1. "API key not valid"
**Nguyên nhân:** API key không hợp lệ hoặc đã hết hạn

**Fix:**
- Tạo API key mới tại: https://makersuite.google.com/app/apikey
- Cập nhật trong `config.env`
- Restart backend

### 2. "Quota exceeded"
**Nguyên nhân:** API key đã hết quota

**Fix:**
- Kiểm tra usage tại Google Cloud Console
- Tạo API key mới hoặc nâng cấp plan

### 3. "Network error" hoặc "ECONNREFUSED"
**Nguyên nhân:** Không kết nối được đến Google API

**Fix:**
- Kiểm tra internet connection
- Kiểm tra firewall có chặn không

### 4. "Model not found"
**Nguyên nhân:** Model name không đúng

**Fix:**
- Kiểm tra trong code: `gemini-1.5-flash` có đúng không
- Xem file `BE/controllers/ai.controller.js` dòng 22

## 🧪 Test Script

Chạy script test để xem chi tiết:
```bash
test-ai.bat
```

Script sẽ hiển thị:
- Request data
- Response status
- Error message chi tiết (nếu có)

## ✅ Checklist

- [ ] Backend đã restart (`restart-backend-fix.bat`)
- [ ] Logs hiển thị `hasKey: true`
- [ ] Logs hiển thị `hasGenAI: true, hasModel: true`
- [ ] Test lại trên Test Lab
- [ ] Xem logs backend khi click nút AI
- [ ] Copy error message (nếu vẫn lỗi)

## 📞 Nếu Vẫn Lỗi

Gửi cho tôi:
1. **Logs từ terminal backend** (khi click nút AI)
2. **Error message** chi tiết
3. **Response từ test script** (`test-ai.bat`)

Tôi sẽ giúp bạn debug tiếp!

