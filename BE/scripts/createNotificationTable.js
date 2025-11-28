const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function createNotificationTable() {
  try {
    console.log('🔧 Tạo bảng notifications...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        toUserId BIGINT UNSIGNED NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isRead BOOLEAN DEFAULT FALSE,
        INDEX idx_toUserId (toUserId),
        INDEX idx_createdAt (createdAt),
        INDEX idx_isRead (isRead),
        FOREIGN KEY (toUserId) REFERENCES users(UserID) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Bảng notifications đã được tạo thành công!');
    
    // Kiểm tra lại bảng
    const [schema] = await sequelize.query('DESCRIBE notifications');
    console.log('📋 Schema của bảng notifications:');
    schema.forEach(column => {
      console.log(`  - ${column.Field} (${column.Type}) ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? column.Key : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createNotificationTable();
