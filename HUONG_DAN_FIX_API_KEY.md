# 🔧 Hướng Dẫn Fix API Key Không Hoạt Động

## ⚠️ Vấn Đề

API key mới: `AIzaSyDmNMq7NXMTUKt4XYtnjCHBtsrEbhFApLA` không hoạt động với bất kỳ model nào.

## ✅ Giải Pháp

### Bước 1: Enable Generative Language API

1. **Vào Google Cloud Console:**
   ```
   https://console.cloud.google.com/
   ```

2. **Chọn Project:**
   - Chọn project mà bạn đã tạo API key

3. **Vào APIs Library:**
   - Click menu **APIs & Services** > **Library**
   - Hoặc truy cập trực tiếp: https://console.cloud.google.com/apis/library

4. **Tìm Generative Language API:**
   - Gõ vào ô tìm kiếm: **"Generative Language API"**
   - Click vào kết quả đầu tiên

5. **Enable API:**
   - Click nút **"Enable"** (màu xanh)
   - Đợi vài giây để API được enable
   - Khi thấy nút chuyển thành **"Manage"**, nghĩa là đã enable thành công

### Bước 2: Kiểm Tra API Key Restrictions

1. **Vào Credentials:**
   - Click menu **APIs & Services** > **Credentials**
   - Hoặc truy cập: https://console.cloud.google.com/apis/credentials

2. **Tìm API Key:**
   - Tìm API key: `AIzaSyDmNMq7NXMTUKt4XYtnjCHBtsrEbhFApLA`
   - Click vào để xem chi tiết

3. **Kiểm Tra API Restrictions:**
   - Trong phần **"API restrictions"**:
     - ✅ **Chọn "Don't restrict key"** (để test nhanh)
     - HOẶC
     - ✅ **Chọn "Restrict key"** và chỉ cho phép **"Generative Language API"**
   - Click **"Save"**

4. **Kiểm Tra Application Restrictions:**
   - Trong phần **"Application restrictions"**:
     - ✅ **Chọn "None"** (để test)
     - HOẶC cấu hình theo nhu cầu của bạn
   - Click **"Save"**

### Bước 3: Đợi Vài Phút

- API key và API enable có thể cần vài phút để propagate
- Đợi **5-10 phút** sau khi enable API

### Bước 4: Test Lại

Sau khi fix xong, chạy lại script test:

```bash
node check-key.js
```

**Kết quả mong đợi:**
```
✅ KẾT QUẢ: Thành công! Key này dùng được Gemini 1.5 Flash.
🤖 Trả lời: ...
```

## 🔄 Nếu Vẫn Không Hoạt Động

### Tạo API Key Mới

1. **Vào Credentials:**
   - https://console.cloud.google.com/apis/credentials

2. **Create New API Key:**
   - Click **"Create Credentials"** > **"API Key"**
   - Copy API key mới ngay lập tức (chỉ hiện 1 lần)

3. **Cấu Hình API Key:**
   - Click vào API key mới để chỉnh sửa
   - **API restrictions**: Chọn "Don't restrict key" (để test)
   - **Application restrictions**: Chọn "None"
   - Click **"Save"**

4. **Cập Nhật Vào Project:**
   - Thay API key mới vào file `config.env`
   - Restart backend

## 📋 Checklist

- [ ] Generative Language API đã được enable
- [ ] API key không bị hạn chế (hoặc chỉ hạn chế cho Generative Language API)
- [ ] Đã đợi 5-10 phút sau khi enable
- [ ] Đã test lại với `node check-key.js`
- [ ] Nếu vẫn lỗi, đã tạo API key mới

## 🎯 Sau Khi Fix Xong

1. **Cập nhật API key vào `config.env`** (nếu dùng key mới)
2. **Restart backend:**
   ```bash
   cd BE
   npm start
   ```
3. **Test lại trên Test Lab:**
   - Mở: `http://localhost:5173/test-lab`
   - Click "🤖 Analyze Market" hoặc "✨ Generate Description"

## 💡 Tips

- **Luôn enable Generative Language API** trước khi dùng API key
- **Để "Don't restrict key"** khi test để tránh lỗi
- **Đợi vài phút** sau khi enable API để hệ thống propagate
- **Không commit API key** vào Git (đã có trong `.gitignore`)

