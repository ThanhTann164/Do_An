const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function checkPackageStructure() {
  try {
    console.log('🔍 Checking package-related tables...');

    // Check packages table structure
    console.log('\n📦 Packages table structure:');
    const [packagesColumns] = await sequelize.query(`DESCRIBE packages`);
    packagesColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check user_packages table structure
    console.log('\n👥 User_packages table structure:');
    const [userPackagesColumns] = await sequelize.query(`DESCRIBE user_packages`);
    userPackagesColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check usersubscription table structure
    console.log('\n💳 Usersubscription table structure:');
    const [userSubscriptionColumns] = await sequelize.query(`DESCRIBE usersubscription`);
    userSubscriptionColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check existing data
    console.log('\n📋 Existing packages:');
    const [existingPackages] = await sequelize.query(`SELECT * FROM packages`);
    existingPackages.forEach(pkg => {
      console.log(`  - ${pkg.name}: ${pkg.display_name} - ${pkg.price} VND (Priority: ${pkg.priority_level})`);
    });

    console.log('\n👥 Existing user packages:');
    const [existingUserPackages] = await sequelize.query(`SELECT * FROM user_packages LIMIT 5`);
    if (existingUserPackages.length > 0) {
      existingUserPackages.forEach(up => {
        console.log(`  - User ${up.user_id}: Package ${up.package_id} - Status: ${up.status || 'N/A'}`);
      });
    } else {
      console.log('  No user packages found');
    }

    console.log('\n💳 Existing subscriptions:');
    const [existingSubscriptions] = await sequelize.query(`SELECT * FROM usersubscription LIMIT 5`);
    if (existingSubscriptions.length > 0) {
      existingSubscriptions.forEach(sub => {
        console.log(`  - User ${sub.user_id || sub.UserID}: ${sub.package_name || sub.plan} - Status: ${sub.status}`);
      });
    } else {
      console.log('  No subscriptions found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPackageStructure();



