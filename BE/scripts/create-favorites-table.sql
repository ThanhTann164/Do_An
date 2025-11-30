-- Create favorites table for property favorites functionality
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES houses(HouseID) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate favorites
    UNIQUE KEY unique_user_property (user_id, property_id),
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_property_id (property_id),
    INDEX idx_created_at (created_at)
);

-- Insert some sample data (optional)
-- INSERT INTO favorites (user_id, property_id) VALUES 
-- (1, 1),
-- (1, 2),
-- (2, 1);

SELECT 'Favorites table created successfully!' as message;




