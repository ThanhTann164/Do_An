const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function checkNotificationTable() {
  try {
    const [results] = await sequelize.query('SHOW TABLES LIKE \'notifications\'');
    if (results.length > 0) {
      console.log('✅ Bảng notifications đã tồn tại');
      const [schema] = await sequelize.query('DESCRIBE notifications');
      console.log('📋 Schema của bảng notifications:');
      schema.forEach(column => {
        console.log(`  - ${column.Field} (${column.Type}) ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${column.Key ? column.Key : ''}`);
      });
    } else {
      console.log('❌ Bảng notifications chưa tồn tại');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkNotificationTable();
