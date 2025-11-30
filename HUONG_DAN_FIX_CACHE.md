# Hướng Dẫn Fix Cache và Test AI Features

## Vấn đề: Browser đang cache code cũ

Nếu bạn thấy:
- Modal "AI Title Optimization - Coming Soon!"
- Package hiển thị sai (FREE thay vì PREMIUM)
- Nút AI không hoạt động

## Giải pháp: Clear Browser Cache

### Cách 1: Hard Refresh (Khuyên dùng)
1. **Chrome/Edge**: 
   - Windows: `Ctrl + Shift + R` hoặc `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Firefox**:
   - Windows: `Ctrl + Shift + R` hoặc `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

### Cách 2: Clear Cache trong DevTools
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"

### Cách 3: Clear Cache hoàn toàn
1. Mở DevTools (F12)
2. Vào tab **Application** (hoặc **Storage**)
3. Click **Clear storage** hoặc **Clear site data**
4. Check tất cả các options
5. Click **Clear site data**

### Cách 4: Incognito/Private Mode
1. Mở cửa sổ Incognito/Private mới
2. Truy cập `http://localhost:5173`
3. Đăng nhập và test

## Kiểm tra Code đã được cập nhật

### Backend:
1. Mở `BE/controllers/ai.controller.js`
2. Kiểm tra có các hàm:
   - `optimizeTitle()` - ✅ Có
   - `optimizeDescription()` - ✅ Có
   - `generateDescription()` - ✅ Có
   - `analyzeMarket()` - ✅ Có

### Frontend:
1. Mở `FE/src/pages/Seller/CreatePost.jsx`
2. Tìm nút "AI Tối ưu tiêu đề"
3. Kiểm tra không còn `alert('Coming Soon')`
4. Kiểm tra có gọi `aiService.optimizeTitle()`

## Test AI Features

### 1. Test Optimize Title
1. Đăng nhập với tài khoản Premium
2. Vào `/post/create`
3. Nhập tiêu đề: "Căn hộ 2 phòng ngủ"
4. Click "✨ AI Tối ưu tiêu đề"
5. **Kết quả mong đợi**: Tiêu đề được tối ưu với emoji, không có modal "Coming Soon"

### 2. Test Generate Description
1. Điền đầy đủ: Địa chỉ, Loại nhà, Diện tích
2. Click "✨ AI Viết Mô Tả"
3. **Kết quả mong đợi**: Mô tả được điền vào textarea

### 3. Test Optimize Description
1. Nhập mô tả thủ công
2. Click "✨ Tối ưu mô tả"
3. **Kết quả mong đợi**: Mô tả được tối ưu

### 4. Test Market Analysis
1. Điền: Giá, Vị trí, Diện tích
2. Click "Phân tích thị trường"
3. **Kết quả mong đợi**: Hiển thị đánh giá giá, ưu điểm, nhược điểm

## Kiểm tra Package Status

### Console (F12):
```javascript
// Kiểm tra user package
console.log('User:', window.user);
console.log('Current Package:', window.user?.currentPackage);
```

### Network Tab:
1. Mở DevTools → Network
2. Tìm request `/api/user`
3. Kiểm tra response có `currentPackage.name: "PREMIUM"`

## Nếu vẫn không hoạt động

1. **Restart Frontend Server**:
   ```bash
   cd FE
   npm run dev
   ```

2. **Restart Backend Server**:
   ```bash
   npm start
   ```

3. **Kiểm tra API Key**:
   - Mở `config.env`
   - Đảm bảo có `GEMINI_API_KEY=...`

4. **Kiểm tra Console Errors**:
   - Mở DevTools (F12)
   - Xem tab Console có lỗi gì không

5. **Test API trực tiếp**:
   ```bash
   curl -X POST http://localhost:3001/api/ai/optimize-title \
     -H "Content-Type: application/json" \
     -d '{"title":"Căn hộ 2 phòng ngủ","house_type":"Căn hộ"}'
   ```

## Lưu ý

- **PackageDebug component đã bị xóa** - không còn hiển thị debug box
- **Tất cả mock data đã được thay thế** bằng Google Gemini API thật
- **Không còn "Coming Soon"** - tất cả đều hoạt động với API thật

