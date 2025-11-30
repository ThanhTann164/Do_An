# Hướng Dẫn Debug Lỗi 500 trong AI Features

## Vấn đề: Lỗi 500 Internal Server Error khi gọi AI API

Khi test trang `/test-lab`, bạn gặp lỗi 500 khi gọi:
- `/api/ai/analyze-market`
- `/api/ai/generate-description`

## Các bước debug:

### Bước 1: Kiểm tra Backend Logs

Mở terminal chạy Backend server và xem logs:

```bash
# Terminal Backend
npm start
```

Tìm các log sau khi khởi động:
- `🔑 [AI Controller] GEMINI_API_KEY check:` - Kiểm tra API key có được load không
- `🤖 [AI Controller] Gemini initialization:` - Kiểm tra model có được khởi tạo không

### Bước 2: Kiểm tra API Key

Mở file `config.env` và đảm bảo có:
```
GEMINI_API_KEY=AIzaSyBJIz8NYiodrK2UGnSyyp5YfeeqEaPKwFw
GOOGLE_AI_API_KEY=AIzaSyBJIz8NYiodrK2UGnSyyp5YfeeqEaPKwFw
```

### Bước 3: Restart Backend Server

Sau khi thêm/sửa API key, **PHẢI restart Backend server**:

```bash
# Dừng server (Ctrl+C)
# Chạy lại
npm start
```

### Bước 4: Kiểm tra Console Logs

Khi gọi API, xem backend logs có hiển thị:
- `❌ [AI] Error generating description:` - Lỗi cụ thể
- `❌ [AI] Error details:` - Chi tiết lỗi (message, name, code)

### Bước 5: Test API trực tiếp

Mở terminal mới và test:

```bash
# Test Analyze Market
curl -X POST http://localhost:3001/api/ai/analyze-market ^
  -H "Content-Type: application/json" ^
  -d "{\"location\":\"Quận 2, Thành phố Hồ Chí Minh\",\"propertyType\":\"Biệt thự\",\"area\":300,\"price\":15000000000}"

# Test Generate Description
curl -X POST http://localhost:3001/api/ai/generate-description ^
  -H "Content-Type: application/json" ^
  -d "{\"propertyType\":\"Biệt thự\",\"location\":\"Quận 2, Thành phố Hồ Chí Minh\",\"area\":300,\"price\":15000000000}"
```

## Các lỗi thường gặp:

### Lỗi 1: "AI service is not configured"
**Nguyên nhân:** GEMINI_API_KEY không được load
**Giải pháp:**
1. Kiểm tra `config.env` có API key không
2. Kiểm tra backend logs có hiển thị `hasKey: true` không
3. Restart backend server

### Lỗi 2: "API key not valid" hoặc "403 Forbidden"
**Nguyên nhân:** API key không hợp lệ hoặc đã hết hạn
**Giải pháp:**
1. Tạo API key mới tại: https://aistudio.google.com/app/apikey
2. Cập nhật trong `config.env`
3. Restart backend server

### Lỗi 3: "Rate limit exceeded"
**Nguyên nhân:** Đã vượt quá giới hạn API calls
**Giải pháp:**
1. Đợi một chút rồi thử lại
2. Kiểm tra quota tại Google AI Studio

### Lỗi 4: "Network error" hoặc timeout
**Nguyên nhân:** Không kết nối được với Google API
**Giải pháp:**
1. Kiểm tra internet connection
2. Kiểm tra firewall/proxy
3. Thử lại sau

## Kiểm tra Response trong Browser

1. Mở DevTools (F12)
2. Vào tab **Network**
3. Click lại nút "Analyze Market" hoặc "Generate Description"
4. Click vào request bị lỗi (màu đỏ)
5. Vào tab **Response** để xem error message chi tiết

## Logs đã được thêm

Backend đã có logging chi tiết:
- ✅ Log khi khởi tạo Gemini (API key check, model initialization)
- ✅ Log chi tiết khi có lỗi (message, name, code, stack)
- ✅ Error response bao gồm chi tiết lỗi trong development mode

## Next Steps

Sau khi restart backend, hãy:
1. Xem backend logs khi khởi động
2. Test lại trên `/test-lab`
3. Xem error message chi tiết trong Network tab
4. Gửi cho tôi error message để tôi giúp fix tiếp

