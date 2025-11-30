# Hướng Dẫn Fix Lỗi Port 3001

## ⚠️ Lỗi

```
Error: listen EADDRINUSE: address already in use :::3001
```

## ✅ Đã Fix

1. ✅ Đã tìm process đang dùng port 3001 (PID: 18096)
2. ✅ Đã kill process đó
3. ✅ Đã khởi động lại backend

## 🔍 Kiểm Tra Logs

Xem terminal đang chạy `npm start`, phải thấy:

### Logs Khi Khởi Động:

```
🔑 [AI Controller] GEMINI_API_KEY check: {
  hasKey: true,
  ...
}

🤖 [AI Controller] Gemini initialization: { 
  hasGenAI: true, 
  hasModel: true, 
  modelName: 'gemini-1.5-flash',  ← ĐÚNG RỒI!
  packageVersion: '0.24.1',
  apiKeyConfigured: true
}

Server is running on port 3001  ← Phải thấy dòng này (không còn lỗi EADDRINUSE)
```

## ✅ Xác Nhận Từ Logs Trước

Từ logs bạn gửi, tôi thấy:
- ✅ `modelName: 'gemini-1.5-flash'` - **ĐÚNG!**
- ✅ API key đã được load
- ✅ Model đã được khởi tạo thành công

**Code đã đúng!** Chỉ cần fix lỗi port để server chạy được.

## 🧪 Test Ngay

Sau khi backend chạy thành công (không còn lỗi EADDRINUSE):

1. **Mở Test Lab:** `http://localhost:5173/test-lab`
2. **Click "⚡ Fill Test Data"**
3. **Click "🤖 Analyze Market"** hoặc **"✨ Generate Description"**
4. **Xem Terminal Backend** để xem logs

## 📋 Kết Quả Mong Đợi

Với model `gemini-1.5-flash`:
- ✅ Không còn lỗi 404
- ✅ Gemini API được gọi thành công
- ✅ Response được parse và hiển thị đúng

## ⚠️ Nếu Vẫn Lỗi Port

Nếu vẫn gặp lỗi EADDRINUSE:

1. **Tìm process đang dùng port 3001:**
   ```bash
   netstat -ano | findstr :3001
   ```

2. **Kill process đó (thay [PID] bằng số PID tìm được):**
   ```bash
   taskkill /F /PID [PID]
   ```

3. **Khởi động lại:**
   ```bash
   npm start
   ```

## 💡 Tips

- **Kiểm tra port trước khi start:** `netstat -ano | findstr :3001`
- **Nếu có process, kill nó trước:** `taskkill /F /PID [PID]`
- **Đợi 2 giây** sau khi kill trước khi start lại

