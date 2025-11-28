const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function updateNotificationTable() {
  try {
    console.log('🔧 Cập nhật bảng notifications...');
    
    // Kiểm tra và thêm các cột mới
    const checkAndAddColumn = async (columnName, columnDef) => {
      try {
        const [columns] = await sequelize.query(`SHOW COLUMNS FROM notifications LIKE '${columnName}'`);
        if (columns.length === 0) {
          await sequelize.query(`ALTER TABLE notifications ADD COLUMN ${columnName} ${columnDef}`);
          console.log(`✅ Added column: ${columnName}`);
        } else {
          console.log(`ℹ️ Column ${columnName} already exists`);
        }
      } catch (error) {
        console.error(`❌ Error adding column ${columnName}:`, error.message);
      }
    };

    // Thêm các cột mới
    await checkAndAddColumn('type', "ENUM('system', 'promotion', 'maintenance', 'custom') DEFAULT 'system'");
    await checkAndAddColumn('receiverId', 'BIGINT UNSIGNED NULL');
    await checkAndAddColumn('updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Thêm indexes
    const addIndexIfNotExists = async (indexName, indexDef) => {
      try {
        await sequelize.query(`ALTER TABLE notifications ADD INDEX ${indexName} ${indexDef}`);
        console.log(`✅ Added index: ${indexName}`);
      } catch (error) {
        if (error.message.includes('Duplicate key name')) {
          console.log(`ℹ️ Index ${indexName} already exists`);
        } else {
          console.error(`❌ Error adding index ${indexName}:`, error.message);
        }
      }
    };

    await addIndexIfNotExists('idx_type', '(type)');
    await addIndexIfNotExists('idx_receiverId', '(receiverId)');
    
    // Migrate dữ liệu cũ nếu có (chỉ khi cột receiverId đã tồn tại)
    try {
      const [receiverIdExists] = await sequelize.query(`SHOW COLUMNS FROM notifications LIKE 'receiverId'`);
      if (receiverIdExists.length > 0) {
        await sequelize.query(`
          UPDATE notifications 
          SET receiverId = toUserId 
          WHERE receiverId IS NULL AND toUserId IS NOT NULL
        `);
        console.log('✅ Migrated existing data');
      }
    } catch (error) {
      console.log('ℹ️ Data migration skipped:', error.message);
    }
    
    console.log('✅ Bảng notifications đã được cập nhật thành công!');
    
    // Kiểm tra lại bảng
    const [schema] = await sequelize.query('DESCRIBE notifications');
    console.log('📋 Schema mới của bảng notifications:');
    schema.forEach(column => {
      console.log(`  - ${column.Field} (${column.Type}) ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? column.Key : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateNotificationTable();
