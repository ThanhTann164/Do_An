/**
 * Migration Script: Add Priority Fields to Houses Table
 * 
 * This script adds the following fields to the houses table:
 * - PriorityScore (INT, default: 0)
 * - IsBoosted (BOOLEAN, default: false)
 * - BoostExpiresAt (DATETIME, nullable)
 * - TierLevel (INT, default: 1)
 * 
 * Run this script once to update existing database schema.
 */

const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function migrateHousesTable() {
  try {
    console.log('🔄 [Migration] Starting migration for houses table...');
    
    // Check if columns already exist
    const [existingColumns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'houses' 
      AND COLUMN_NAME IN ('PriorityScore', 'IsBoosted', 'BoostExpiresAt', 'TierLevel')
    `);
    
    const existingColumnNames = existingColumns.map(col => col.COLUMN_NAME);
    console.log('📋 [Migration] Existing columns:', existingColumnNames);
    
    // Add PriorityScore if not exists
    if (!existingColumnNames.includes('PriorityScore')) {
      await sequelize.query(`
        ALTER TABLE houses 
        ADD COLUMN PriorityScore INT NOT NULL DEFAULT 0 
        COMMENT 'Điểm ưu tiên để sort: 1=Free, 2=Pro, 3=Premium'
      `);
      console.log('✅ [Migration] Added PriorityScore column');
    } else {
      console.log('ℹ️ [Migration] PriorityScore column already exists');
    }
    
    // Add IsBoosted if not exists
    if (!existingColumnNames.includes('IsBoosted')) {
      await sequelize.query(`
        ALTER TABLE houses 
        ADD COLUMN IsBoosted BOOLEAN NOT NULL DEFAULT FALSE 
        COMMENT 'Tin đang được boost'
      `);
      console.log('✅ [Migration] Added IsBoosted column');
    } else {
      console.log('ℹ️ [Migration] IsBoosted column already exists');
    }
    
    // Add BoostExpiresAt if not exists
    if (!existingColumnNames.includes('BoostExpiresAt')) {
      await sequelize.query(`
        ALTER TABLE houses 
        ADD COLUMN BoostExpiresAt DATETIME NULL 
        COMMENT 'Thời gian hết hạn boost'
      `);
      console.log('✅ [Migration] Added BoostExpiresAt column');
    } else {
      console.log('ℹ️ [Migration] BoostExpiresAt column already exists');
    }
    
    // Add TierLevel if not exists
    if (!existingColumnNames.includes('TierLevel')) {
      await sequelize.query(`
        ALTER TABLE houses 
        ADD COLUMN TierLevel INT NOT NULL DEFAULT 1 
        COMMENT 'Cấp độ gói: 1=Free, 2=Pro, 3=Premium'
      `);
      console.log('✅ [Migration] Added TierLevel column');
    } else {
      console.log('ℹ️ [Migration] TierLevel column already exists');
    }
    
    // Create indexes for performance
    console.log('🔄 [Migration] Creating indexes...');
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_houses_priority_score ON houses(PriorityScore)
      `);
      console.log('✅ [Migration] Created index on PriorityScore');
    } catch (e) {
      console.log('ℹ️ [Migration] Index on PriorityScore may already exist');
    }
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_houses_is_boosted ON houses(IsBoosted)
      `);
      console.log('✅ [Migration] Created index on IsBoosted');
    } catch (e) {
      console.log('ℹ️ [Migration] Index on IsBoosted may already exist');
    }
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_houses_boost_expires_at ON houses(BoostExpiresAt)
      `);
      console.log('✅ [Migration] Created index on BoostExpiresAt');
    } catch (e) {
      console.log('ℹ️ [Migration] Index on BoostExpiresAt may already exist');
    }
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_houses_tier_level ON houses(TierLevel)
      `);
      console.log('✅ [Migration] Created index on TierLevel');
    } catch (e) {
      console.log('ℹ️ [Migration] Index on TierLevel may already exist');
    }
    
    // Update existing records: Set TierLevel based on owner's package
    console.log('🔄 [Migration] Updating existing records...');
    await sequelize.query(`
      UPDATE houses h
      LEFT JOIN user_packages up ON h.OwnerID = up.user_id AND up.status = 'active' AND up.end_at > NOW()
      LEFT JOIN packages p ON up.package_id = p.id
      SET 
        h.TierLevel = CASE 
          WHEN p.name = 'PREMIUM' THEN 3
          WHEN p.name = 'PRO' THEN 2
          ELSE 1
        END,
        h.PriorityScore = CASE 
          WHEN p.name = 'PREMIUM' THEN 3
          WHEN p.name = 'PRO' THEN 2
          ELSE 1
        END
      WHERE h.TierLevel = 1 OR h.TierLevel IS NULL
    `);
    console.log('✅ [Migration] Updated existing records with tier levels');
    
    console.log('✅ [Migration] Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ [Migration] Error during migration:', error);
    console.error('❌ [Migration] Error stack:', error.stack);
    process.exit(1);
  }
}

// Run migration
migrateHousesTable();

