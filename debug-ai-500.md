# Debug Lỗi 500 AI Endpoints

## Vấn Đề

Cả hai endpoint đều trả về **500 Internal Server Error**:
- `/api/ai/generate-description`
- `/api/ai/analyze-market`

## Các Bước Debug

### Bước 1: Kiểm Tra Backend Có Đang Chạy

**Cách 1: Dùng Script**
```bash
check-backend-status.bat
```

**Cách 2: Thủ công**
- Mở terminal mới
- Chạy: `start-backend.bat`
- Xem logs trong terminal backend

### Bước 2: Xem Logs Backend

Khi bạn click nút AI trên Test Lab, xem terminal backend có hiển thị:

**Nếu thấy:**
```
🔑 [AI Controller] GEMINI_API_KEY check: { hasKey: true, ... }
🤖 [AI Controller] Gemini initialization: { hasGenAI: true, ... }
```

→ API key đã được load ✅

**Nếu thấy:**
```
❌ [AI Controller] GEMINI_API_KEY or GOOGLE_AI_API_KEY not found
```

→ API key chưa được load ❌

**Nếu thấy:**
```
❌ [AI] Error generating description: [chi tiết lỗi]
```

→ Copy toàn bộ error message để debug

### Bước 3: Kiểm Tra API Key

Mở file `config.env` và đảm bảo có:
```env
GEMINI_API_KEY=AIzaSyBJIz8NYiodrK2UGnSyyp5YfeeqEaPKwFw
GOOGLE_AI_API_KEY=AIzaSyBJIz8NYiodrK2UGnSyyp5YfeeqEaPKwFw
```

### Bước 4: Restart Backend

**QUAN TRỌNG**: Sau khi sửa code hoặc thêm API key, **PHẢI restart backend**:

1. Dừng backend (Ctrl+C trong terminal backend)
2. Chạy lại: `start-backend.bat`
3. Đợi 5 giây để server khởi động
4. Test lại trên Test Lab

### Bước 5: Test Trực Tiếp API

Mở terminal và chạy:
```bash
test-ai.bat
```

Hoặc test thủ công:
```bash
curl -X POST http://localhost:3001/api/ai/generate-description \
  -H "Content-Type: application/json" \
  -d "{\"propertyType\":\"Căn hộ\",\"location\":\"Quận 1\",\"area\":50,\"price\":2000000000}"
```

### Bước 6: Xem Chi Tiết Lỗi

Trong terminal backend, khi có lỗi, bạn sẽ thấy:
```
❌ [AI] Error generating description: [error message]
❌ [AI] Error stack: [stack trace]
❌ [AI] Error details: { message, name, code }
```

**Các lỗi thường gặp:**

1. **"API key not valid"**
   - API key không hợp lệ hoặc đã hết hạn
   - Tạo API key mới tại: https://makersuite.google.com/app/apikey

2. **"Quota exceeded"**
   - API key đã hết quota
   - Kiểm tra usage tại Google Cloud Console

3. **"Network error"**
   - Không kết nối được đến Google API
   - Kiểm tra internet connection

4. **"Model not found"**
   - Model name không đúng
   - Kiểm tra: `gemini-1.5-flash` có đúng không

## Fix Nhanh

### Nếu Backend Chưa Chạy:
```bash
start-backend.bat
```

### Nếu API Key Chưa Load:
1. Kiểm tra `config.env` có API key
2. Restart backend
3. Xem logs có `hasKey: true` không

### Nếu Vẫn Lỗi 500:
1. Xem logs backend chi tiết
2. Copy error message
3. Kiểm tra API key có hợp lệ không
4. Test với `test-ai.bat` để xem response chi tiết

## Test Script

Chạy script test để xem chi tiết:
```bash
test-ai.bat
```

Script sẽ hiển thị:
- Request data
- Response status
- Error message chi tiết (nếu có)

## Checklist Debug

- [ ] Backend đang chạy (port 3001)
- [ ] API key có trong `config.env`
- [ ] Backend đã restart sau khi thêm API key
- [ ] Logs backend hiển thị `hasKey: true`
- [ ] Test script (`test-ai.bat`) chạy được
- [ ] Xem error message chi tiết trong logs backend

## Gửi Thông Tin Để Debug

Nếu vẫn lỗi, gửi cho tôi:
1. **Logs từ terminal backend** (khi click nút AI)
2. **Response từ test script** (`test-ai.bat`)
3. **Error message** trong browser console (F12 → Console)

