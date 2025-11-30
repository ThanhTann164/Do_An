# Fix Lỗi 500 Trong Test Lab

## Vấn Đề

Trang `/test-lab` gặp lỗi **500 Internal Server Error** khi gọi AI API.

## Nguyên Nhân

1. **Backend chưa restart** sau khi thêm API key
2. **Backend không chạy**
3. **API key không hợp lệ** hoặc hết quota

## Cách Fix

### Bước 1: Kiểm Tra Backend Có Chạy Không

Mở terminal mới và chạy:
```bash
start-backend.bat
```

Hoặc:
```bash
cd BE
npm start
```

### Bước 2: Kiểm Tra Logs Backend

Khi backend khởi động, bạn sẽ thấy:
```
🔑 [AI Controller] GEMINI_API_KEY check: { hasKey: true, ... }
🤖 [AI Controller] Gemini initialization: { hasGenAI: true, hasModel: true, ... }
```

Nếu `hasKey: false` → API key chưa được load → **Restart backend**

### Bước 3: Test Lại Trên Test Lab

1. Mở browser: `http://localhost:5173/test-lab`
2. Click "⚡ Fill Test Data"
3. Click "🤖 Analyze Market" hoặc "✨ Generate Description"
4. Xem logs trong terminal backend

### Bước 4: Xem Chi Tiết Lỗi

Nếu vẫn lỗi 500, xem logs backend để biết lỗi cụ thể:

**Lỗi thường gặp:**
- `API service is not configured` → API key chưa được load
- `API key not valid` → API key không hợp lệ
- `Quota exceeded` → API key hết quota

## Đã Fix

✅ **TestLab.jsx** đã được cập nhật để xử lý đúng response format từ backend:
- `generateDescription`: Đọc `result.description` thay vì `result`
- `analyzeMarketNew`: Đọc `result.data` thay vì `result`

## Checklist

- [ ] Backend đang chạy (`npm start` trong BE/)
- [ ] Logs backend hiển thị `hasKey: true`
- [ ] Test Lab page load được
- [ ] Click "Fill Test Data" → Form được điền
- [ ] Click "Analyze Market" → Không còn lỗi 500
- [ ] Click "Generate Description" → Không còn lỗi 500

## Nếu Vẫn Lỗi

1. **Kiểm tra Network tab** trong browser:
   - Xem request có đến backend không
   - Xem response error message

2. **Kiểm tra backend logs**:
   - Copy toàn bộ error message
   - Gửi cho tôi để debug tiếp

3. **Test API key trực tiếp**:
   - Tạo file `BE/test-gemini.js` (xem `HUONG_DAN_FIX_500_AI.md`)
   - Chạy `node test-gemini.js`
   - Xem có lỗi gì không

