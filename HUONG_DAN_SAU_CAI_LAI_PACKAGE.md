# Hướng Dẫn Sau Khi Cài Lại Package

## ✅ Đã Cài Đặt

Package `@google/generative-ai@latest` đã được cài đặt lại.

## 🔄 Cần Làm

### Bước 1: Restart Backend

**BẮT BUỘC**: Restart backend để nạp package mới:

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

### Bước 2: Kiểm Tra Logs Khi Khởi Động

Xem Terminal Backend, phải thấy:
```
🤖 [AI Controller] Gemini initialization: { 
  hasGenAI: true, 
  hasModel: true, 
  modelName: 'gemini-1.5-flash',
  packageVersion: 'x.x.x'
}
```

### Bước 3: Test Lại

1. Mở Test Lab: `http://localhost:5173/test-lab`
2. Click "⚡ Fill Test Data"
3. Click "🤖 Analyze Market"
4. Xem Terminal Backend

## 📋 Model Names Có Thể Dùng

Sau khi cài lại package mới nhất, các model names sau có thể hoạt động:

- ✅ `gemini-1.5-flash` (đã set - nên hoạt động với package mới)
- `gemini-1.5-pro`
- `gemini-pro`
- `gemini-1.0-pro`

## ⚠️ Nếu Vẫn Lỗi 404

Nếu vẫn gặp lỗi 404 với `gemini-1.5-flash`, thử đổi sang:

1. Mở `BE/controllers/ai.controller.js`
2. Tìm dòng: `model: 'gemini-1.5-flash'`
3. Đổi thành: `model: 'gemini-1.5-pro'`
4. Restart backend

## 🧪 Kiểm Tra Package Version

Để xem version đã cài:
```bash
cd BE
npm list @google/generative-ai
```

Version mới nhất thường là `0.24.x` hoặc cao hơn.

## ✅ Checklist

- [ ] Package đã được cài đặt (`npm install @google/generative-ai@latest`)
- [ ] Backend đã restart
- [ ] Logs hiển thị `modelName: 'gemini-1.5-flash'`
- [ ] Test lại trên Test Lab
- [ ] Không còn lỗi 404

