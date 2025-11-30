# Fix Lỗi Model Name - Gemini API

## ⚠️ Lỗi

```
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

## ✅ Đã Fix

Đã đổi model name từ `gemini-1.5-flash` sang `gemini-pro`

## 🔄 Cần Làm

**BẮT BUỘC**: Restart backend để áp dụng thay đổi:

1. Mở Terminal Backend
2. Nhấn **Ctrl + C** để dừng server
3. Chạy lại: `npm start` hoặc `node BE/app.js`

## 📋 Model Names Hợp Lệ

Nếu `gemini-pro` vẫn không hoạt động, thử các model names sau:

- `gemini-pro` ✅ (đã set)
- `gemini-1.5-pro`
- `gemini-1.5-flash-latest`
- `gemini-1.0-pro`

## 🧪 Test Lại

Sau khi restart:
1. Mở Test Lab: `http://localhost:5173/test-lab`
2. Click "⚡ Fill Test Data"
3. Click "🤖 Analyze Market"
4. Xem Terminal Backend - không còn lỗi 404

## ⚠️ Lưu Ý

- `responseMimeType: 'application/json'` đã được bỏ vì có thể không được hỗ trợ
- Code vẫn có `cleanJSON()` để xử lý markdown từ response
- Fallback vẫn hoạt động nếu parse JSON fail

