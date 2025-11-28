const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const { users } = initModels(sequelize);

async function checkAdmin() {
  try {
    const admin = await users.findOne({
      where: { Email: 'admin@test.com' },
      attributes: ['UserID', 'FullName', 'Email', 'Role', 'Status']
    });
    
    if (admin) {
      console.log('✅ Admin account found:', admin.dataValues);
    } else {
      console.log('❌ Admin account not found');
      
      // Check all admin accounts
      const admins = await users.findAll({
        where: { Role: 'Admin' },
        attributes: ['UserID', 'FullName', 'Email', 'Role', 'Status']
      });
      
      console.log('📋 All admin accounts:', admins.map(a => a.dataValues));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmin();

