const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...');

    // Check packages table structure
    console.log('\n📦 Packages table structure:');
    const [packagesColumns] = await sequelize.query(`DESCRIBE packages`);
    packagesColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check userpackages table structure
    console.log('\n👥 UserPackages table structure:');
    const [userpackagesColumns] = await sequelize.query(`DESCRIBE userpackages`);
    userpackagesColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check users table structure
    console.log('\n👤 Users table structure:');
    const [usersColumns] = await sequelize.query(`DESCRIBE users`);
    usersColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check existing packages
    console.log('\n📋 Existing packages:');
    const [existingPackages] = await sequelize.query(`SELECT * FROM packages LIMIT 5`);
    if (existingPackages.length > 0) {
      console.log('Columns:', Object.keys(existingPackages[0]));
      existingPackages.forEach(pkg => {
        console.log(`  - ID: ${pkg.id}, Name: ${pkg.name || 'N/A'}, Price: ${pkg.price || 'N/A'}`);
      });
    } else {
      console.log('  No packages found');
    }

    // Check existing users with test emails
    console.log('\n👥 Existing test users:');
    const [testUsers] = await sequelize.query(`
      SELECT UserID, FullName, Email, Role, Status, CreatedAt 
      FROM users 
      WHERE Email IN ('pro_test@example.com', 'premium_test@example.com')
    `);
    if (testUsers.length > 0) {
      testUsers.forEach(user => {
        console.log(`  - ${user.FullName} (${user.Email}) - ${user.Role} - ${user.Status}`);
      });
    } else {
      console.log('  No test users found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabaseStructure();

