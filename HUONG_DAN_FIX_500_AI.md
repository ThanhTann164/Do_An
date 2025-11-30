# Hướng Dẫn Fix Lỗi 500 Khi Gọi AI API

## Vấn Đề

Khi test AI features trên trang `/test-lab`, gặp lỗi **500 Internal Server Error** khi gọi:
- `/api/ai/generate-description`
- `/api/ai/analyze-market`

## Nguyên Nhân Có Thể

1. **Backend chưa restart** sau khi thêm API key
2. **API key không được load** từ `config.env`
3. **Google Gemini API key không hợp lệ** hoặc hết quota
4. **Backend server không chạy**

## Cách Fix

### Bước 1: Kiểm Tra Backend Có Chạy Không

Mở terminal và chạy:
```bash
cd BE
npm start
```

Hoặc dùng script:
```bash
start-backend.bat
```

### Bước 2: Kiểm Tra API Key Đã Được Load

Trong console của backend, bạn sẽ thấy log:
```
🔑 [AI Controller] GEMINI_API_KEY check: { hasKey: true, ... }
```

Nếu `hasKey: false`, nghĩa là API key chưa được load.

### Bước 3: Kiểm Tra File config.env

Mở file `config.env` ở thư mục gốc, đảm bảo có:
```env
GEMINI_API_KEY=AIzaSyBJIz8NYiodrK2UGnSyyp5YfeeqEaPKwFw
GOOGLE_AI_API_KEY=AIzaSyBJIz8NYiodrK2UGnSyyp5YfeeqEaPKwFw
```

### Bước 4: Restart Backend

**QUAN TRỌNG**: Sau khi thêm/sửa API key trong `config.env`, **PHẢI restart backend**:

1. Dừng backend (Ctrl+C trong terminal đang chạy backend)
2. Chạy lại:
   ```bash
   cd BE
   npm start
   ```

Hoặc dùng script:
```bash
start-backend.bat
```

### Bước 5: Kiểm Tra Logs Backend

Khi gọi AI API, xem logs trong terminal backend:

**Nếu thành công:**
```
🤖 [AI] Generating description for: { propertyType: 'Căn hộ', ... }
✅ [AI] Description generated successfully
```

**Nếu lỗi:**
```
❌ [AI] Error generating description: [chi tiết lỗi]
```

### Bước 6: Kiểm Tra API Key Có Hợp Lệ Không

Nếu vẫn lỗi 500, có thể API key không hợp lệ hoặc hết quota. Kiểm tra:

1. Vào [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Kiểm tra API key còn hoạt động không
3. Kiểm tra quota/usage

## Debug Chi Tiết

### Test API Key Trực Tiếp

Tạo file test: `BE/test-gemini.js`

```javascript
require('dotenv').config({ path: '../config.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
console.log('API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'NOT FOUND');

if (!apiKey) {
  console.error('❌ API Key not found!');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function test() {
  try {
    const result = await model.generateContent('Xin chào');
    const response = await result.response;
    console.log('✅ Success:', response.text());
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Chạy:
```bash
cd BE
node test-gemini.js
```

## Checklist

- [ ] Backend đang chạy (`npm start` trong BE/)
- [ ] File `config.env` có `GEMINI_API_KEY`
- [ ] Backend đã restart sau khi thêm API key
- [ ] Logs backend hiển thị `hasKey: true`
- [ ] API key còn hợp lệ (chưa hết quota)
- [ ] Test trực tiếp với `test-gemini.js` thành công

## Nếu Vẫn Lỗi

1. **Kiểm tra Network tab** trong browser console:
   - Xem request có đến backend không
   - Xem response error message chi tiết

2. **Kiểm tra CORS**:
   - Backend có cho phép frontend gọi API không
   - Xem `BE/app.js` có cấu hình CORS đúng không

3. **Kiểm tra Route**:
   - Xem `BE/Routes/aiRoutes.js` có đúng route không
   - Xem `BE/app.js` có mount route không

4. **Liên hệ hỗ trợ**:
   - Gửi logs backend đầy đủ
   - Gửi screenshot lỗi từ browser console

