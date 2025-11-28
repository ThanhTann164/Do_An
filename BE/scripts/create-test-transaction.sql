-- Script tạo transaction test cho Buyer
-- Để test tính năng "My Home"

-- 1. Lấy Buyer ID đầu tiên
SET @buyer_id = (SELECT UserID FROM users WHERE Role = 'Buyer' ORDER BY UserID LIMIT 1);

-- 2. Lấy House ID đầu tiên
SET @house_id = (SELECT HouseID FROM houses WHERE Status = 'Available' ORDER BY HouseID LIMIT 1);

-- 3. Kiểm tra có dữ liệu không
SELECT 
  CONCAT('✅ Buyer ID: ', IFNULL(@buyer_id, '❌ KHÔNG CÓ')) as buyer_info,
  CONCAT('✅ House ID: ', IFNULL(@house_id, '❌ KHÔNG CÓ')) as house_info;

-- 4. Tạo transaction nếu có dữ liệu
INSERT INTO transactions (BuyerID, HouseID, Amount, Status, createdAt, updatedAt)
SELECT 
  @buyer_id,
  @house_id,
  (SELECT Price FROM houses WHERE HouseID = @house_id),
  'Completed',
  NOW(),
  NOW()
WHERE @buyer_id IS NOT NULL AND @house_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transactions 
    WHERE BuyerID = @buyer_id AND HouseID = @house_id
  );

-- 5. Hiển thị kết quả
SELECT 
  '✅ Transaction đã tạo:' as message;
  
SELECT 
  t.TransactionID,
  t.Status,
  t.Amount,
  h.Title as 'Tên nhà',
  h.Address as 'Địa chỉ',
  u.Email as 'Buyer Email',
  u.FullName as 'Buyer Name'
FROM transactions t
JOIN houses h ON t.HouseID = h.HouseID
JOIN users u ON t.BuyerID = u.UserID
WHERE t.BuyerID = @buyer_id
ORDER BY t.createdAt DESC
LIMIT 5;

-- 6. Hướng dẫn test
SELECT 
  '📝 Cách test:' as Step1,
  'Đăng nhập bằng email Buyer ở trên' as Step2,
  'Vào /myhome sẽ thấy nhà đã mua' as Step3;

