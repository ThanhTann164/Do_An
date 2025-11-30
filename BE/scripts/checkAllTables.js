const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function checkAllTables() {
  try {
    console.log('🔍 Checking all tables...');

    // List all tables
    const [tables] = await sequelize.query(`SHOW TABLES`);
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Check packages table
    console.log('\n📦 Packages table:');
    const [packages] = await sequelize.query(`SELECT * FROM packages LIMIT 3`);
    if (packages.length > 0) {
      console.log('Sample data:');
      packages.forEach(pkg => {
        console.log(`  - ${pkg.name}: ${pkg.display_name} - ${pkg.price} VND`);
      });
    }

    // Check if there's a user subscription table
    const packageRelatedTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toLowerCase();
      return tableName.includes('package') || tableName.includes('subscription') || tableName.includes('plan');
    });

    console.log('\n🔗 Package-related tables:');
    packageRelatedTables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllTables();



