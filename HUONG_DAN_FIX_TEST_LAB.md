# Hướng Dẫn Fix Trang Test Lab Không Mở Được

## Vấn đề: Trang `/test-lab` hiển thị trắng hoặc không load

## Các bước kiểm tra và fix:

### Bước 1: Kiểm tra Console Errors
1. Mở DevTools (F12)
2. Vào tab **Console**
3. Xem có lỗi JavaScript nào không
4. Chụp màn hình lỗi nếu có

### Bước 2: Kiểm tra Network Tab
1. Mở DevTools (F12)
2. Vào tab **Network**
3. Refresh trang (F5)
4. Xem có request nào bị lỗi (màu đỏ) không
5. Kiểm tra request `/test-lab` có được gửi không

### Bước 3: Kiểm tra File Tồn Tại
```bash
# Kiểm tra file có tồn tại
ls FE/src/pages/TestLab.jsx

# Hoặc trong PowerShell
Test-Path FE\src\pages\TestLab.jsx
```

### Bước 4: Kiểm tra Import trong App.jsx
Mở `FE/src/App.jsx` và kiểm tra:
```javascript
// Phải có dòng này
import TestLab from "./pages/TestLab.jsx";

// Và route này
<Route path="/test-lab" element={<TestLab />} />
```

### Bước 5: Restart Frontend Server
```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại
cd FE
npm run dev
```

### Bước 6: Clear Browser Cache
1. Hard Refresh: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
2. Hoặc mở Incognito/Private window

### Bước 7: Kiểm tra Port
Đảm bảo bạn đang truy cập đúng port:
- Frontend thường là: `http://localhost:5173/test-lab`
- Kiểm tra terminal để xem port thực tế

## Lỗi thường gặp:

### Lỗi 1: "Cannot find module './pages/TestLab.jsx'"
**Giải pháp:**
- Kiểm tra file có tồn tại không
- Kiểm tra đường dẫn import có đúng không
- Restart dev server

### Lỗi 2: "Loader2 is not exported from 'lucide-react'"
**Giải pháp:**
- Kiểm tra version lucide-react: `npm list lucide-react`
- Có thể cần update: `npm install lucide-react@latest`
- Hoặc thay `Loader2` bằng icon khác

### Lỗi 3: "aiService is not defined"
**Giải pháp:**
- Kiểm tra file `FE/src/services/aiService.js` có tồn tại không
- Kiểm tra export default trong aiService.js

### Lỗi 4: Trang trắng hoàn toàn
**Giải pháp:**
- Mở Console (F12) xem có lỗi gì
- Kiểm tra React DevTools extension
- Thử tạo component đơn giản trước để test

## Test Component Đơn Giản

Nếu vẫn không hoạt động, thử tạo component đơn giản trước:

```javascript
// FE/src/pages/TestLab.jsx
export default function TestLab() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Lab - Working!</h1>
      <p>Nếu bạn thấy dòng này, component đã load thành công.</p>
    </div>
  );
}
```

Nếu component đơn giản này hoạt động, thì vấn đề nằm ở code phức tạp hơn.

## Kiểm tra Dependencies

```bash
cd FE
npm install
```

Đảm bảo các package sau đã được cài:
- react
- react-dom
- react-router-dom
- lucide-react
- axios (cho api service)

## Nếu vẫn không được

1. **Chụp màn hình Console errors** và gửi cho tôi
2. **Chụp màn hình Network tab** (các request bị lỗi)
3. **Copy toàn bộ error message** từ console

Tôi sẽ giúp bạn fix tiếp!

