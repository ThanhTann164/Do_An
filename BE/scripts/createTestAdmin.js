const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const { users } = initModels(sequelize);
const bcrypt = require('bcrypt');

async function createTestAdmin() {
  try {
    // Check if admin@test.com already exists
    const existingAdmin = await users.findOne({
      where: { Email: 'admin@test.com' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin account admin@test.com already exists');
      console.log('🔑 Password: admin123');
      process.exit(0);
    }
    
    // Create new admin account
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const newAdmin = await users.create({
      FullName: 'Test Admin',
      Email: 'admin@test.com',
      PasswordHash: hashedPassword,
      Role: 'Admin',
      Status: 'Active',
      PhoneNumber: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`
    });
    
    console.log('✅ Test admin account created successfully:');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('👤 UserID:', newAdmin.UserID);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestAdmin();
