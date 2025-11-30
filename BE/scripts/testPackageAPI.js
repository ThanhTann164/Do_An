const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function testPackageAPI() {
  try {
    console.log('🧪 Testing Package API functionality...');

    // 1. Test login for test users
    console.log('\n🔐 Testing login for test users...');
    
    const testUsers = [
      { email: 'pro_test@example.com', password: 'Test@1234', expectedPackage: 'PRO' },
      { email: 'premium_test@example.com', password: 'Test@1234', expectedPackage: 'PREMIUM' }
    ];

    for (const user of testUsers) {
      console.log(`\n📋 Testing ${user.email}:`);
      
      // Check user exists and get package info
      const [userResult] = await sequelize.query(`
        SELECT 
          u.UserID, u.FullName, u.Email, u.Role,
          p.name as package_name, p.display_name as package_display,
          up.status, up.end_at, up.boost_used_today,
          p.ai_tools, p.boost_per_day, p.features
        FROM users u
        LEFT JOIN user_packages up ON u.UserID = up.user_id AND up.status = 'active'
        LEFT JOIN packages p ON up.package_id = p.id
        WHERE u.Email = ?
      `, { replacements: [user.email] });

      if (userResult.length === 0) {
        console.log(`❌ User not found: ${user.email}`);
        continue;
      }

      const userInfo = userResult[0];
      console.log(`✅ User found: ${userInfo.FullName}`);
      console.log(`   Package: ${userInfo.package_display || 'FREE'}`);
      console.log(`   AI Tools: ${JSON.stringify(userInfo.ai_tools || [])}`);
      console.log(`   Boost per day: ${userInfo.boost_per_day || 0}`);
      console.log(`   Boost used today: ${userInfo.boost_used_today || 0}`);

      // Check post count
      const [postCount] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM houses 
        WHERE OwnerID = ? 
          AND YEAR(createdAt) = YEAR(NOW()) 
          AND MONTH(createdAt) = MONTH(NOW())
      `, { replacements: [userInfo.UserID] });

      console.log(`   Posts this month: ${postCount[0].count}`);
    }

    // 2. Test package features
    console.log('\n📦 Testing package features...');
    
    const [packages] = await sequelize.query(`
      SELECT * FROM packages WHERE is_active = 1 ORDER BY priority_level ASC
    `);

    packages.forEach(pkg => {
      console.log(`\n📋 ${pkg.display_name} (${pkg.name}):`);
      console.log(`   Price: ${pkg.price} VND`);
      console.log(`   Duration: ${pkg.duration_days} days`);
      console.log(`   Boost per day: ${pkg.boost_per_day || 0}`);
      console.log(`   Max cover media: ${pkg.max_cover_media || 0}`);
      console.log(`   AI Tools: ${JSON.stringify(pkg.ai_tools || [])}`);
      console.log(`   Features: ${JSON.stringify(pkg.features || [])}`);
      console.log(`   Highlight: ${pkg.highlight ? 'Yes' : 'No'}`);
      console.log(`   Top Priority: ${pkg.top_priority ? 'Yes' : 'No'}`);
      console.log(`   Verified Badge: ${pkg.verified_seller_badge ? 'Yes' : 'No'}`);
    });

    // 3. Generate API test commands
    console.log('\n🧪 API Test Commands:');
    
    console.log('\n# 1. Login as PRO user:');
    console.log('curl -X POST http://localhost:3001/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"pro_test@example.com","password":"Test@1234"}\'');
    
    console.log('\n# 2. Login as PREMIUM user:');
    console.log('curl -X POST http://localhost:3001/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"premium_test@example.com","password":"Test@1234"}\'');

    console.log('\n# 3. Get user package info (replace TOKEN):');
    console.log('curl -X GET http://localhost:3001/api/packages/my-package \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN"');

    console.log('\n# 4. Test AI title optimization (PRO+ only):');
    console.log('curl -X POST http://localhost:3001/api/ai/optimize-title \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"title":"Nhà đẹp cần bán"}\'');

    console.log('\n# 5. Test boost house (PRO+ only, replace HOUSE_ID):');
    console.log('curl -X POST http://localhost:3001/api/houses/HOUSE_ID/boost \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"duration_hours":6}\'');

    console.log('\n# 6. Dev: Assign package (Admin only):');
    console.log('curl -X POST http://localhost:3001/api/dev/assign-package \\');
    console.log('  -H "Authorization: Bearer ADMIN_TOKEN" \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"pro_test@example.com","package":"FREE","days":30}\'');

    console.log('\n# 7. Dev: Get user package info:');
    console.log('curl -X GET http://localhost:3001/api/dev/user-package/pro_test@example.com \\');
    console.log('  -H "Authorization: Bearer ADMIN_TOKEN"');

    console.log('\n🎯 Expected Behaviors:');
    console.log('✅ PRO users can use AI title optimization and description generation');
    console.log('✅ PRO users can boost 1 time per day');
    console.log('✅ PRO users can post max 20 posts per month');
    console.log('✅ PREMIUM users can use all AI tools');
    console.log('✅ PREMIUM users can boost unlimited times');
    console.log('✅ PREMIUM users can post unlimited posts');
    console.log('✅ FREE users get 403 error for AI and boost features');
    console.log('✅ FREE users can only post 3 posts per month');

    console.log('\n🎉 Package API test setup completed!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testPackageAPI();
}

module.exports = testPackageAPI;



