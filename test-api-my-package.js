const getSequelizeInstance = require('./BE/utils/sequelize-instance');
const sequelize = getSequelizeInstance();

/**
 * Test API endpoint /api/packages/my-package với user premium_test
 */
async function testMyPackageAPI() {
  try {
    console.log('🔍 Testing /api/packages/my-package API...\n');

    // Tìm user premium_test
    const [users] = await sequelize.query(`
      SELECT UserID, Email, FullName, Role
      FROM users 
      WHERE Email = 'premium_test@example.com'
      LIMIT 1
    `);

    if (users.length === 0) {
      console.log('❌ User not found');
      process.exit(0);
      return;
    }

    const user = users[0];
    console.log(`✅ User found: ${user.Email} (ID: ${user.UserID})\n`);

    // Simulate API call logic từ PackageController.getMyPackage()
    const PackageMiddleware = require('./BE/Middlewares/packageMiddleware');
    const { formatPackagePayload } = require('./BE/Utils/packageFormatter');
    const { userpackages } = require('./BE/models/init-models')(sequelize);
    const { Op } = require('sequelize');
    const { isSellerRole, extractRole } = require('./BE/Utils/roleUtils');

    const userId = user.UserID;
    const role = user.Role;

    console.log('═'.repeat(80));
    console.log('📦 STEP 1: Check if seller role');
    console.log(`   Role: ${role}, Is Seller: ${isSellerRole(role)}`);
    
    if (!isSellerRole(role)) {
      console.log('   ❌ Not a seller, would return: { packageName: null, isFree: false, raw: null }');
      process.exit(0);
      return;
    }

    console.log('\n📦 STEP 2: Find active package');
    const activePackage = await userpackages.findOne({
      where: {
        user_id: userId,
        status: 'active',
        end_at: { [Op.gt]: new Date() }
      },
      order: [['end_at', 'DESC']]
    });

    if (!activePackage) {
      console.log('   ❌ No active package found');
      console.log('   Would return: { packageName: "FREE", isFree: true, raw: null }');
      process.exit(0);
      return;
    }

    console.log(`   ✅ Found active package ID: ${activePackage.id}`);
    console.log(`   - Package ID: ${activePackage.package_id}`);
    console.log(`   - Status: ${activePackage.status}`);
    console.log(`   - End at: ${activePackage.end_at}`);

    console.log('\n📦 STEP 3: Get user package details from PackageMiddleware');
    const userPackageDetails = await PackageMiddleware.getUserPackage(userId, role);
    
    if (!userPackageDetails) {
      console.log('   ❌ PackageMiddleware returned null');
      console.log('   Would return: { packageName: "FREE", isFree: true, raw: null }');
      process.exit(0);
      return;
    }

    console.log(`   ✅ Package name: ${userPackageDetails.name}`);
    console.log(`   - Display name: ${userPackageDetails.display_name}`);
    console.log(`   - Is free: ${userPackageDetails.is_free}`);
    console.log(`   - AI tools: ${JSON.stringify(userPackageDetails.ai_tools || [])}`);
    console.log(`   - Rules: ${JSON.stringify(userPackageDetails.rules || {})}`);

    console.log('\n📦 STEP 4: Format package payload');
    const formatted = formatPackagePayload(userPackageDetails);
    console.log(`   Formatted:`, JSON.stringify(formatted, null, 2));

    const normalizedName = (formatted?.userPackage?.name || formatted?.name || userPackageDetails.name || 'FREE').toUpperCase();
    console.log(`   Normalized name: ${normalizedName}`);

    console.log('\n📦 STEP 5: Final API response');
    const apiResponse = {
      packageName: normalizedName,
      isFree: normalizedName === 'FREE',
      raw: formatted
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    console.log('\n' + '═'.repeat(80));
    console.log('✅ Test completed!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testMyPackageAPI();



