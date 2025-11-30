# Hướng Dẫn Xem Logs Backend

## 📍 Xem Logs Ở Đâu?

### Cách 1: Xem Terminal Đang Chạy Backend

1. **Tìm cửa sổ Terminal** đang chạy `npm start`
   - Có thể là cửa sổ có title: "Backend Server - AI Debug"
   - Hoặc cửa sổ bạn vừa chạy lệnh `npm start`

2. **Xem logs trong cửa sổ đó**
   - Logs sẽ hiển thị real-time khi có request
   - Scroll lên để xem logs khi khởi động

### Cách 2: Nếu Không Thấy Terminal

Nếu bạn không thấy terminal đang chạy backend:

1. **Mở Terminal mới**
2. **Chạy lại backend:**
   ```bash
   npm start
   ```
3. **Giữ cửa sổ terminal này mở** để xem logs

## 🔍 Logs Khi Khởi Động

Khi backend khởi động, bạn sẽ thấy logs ở **đầu terminal**, ví dụ:

```
[dotenv] injecting env (27) from config.env
🔑 [AI Controller] GEMINI_API_KEY check: {
  hasKey: true,
  keyLength: 39,
  keyPrefix: 'AIzaSyBJIz...',
  fromEnv: { GEMINI_API_KEY: true, GOOGLE_AI_API_KEY: true }
}
🤖 [AI Controller] Gemini initialization: {
  hasGenAI: true,
  hasModel: true,
  modelName: 'gemini-1.5-pro',
  packageVersion: '0.24.1'
}
Server is running on port 3001
```

## 🧪 Logs Khi Test AI

Khi bạn click nút AI trên Test Lab, logs sẽ hiển thị **ngay trong terminal backend**:

### Analyze Market:
```
📊 [AI] Analyzing market for: { propertyType: 'Căn hộ', location: '...', area: 50, price: 2000000000 }
🔍 [AI] Gemini Input: { propertyType: 'Căn hộ', location: '...', area: 50, price: '2.0 tỷ VND', promptLength: 456 }
📝 [AI] Raw response from Gemini: {"valuation":"Hợp lý","pros":["Vị trí trung tâm","Gần các tiện ích"],"cons":["Giá cao","Giao thông đông"]}
🧹 [AI] Cleaned JSON: {"valuation":"Hợp lý","pros":["Vị trí trung tâm","Gần các tiện ích"],"cons":["Giá cao","Giao thông đông"]}
✅ [AI] JSON parsed successfully
🔍 [AI] Gemini Output: {
  "valuation": "Hợp lý",
  "pros": ["Vị trí trung tâm", "Gần các tiện ích"],
  "cons": ["Giá cao", "Giao thông đông"]
}
✅ [AI] Market analysis completed successfully
```

### Generate Description:
```
🤖 [AI] Generating description for: { propertyType: 'Căn hộ', location: '...', area: 50, price: 2000000000 }
📡 [AI] Calling Gemini API...
📝 [AI] Raw response from Gemini: Căn hộ hiện đại, đầy đủ tiện ích...
✅ [AI] Description generated successfully
```

## ⚠️ Nếu Không Thấy Logs

### Vấn đề: Terminal đã đóng hoặc không thấy

**Giải pháp:**
1. Mở Terminal mới
2. Chạy: `npm start`
3. **Giữ cửa sổ terminal này mở**
4. Test lại trên Test Lab
5. Xem logs trong terminal này

### Vấn đề: Logs không hiển thị

**Giải pháp:**
1. Đảm bảo backend đang chạy (kiểm tra port 3001)
2. Refresh trang Test Lab
3. Click lại nút AI
4. Xem terminal backend

## 📋 Checklist

- [ ] Tìm được terminal đang chạy `npm start`
- [ ] Thấy logs khi khởi động (🔑 và 🤖)
- [ ] Thấy logs khi click nút AI (📊, 🔍, 📝)
- [ ] Terminal không bị đóng

## 🎯 Ví Dụ Cụ Thể

**Bước 1:** Mở Terminal
```
Windows Terminal hoặc Command Prompt
```

**Bước 2:** Chạy Backend
```bash
cd D:\Do_An_Main
npm start
```

**Bước 3:** Xem Logs
```
Terminal sẽ hiển thị:
- Logs khởi động (ở đầu)
- Logs khi có request (real-time)
```

**Bước 4:** Test trên Browser
```
1. Mở: http://localhost:5173/test-lab
2. Click nút AI
3. Quay lại Terminal → Xem logs
```

## 💡 Tips

- **Scroll terminal lên** để xem logs cũ
- **Giữ terminal mở** để xem logs real-time
- **Copy logs** nếu cần gửi cho tôi để debug
- **Tìm kiếm** trong terminal: Ctrl+F để tìm "❌" hoặc "✅"

