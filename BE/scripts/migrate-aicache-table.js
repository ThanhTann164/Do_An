/**
 * Migration Script: Create AI Cache Table
 * 
 * This script creates the aicache table for storing AI responses.
 * 
 * Run this script once to create the table.
 */

const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function createAICacheTable() {
  try {
    console.log('🔄 [Migration] Creating aicache table...');
    
    // Check if table already exists
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'aicache'
    `);
    
    if (tables.length > 0) {
      console.log('ℹ️ [Migration] aicache table already exists');
      process.exit(0);
    }
    
    // Create table
    await sequelize.query(`
      CREATE TABLE aicache (
        CacheID BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        InputHash VARCHAR(64) NOT NULL UNIQUE COMMENT 'Hash của input (SHA256)',
        CacheKey VARCHAR(255) NOT NULL COMMENT 'Key để cache (human-readable)',
        Result TEXT NOT NULL COMMENT 'Kết quả từ AI (JSON hoặc text)',
        ResultType ENUM('description', 'market_analysis', 'title_optimization', 'description_optimization') 
          NOT NULL DEFAULT 'description' COMMENT 'Loại kết quả AI',
        ExpiresAt DATETIME NOT NULL COMMENT 'Thời gian hết hạn cache (7 ngày)',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_input_hash (InputHash),
        INDEX idx_expires_at (ExpiresAt),
        INDEX idx_result_type (ResultType)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bảng cache kết quả AI'
    `);
    
    console.log('✅ [Migration] Created aicache table successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ [Migration] Error creating aicache table:', error);
    console.error('❌ [Migration] Error stack:', error.stack);
    process.exit(1);
  }
}

// Run migration
createAICacheTable();

