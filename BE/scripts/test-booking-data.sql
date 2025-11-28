-- Test data for booking system
-- This script creates sample users and houses for testing the booking functionality

-- Note: Run this AFTER the update-houseviewings-table.sql migration

-- Create test users if they don't exist
-- Password for all test users: Test@123 (hashed with bcrypt)

-- Test Buyer 1
INSERT IGNORE INTO users (UserID, FullName, Email, PhoneNumber, PasswordHash, Role, Status)
VALUES (100, 'Nguyễn Văn Buyer', 'buyer1@test.com', '0901234567', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr9OlWwhW', 
        'Buyer', 'Active');

-- Test Buyer 2
INSERT IGNORE INTO users (UserID, FullName, Email, PhoneNumber, PasswordHash, Role, Status)
VALUES (101, 'Trần Thị Buyer', 'buyer2@test.com', '0901234568', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr9OlWwhW', 
        'Buyer', 'Active');

-- Test Seller 1
INSERT IGNORE INTO users (UserID, FullName, Email, PhoneNumber, PasswordHash, Role, Status)
VALUES (200, 'Lê Văn Seller', 'seller1@test.com', '0902345678', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr9OlWwhW', 
        'Seller', 'Active');

-- Test Seller 2
INSERT IGNORE INTO users (UserID, FullName, Email, PhoneNumber, PasswordHash, Role, Status)
VALUES (201, 'Phạm Thị Seller', 'seller2@test.com', '0902345679', 
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIr9OlWwhW', 
        'Seller', 'Active');

-- Create test houses
INSERT IGNORE INTO houses (HouseID, OwnerID, Title, Description, Address, HouseType, Price, Status)
VALUES 
(1000, 200, 'Căn hộ cao cấp Quận 1', 'Căn hộ 2 phòng ngủ, view đẹp', '123 Nguyễn Huệ, Q1, TP.HCM', 'Apartment', 5000000000, 'Available'),
(1001, 200, 'Nhà phố Quận 2', 'Nhà phố 3 tầng, sân vườn rộng', '456 Thảo Điền, Q2, TP.HCM', 'Townhouse', 8000000000, 'Available'),
(1002, 201, 'Biệt thự Quận 7', 'Biệt thự sang trọng, hồ bơi riêng', '789 Phú Mỹ Hưng, Q7, TP.HCM', 'Villa', 15000000000, 'Available'),
(1003, 201, 'Đất nền Bình Dương', 'Đất nền 100m2, vị trí đẹp', 'Thuận An, Bình Dương', 'Land', 2000000000, 'Available');

-- Create some sample bookings
INSERT IGNORE INTO houseviewings (ViewingID, HouseID, BuyerID, SellerID, ViewingDate, Status)
VALUES 
-- Buyer 1 books with Seller 1
(5000, 1000, 100, 200, '2025-01-15 09:00:00', 'PENDING'),
(5001, 1001, 100, 200, '2025-01-16 14:00:00', 'CONFIRMED'),

-- Buyer 2 books with Seller 1
(5002, 1000, 101, 200, '2025-01-15 11:00:00', 'PENDING'),

-- Buyer 1 books with Seller 2
(5003, 1002, 100, 201, '2025-01-17 10:00:00', 'PENDING'),

-- Buyer 2 books with Seller 2
(5004, 1003, 101, 201, '2025-01-18 15:00:00', 'CONFIRMED');

-- Display test data summary
SELECT '=== TEST USERS ===' as '';
SELECT UserID, FullName, Email, Role FROM users WHERE UserID >= 100 AND UserID < 300;

SELECT '=== TEST HOUSES ===' as '';
SELECT HouseID, Title, Price, OwnerID FROM houses WHERE HouseID >= 1000;

SELECT '=== TEST BOOKINGS ===' as '';
SELECT 
    hv.ViewingID,
    h.Title as House,
    b.FullName as Buyer,
    s.FullName as Seller,
    hv.ViewingDate,
    hv.Status
FROM houseviewings hv
INNER JOIN houses h ON hv.HouseID = h.HouseID
INNER JOIN users b ON hv.BuyerID = b.UserID
INNER JOIN users s ON hv.SellerID = s.UserID
WHERE hv.ViewingID >= 5000
ORDER BY hv.ViewingDate;

-- Test credentials:
-- Email: buyer1@test.com, Password: Test@123
-- Email: buyer2@test.com, Password: Test@123
-- Email: seller1@test.com, Password: Test@123
-- Email: seller2@test.com, Password: Test@123
