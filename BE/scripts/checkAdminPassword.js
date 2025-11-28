const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const { users } = initModels(sequelize);
const bcrypt = require('bcrypt');

async function checkAdminPassword() {
  try {
    const admin = await users.findOne({
      where: { Email: 'admin@smarthome.com' },
      attributes: ['UserID', 'FullName', 'Email', 'PasswordHash', 'Role', 'Status']
    });
    
    if (admin) {
      console.log('✅ Admin account found:', {
        UserID: admin.UserID,
        FullName: admin.FullName,
        Email: admin.Email,
        Role: admin.Role,
        Status: admin.Status
      });
      
      // Test common passwords
      const testPasswords = ['admin123', '123456', 'password', 'admin', 'smarthome123'];
      
      for (const password of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(password, admin.PasswordHash);
          if (isMatch) {
            console.log(`🔑 Password found: "${password}"`);
            process.exit(0);
          }
        } catch (error) {
          // Try direct comparison (if password is not hashed)
          if (admin.PasswordHash === password) {
            console.log(`🔑 Password found (unhashed): "${password}"`);
            process.exit(0);
          }
        }
      }
      
      console.log('❌ None of the test passwords match');
      console.log('🔍 Password hash:', admin.PasswordHash);
    } else {
      console.log('❌ Admin account not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminPassword();
