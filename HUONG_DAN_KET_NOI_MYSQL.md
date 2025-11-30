# Hướng dẫn kết nối MySQL Workbench

## Bước 1: Tạo Connection mới

1. Trong MySQL Workbench, tìm phần **"MySQL Connections"** ở màn hình chính
2. Click vào dấu **`+`** (hoặc click chuột phải → "New Connection")
3. Hoặc vào menu: **Database → Manage Connections**

## Bước 2: Điền thông tin kết nối

Trong cửa sổ "Setup New Connection", điền:

- **Connection Name**: `Do_An_Main` (tên tùy chọn)
- **Hostname**: `localhost`
- **Port**: `3306`
- **Username**: `root`
- **Password**: Click "Store in Keychain" và nhập: `buithanhTan@123`
- **Default Schema**: `smarthome` (hoặc để trống, chọn sau)

## Bước 3: Test Connection

1. Click nút **"Test Connection"** để kiểm tra
2. Nếu thành công, sẽ hiện thông báo "Successfully made the MySQL connection"
3. Click **"OK"** để lưu

## Bước 4: Kết nối

1. Double-click vào connection **"Do_An_Main"** vừa tạo
2. Hoặc click chuột phải → **"Open Connection"**
3. Nhập password nếu được yêu cầu: `buithanhTan@123`

## Bước 5: Chọn Database

1. Sau khi kết nối, ở panel bên trái (Navigator), chuyển sang tab **"Schemas"**
2. Tìm và click vào database **`smarthome`**
3. Database sẽ được highlight (in đậm)

## Bước 6: Xem Tables

1. Click vào mũi tên bên cạnh `smarthome` để mở rộng
2. Bạn sẽ thấy tất cả các tables:
   - users (337 records)
   - houses (100 records)
   - packages (3 records)
   - user_packages
   - paymenttransaction
   - và nhiều tables khác...

## Bước 7: Chạy Query

1. Click vào tab **"Query 1"** ở giữa màn hình
2. Gõ SQL query, ví dụ:
   ```sql
   USE smarthome;
   SELECT * FROM users LIMIT 10;
   ```
3. Click nút **⚡ Execute** (hoặc nhấn `Ctrl + Enter`)
4. Kết quả sẽ hiện ở panel phía dưới

## Các Query hữu ích để bắt đầu:

```sql
-- Xem tất cả tables
SHOW TABLES;

-- Xem cấu trúc table users
DESCRIBE users;

-- Xem dữ liệu users
SELECT * FROM users LIMIT 10;

-- Xem các packages
SELECT * FROM packages;

-- Xem user packages
SELECT * FROM user_packages LIMIT 10;

-- Xem payment transactions
SELECT * FROM paymenttransaction LIMIT 10;
```

## Lưu ý:

- Nếu không thấy "MySQL Connections" ở màn hình chính, vào menu **View → Panels → Show MySQL Connections**
- Nếu gặp lỗi kết nối, kiểm tra:
  - MySQL service đã chạy chưa
  - Port 3306 có bị chặn không
  - Username và password đúng chưa



