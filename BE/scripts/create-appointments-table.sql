-- Tạo bảng appointments cho chức năng Book an Appointment

CREATE TABLE IF NOT EXISTS appointments (
  AppointmentID INT PRIMARY KEY AUTO_INCREMENT,
  BuyerID INT NOT NULL,
  SellerID INT,
  BuyerDates JSON COMMENT 'Danh sách ngày buyer chọn',
  SellerDates JSON COMMENT 'Danh sách ngày seller chọn',
  Status ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') DEFAULT 'Pending' NOT NULL,
  Notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (BuyerID) REFERENCES users(UserID) ON DELETE CASCADE,
  FOREIGN KEY (SellerID) REFERENCES users(UserID) ON DELETE SET NULL,
  
  INDEX idx_buyer (BuyerID),
  INDEX idx_seller (SellerID),
  INDEX idx_status (Status),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu (optional)
-- INSERT INTO appointments (BuyerID, SellerID, BuyerDates, SellerDates, Status) 
-- VALUES 
-- (1, 2, '["2025-01-15", "2025-01-16"]', '["2025-01-15"]', 'Pending');

