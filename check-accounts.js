const getSequelizeInstance = require('./BE/utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function checkTestAccounts() {
  try {
    console.log('🔍 Checking test accounts...');
    
    // Check users
    const [users] = await sequelize.query(`
      SELECT UserID, Email, FullName, Role, Status 
      FROM users 
      WHERE Email IN ('pro_test@example.com', 'premium_test@example.com')
    `);
    
    console.log('👥 Users found:', users);
    
    // Check packages
    const [packages] = await sequelize.query(`
      SELECT id, name, display_name, price, duration_days 
      FROM packages 
      ORDER BY id
    `);
    
    console.log('📦 Packages:', packages);
    
    // Check user_packages
    const [userPackages] = await sequelize.query(`
      SELECT up.*, p.name as package_name, u.Email
      FROM user_packages up
      JOIN packages p ON up.package_id = p.id
      JOIN users u ON up.user_id = u.UserID
      WHERE u.Email IN ('pro_test@example.com', 'premium_test@example.com')
      ORDER BY up.created_at DESC
    `);
    
    console.log('🔗 User packages:', userPackages);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkTestAccounts();

