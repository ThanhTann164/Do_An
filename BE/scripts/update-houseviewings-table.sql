-- Update houseviewings table to support booking appointments
-- This script adds BuyerID and SellerID columns if they don't exist

-- Check if we need to migrate from UserID to BuyerID
-- First, add BuyerID and SellerID columns if they don't exist
ALTER TABLE houseviewings 
ADD COLUMN IF NOT EXISTS BuyerID BIGINT UNSIGNED NOT NULL COMMENT 'Người đặt lịch xem (Buyer)' AFTER HouseID,
ADD COLUMN IF NOT EXISTS SellerID BIGINT UNSIGNED NOT NULL COMMENT 'Người bán (Seller/Owner)' AFTER BuyerID;

-- Add foreign key constraints if they don't exist
ALTER TABLE houseviewings 
ADD CONSTRAINT fk_houseviewings_buyer 
FOREIGN KEY (BuyerID) REFERENCES users(UserID) ON DELETE CASCADE;

ALTER TABLE houseviewings 
ADD CONSTRAINT fk_houseviewings_seller 
FOREIGN KEY (SellerID) REFERENCES users(UserID) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_viewings_buyer ON houseviewings(BuyerID);
CREATE INDEX IF NOT EXISTS idx_viewings_seller ON houseviewings(SellerID);

-- If you have existing data with UserID column, you can migrate it:
-- UPDATE houseviewings SET BuyerID = UserID WHERE BuyerID IS NULL OR BuyerID = 0;
-- Then you can drop the old UserID column:
-- ALTER TABLE houseviewings DROP COLUMN UserID;

-- Update Status enum to use uppercase if needed
ALTER TABLE houseviewings 
MODIFY COLUMN Status ENUM('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING' COMMENT 'Trạng thái';
