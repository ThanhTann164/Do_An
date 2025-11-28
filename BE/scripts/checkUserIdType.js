const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function checkUserIdType() {
  try {
    const [schema] = await sequelize.query('DESCRIBE users');
    const userIdColumn = schema.find(col => col.Field === 'UserID');
    console.log('📋 UserID column:', userIdColumn);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserIdType();
