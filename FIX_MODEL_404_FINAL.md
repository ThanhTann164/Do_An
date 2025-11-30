# Fix Lỗi 404 - Model Name

## ⚠️ Vấn Đề

Model `gemini-1.5-flash` không được hỗ trợ trong API version v1beta:
```
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta
```

## ✅ Đã Fix

Đã đổi model name từ `gemini-1.5-flash` → `gemini-1.5-pro`

## 🔄 Cần Làm

### Bước 1: Restart Backend

**BẮT BUỘC**: Restart backend để áp dụng thay đổi:

1. Mở Terminal Backend
2. Nhấn **Ctrl + C** để dừng server
3. Chạy lại:
   ```bash
   npm start
   ```
   Hoặc:
   ```bash
   node BE/app.js
   ```

### Bước 2: Kiểm Tra Logs

Xem Terminal Backend, phải thấy:
```
🤖 [AI Controller] Gemini initialization: { 
  hasGenAI: true, 
  hasModel: true, 
  modelName: 'gemini-1.5-pro',
  packageVersion: 'x.x.x'
}
```

### Bước 3: Test Lại

1. Mở Test Lab: `http://localhost:5173/test-lab`
2. Click "⚡ Fill Test Data"
3. Click "🤖 Analyze Market" hoặc "✨ Generate Description"
4. Xem Terminal Backend - không còn lỗi 404

## 📋 Model Names Hợp Lệ

Nếu `gemini-1.5-pro` vẫn không hoạt động, thử các model names sau:

1. **`gemini-pro`** (model cơ bản, chắc chắn hoạt động)
2. **`gemini-1.0-pro`** (model 1.0)
3. **`gemini-1.5-pro`** (đã set - nên hoạt động)

## ⚠️ Lưu Ý

- `gemini-1.5-flash` **KHÔNG** được hỗ trợ trong v1beta API
- Phải dùng `gemini-1.5-pro` hoặc `gemini-pro`
- Model `gemini-1.5-pro` có thể chậm hơn nhưng chắc chắn hoạt động

## 🔍 Nếu Vẫn Lỗi

Nếu vẫn gặp lỗi 404, thử đổi sang `gemini-pro`:

1. Mở `BE/controllers/ai.controller.js`
2. Tìm dòng: `model: 'gemini-1.5-pro'`
3. Đổi thành: `model: 'gemini-pro'`
4. Restart backend

## ✅ Checklist

- [ ] Model name đã đổi thành `gemini-1.5-pro`
- [ ] Backend đã restart
- [ ] Logs hiển thị `modelName: 'gemini-1.5-pro'`
- [ ] Test lại trên Test Lab
- [ ] Không còn lỗi 404

