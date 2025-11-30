# Hướng Dẫn Test Nhanh AI Features

## Trang Test Lab Đã Sẵn Sàng! ✅

Bạn đang ở trang: `http://localhost:5173/test-lab`

## Các Bước Test

### Bước 1: Điền Dữ Liệu Test

**Cách 1: Tự động (Khuyên dùng)**
1. Click nút **"⚡ Fill Test Data"** ở dưới cùng cột Controls
2. Form sẽ tự động điền với dữ liệu mẫu

**Cách 2: Thủ công**
- Loại bất động sản: Chọn "Căn hộ"
- Tỉnh/Thành phố: Nhập "Thành phố Hồ Chí Minh"
- Quận/Huyện: Nhập "Quận 1"
- Diện tích: Nhập "50"
- Giá: Nhập "2000000000"
- Số phòng ngủ: Nhập "2"
- Số phòng tắm: Nhập "1"

### Bước 2: Test Analyze Market (Phân Tích Thị Trường)

1. Đảm bảo gói **PREMIUM** đã được chọn (radio button)
2. Click nút **"🤖 Analyze Market"** (màu xanh)
3. Đợi vài giây (sẽ có loading spinner)
4. Kết quả sẽ hiển thị:
   - **Đánh giá giá**: Rẻ/Đắt/Hợp lý
   - **Ưu điểm**: Danh sách các điểm tốt
   - **Nhược điểm**: Danh sách các điểm cần lưu ý
   - **Raw JSON**: Dữ liệu thô từ API

### Bước 3: Test Generate Description (Tạo Mô Tả)

1. Click nút **"✨ Generate Description"** (màu tím)
2. Đợi vài giây
3. Kết quả sẽ hiển thị:
   - **Mô tả được tạo**: Đoạn văn mô tả bất động sản
   - **Raw JSON**: Dữ liệu thô từ API

## Kiểm Tra Backend

Trước khi test, đảm bảo backend đang chạy:

### Cách 1: Kiểm tra bằng script
```bash
test-ai.bat
```

### Cách 2: Kiểm tra thủ công
1. Mở terminal mới
2. Chạy: `start-backend.bat`
3. Xem logs để đảm bảo:
   - `🔑 [AI Controller] GEMINI_API_KEY check: { hasKey: true, ... }`
   - `🤖 [AI Controller] Gemini initialization: { hasGenAI: true, ... }`
   - `Server is running on port 3001`

## Nếu Gặp Lỗi

### Lỗi: "Lỗi khi phân tích thị trường" hoặc "Lỗi khi tạo mô tả"

**Kiểm tra:**
1. Backend có đang chạy không? (port 3001)
2. Mở browser console (F12) → Tab Network
3. Xem request có đến backend không
4. Xem response status code:
   - **200**: OK
   - **500**: Server error → Xem logs backend
   - **404**: Route không tồn tại → Kiểm tra routes

### Lỗi: Nút bị mờ (disabled)

**Nguyên nhân:**
- Gói đang chọn là FREE hoặc PRO
- Form chưa điền đầy đủ (thiếu các trường bắt buộc *)

**Fix:**
- Chọn gói **PREMIUM**
- Điền đầy đủ các trường có dấu * (Loại, Tỉnh/Thành phố, Diện tích)

### Lỗi: "No response from server"

**Fix:**
1. Restart backend: `start-backend.bat`
2. Đợi 5 giây để server khởi động
3. Refresh trang Test Lab
4. Test lại

## Test Nhiều Scenarios

Click **"⚡ Fill Test Data"** nhiều lần để test với các scenarios khác nhau:
- Căn hộ giá rẻ Quận 1
- Biệt thự cao cấp Quận 2
- Nhà phố trung tâm Hà Nội
- Studio view biển Đà Nẵng
- Penthouse cao cấp

## Kết Quả Mong Đợi

### Analyze Market:
```json
{
  "valuation": "Hợp lý" hoặc "Rẻ" hoặc "Đắt",
  "pros": ["Ưu điểm 1", "Ưu điểm 2", ...],
  "cons": ["Nhược điểm 1", "Nhược điểm 2", ...]
}
```

### Generate Description:
```json
{
  "description": "Đoạn mô tả chuyên nghiệp về bất động sản..."
}
```

## Tips

1. **Xem Raw JSON**: Scroll xuống để xem dữ liệu thô từ API
2. **Test với giá khác nhau**: Thử giá rất cao hoặc rất thấp để xem AI phản ứng
3. **Test với vị trí khác nhau**: Thử các quận khác nhau để xem phân tích khác biệt
4. **Xem Console**: Mở F12 → Console để xem logs chi tiết

## Checklist

- [ ] Backend đang chạy (port 3001)
- [ ] Trang Test Lab load được
- [ ] Gói PREMIUM được chọn
- [ ] Form đã điền dữ liệu (hoặc click Fill Test Data)
- [ ] Click "Analyze Market" → Có kết quả
- [ ] Click "Generate Description" → Có kết quả
- [ ] Không có lỗi trong console (F12)

## Nếu Mọi Thứ Hoạt Động Tốt

🎉 **Chúc mừng!** AI features đã hoạt động đúng. Bạn có thể:
1. Test trên trang **Create Post** (cần đăng nhập Premium)
2. Tích hợp vào các tính năng khác
3. Tùy chỉnh prompts trong `BE/controllers/ai.controller.js`

