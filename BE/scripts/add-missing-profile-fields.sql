-- Add missing profile fields to users table
ALTER TABLE users 
ADD COLUMN Gender ENUM('Nam', 'Nữ', 'Khác') NULL COMMENT 'Giới tính của người dùng',
ADD COLUMN Address TEXT NULL COMMENT 'Địa chỉ của người dùng',
ADD COLUMN Timezone VARCHAR(50) DEFAULT 'GMT+7 (ICT)' COMMENT 'Múi giờ',
ADD COLUMN Website VARCHAR(255) NULL COMMENT 'Website cá nhân',
ADD COLUMN Bio TEXT NULL COMMENT 'Ghi chú cá nhân';




