# Fix Model Name - Dùng gemini-pro

## ⚠️ Vấn Đề

Cả `gemini-1.5-flash` và `gemini-1.5-pro` đều không được hỗ trợ trong v1beta API:
```
[404 Not Found] models/gemini-1.5-pro is not found for API version v1beta
```

## ✅ Đã Fix

Đã đổi model name từ `gemini-1.5-pro` → `gemini-pro`

**Lý do:**
- `gemini-pro` là model cơ bản, chắc chắn hoạt động với v1beta API
- `gemini-1.5-pro` và `gemini-1.5-flash` không được hỗ trợ trong v1beta

## 🔄 Cần Làm

### Bước 1: Restart Backend

**BẮT BUỘC**: Restart backend để áp dụng thay đổi:

1. Trong terminal đang chạy `npm start`, nhấn **Ctrl + C** để dừng server
2. Chạy lại:
   ```bash
   npm start
   ```

### Bước 2: Kiểm Tra Logs

Sau khi restart, logs phải hiển thị:
```
🤖 [AI Controller] Gemini initialization: { 
  hasGenAI: true, 
  hasModel: true, 
  modelName: 'gemini-pro',  ← Phải là 'gemini-pro'
  packageVersion: '0.24.1'
}
```

### Bước 3: Test Lại

1. Mở Test Lab: `http://localhost:5173/test-lab`
2. Click "⚡ Fill Test Data"
3. Click "🤖 Analyze Market" hoặc "✨ Generate Description"
4. Xem Terminal Backend - không còn lỗi 404

## 📋 Model Names Đã Thử

- ❌ `gemini-1.5-flash` → 404 Not Found
- ❌ `gemini-1.5-pro` → 404 Not Found
- ✅ `gemini-pro` → Nên hoạt động (model cơ bản)

## ⚠️ Lưu Ý

- `gemini-pro` có thể chậm hơn nhưng chắc chắn hoạt động
- Model này được hỗ trợ đầy đủ trong v1beta API
- Không cần đổi model nữa nếu `gemini-pro` hoạt động

## ✅ Checklist

- [ ] Model name đã đổi thành `gemini-pro`
- [ ] Backend đã restart
- [ ] Logs hiển thị `modelName: 'gemini-pro'`
- [ ] Test lại trên Test Lab
- [ ] Không còn lỗi 404

