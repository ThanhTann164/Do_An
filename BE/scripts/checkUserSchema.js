const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function checkUserSchema() {
  try {
    console.log('🔍 Checking users table schema...');
    
    const [results] = await sequelize.query('DESCRIBE users');
    console.log('Users table schema:');
    results.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserSchema();