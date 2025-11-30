# Hướng Dẫn Xuất Database Từ MySQL

## Cách 1: Sử dụng Script Tự Động (Khuyên dùng)

### Bước 1: Chạy file batch
Chạy file `export-database.bat` trong thư mục gốc của dự án. Script sẽ tự động:
- Đọc thông tin từ `config.env`
- Tạo file backup với tên có timestamp
- Xuất toàn bộ database ra file `.sql`

```bash
export-database.bat
```

## Cách 2: Sử dụng Command Line (Thủ công)

### Bước 1: Mở Command Prompt hoặc PowerShell

### Bước 2: Chạy lệnh mysqldump

**Cú pháp cơ bản:**
```bash
mysqldump -h [HOST] -P [PORT] -u [USER] -p[PASSWORD] [DATABASE_NAME] > [OUTPUT_FILE].sql
```

**Với thông tin từ config.env của bạn:**
```bash
mysqldump -h localhost -P 3306 -u root -pbuithanhTan@123 smarthome > backup_smarthome.sql
```

**Lưu ý:** Không có khoảng trắng giữa `-p` và mật khẩu!

### Bước 3: Kiểm tra file đã tạo
File `.sql` sẽ được tạo trong thư mục hiện tại.

## Cách 3: Sử dụng MySQL Workbench

### Bước 1: Mở MySQL Workbench
- Kết nối đến database server

### Bước 2: Chọn Database
- Click vào database `smarthome` trong panel bên trái

### Bước 3: Xuất Database
1. Vào menu **Server** → **Data Export**
2. Chọn database `smarthome`
3. Chọn các bảng cần xuất (hoặc chọn tất cả)
4. Chọn **Export to Self-Contained File**
5. Chọn đường dẫn lưu file
6. Click **Start Export**

## Cách 4: Sử dụng phpMyAdmin (nếu có)

### Bước 1: Truy cập phpMyAdmin
- Mở trình duyệt và vào `http://localhost/phpmyadmin`

### Bước 2: Chọn Database
- Click vào database `smarthome` ở panel bên trái

### Bước 3: Xuất Database
1. Click tab **Export**
2. Chọn phương thức: **Quick** hoặc **Custom**
3. Chọn định dạng: **SQL**
4. Click **Go** để tải file

## Các Tùy Chọn Nâng Cao

### Xuất chỉ cấu trúc (không có dữ liệu)
```bash
mysqldump -h localhost -P 3306 -u root -pbuithanhTan@123 --no-data smarthome > structure_only.sql
```

### Xuất chỉ dữ liệu (không có cấu trúc)
```bash
mysqldump -h localhost -P 3306 -u root -pbuithanhTan@123 --no-create-info smarthome > data_only.sql
```

### Xuất một bảng cụ thể
```bash
mysqldump -h localhost -P 3306 -u root -pbuithanhTan@123 smarthome users > users_table.sql
```

### Xuất nhiều bảng
```bash
mysqldump -h localhost -P 3306 -u root -pbuithanhTan@123 smarthome users houses packages > selected_tables.sql
```

### Xuất với nén (tiết kiệm dung lượng)
```bash
mysqldump -h localhost -P 3306 -u root -pbuithanhTan@123 smarthome | gzip > backup_smarthome.sql.gz
```

## Khôi Phục Database Từ File Backup

### Sử dụng Command Line:
```bash
mysql -h localhost -P 3306 -u root -pbuithanhTan@123 smarthome < backup_smarthome.sql
```

### Sử dụng MySQL Workbench:
1. Vào menu **Server** → **Data Import**
2. Chọn **Import from Self-Contained File**
3. Chọn file `.sql` đã xuất
4. Chọn database đích
5. Click **Start Import**

## Lưu Ý Quan Trọng

1. **Bảo mật mật khẩu:** File batch chứa mật khẩu dạng plain text. Không commit file này lên Git!
2. **Quyền truy cập:** Đảm bảo user MySQL có quyền SELECT trên database
3. **Kích thước file:** Database lớn có thể tạo file backup rất lớn
4. **Thời gian:** Quá trình xuất có thể mất vài phút với database lớn

## Xử Lý Lỗi Thường Gặp

### Lỗi: "mysqldump: command not found"
**Giải pháp:** Thêm đường dẫn MySQL bin vào PATH hoặc dùng đường dẫn đầy đủ:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -h localhost -u root -p smarthome > backup.sql
```

### Lỗi: "Access denied"
**Giải pháp:** Kiểm tra lại username và password trong config.env

### Lỗi: "Unknown database"
**Giải pháp:** Kiểm tra tên database có đúng không

## Tự Động Hóa Backup (Tùy chọn)

Bạn có thể tạo task scheduler trên Windows để tự động backup định kỳ:

1. Mở **Task Scheduler**
2. Tạo task mới
3. Trigger: Hàng ngày/hàng tuần
4. Action: Chạy `export-database.bat`


