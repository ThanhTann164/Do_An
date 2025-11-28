const bcrypt = require('bcrypt');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function createTestAccounts() {
  try {
    console.log('🌱 Creating test accounts...');

    // 1. Update packages with proper features
    console.log('\n📦 Updating packages with features...');
    
    const packagesUpdates = [
      {
        name: 'FREE',
        ai_tools: JSON.stringify([]),
        features: JSON.stringify([
          'Đăng tối đa 3 bài viết',
          'Tối đa 3 hình ảnh mỗi bài',
          'Hỗ trợ cơ bản',
          'Tìm kiếm cơ bản'
        ]),
        boost_per_day: 0,
        max_cover_media: 3
      },
      {
        name: 'PRO',
        ai_tools: JSON.stringify(['title_optimization', 'description_generation']),
        features: JSON.stringify([
          'Đăng tối đa 20 bài viết',
          'Tối đa 10 hình ảnh mỗi bài',
          'AI tối ưu tiêu đề và mô tả',
          '1 lượt boost mỗi ngày',
          'Hỗ trợ ưu tiên',
          'Thống kê chi tiết',
          'Badge PRO'
        ]),
        boost_per_day: 1,
        max_cover_media: 10,
        highlight: 1,
        verified_seller_badge: 1
      },
      {
        name: 'PREMIUM',
        ai_tools: JSON.stringify(['title_optimization', 'description_generation', 'market_analysis', 'price_suggestion']),
        features: JSON.stringify([
          'Đăng bài không giới hạn',
          'Tối đa 20 hình ảnh mỗi bài',
          'Tất cả tính năng AI',
          'Boost không giới hạn',
          'Ưu tiên hiển thị',
          'Badge PREMIUM',
          'Thống kê nâng cao',
          'Hỗ trợ 24/7',
          'Video panorama',
          'Báo cáo thị trường'
        ]),
        boost_per_day: -1, // unlimited
        max_cover_media: 20,
        highlight: 1,
        top_priority: 1,
        banner_enabled: 1,
        auto_refresh: 1,
        verified_seller_badge: 1
      }
    ];

    for (const packageUpdate of packagesUpdates) {
      await sequelize.query(`
        UPDATE packages SET
          ai_tools = ?,
          features = ?,
          boost_per_day = ?,
          max_cover_media = ?,
          highlight = ?,
          top_priority = ?,
          banner_enabled = ?,
          auto_refresh = ?,
          verified_seller_badge = ?,
          updated_at = NOW()
        WHERE name = ?
      `, {
        replacements: [
          packageUpdate.ai_tools,
          packageUpdate.features,
          packageUpdate.boost_per_day,
          packageUpdate.max_cover_media,
          packageUpdate.highlight || 0,
          packageUpdate.top_priority || 0,
          packageUpdate.banner_enabled || 0,
          packageUpdate.auto_refresh || 0,
          packageUpdate.verified_seller_badge || 0,
          packageUpdate.name
        ]
      });
      console.log(`✅ Updated package: ${packageUpdate.name}`);
    }

    // 2. Create test users
    console.log('\n👥 Creating test users...');
    
    const testPassword = '123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUsers = [
      {
        fullName: 'Test Pro User',
        email: 'pro_test@example.com',
        password: hashedPassword,
        role: 'Seller',
        status: 'Active',
        packageName: 'PRO'
      },
      {
        fullName: 'Test Premium User', 
        email: 'premium_test@example.com',
        password: hashedPassword,
        role: 'Seller',
        status: 'Active',
        packageName: 'PREMIUM'
      }
    ];

    for (const userData of testUsers) {
      // Insert or update user
      await sequelize.query(`
        INSERT INTO users (FullName, Email, PasswordHash, Role, Status, CreatedAt, UpdatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          FullName = VALUES(FullName),
          PasswordHash = VALUES(PasswordHash),
          Role = VALUES(Role),
          Status = VALUES(Status),
          UpdatedAt = NOW()
      `, {
        replacements: [
          userData.fullName,
          userData.email,
          userData.password,
          userData.role,
          userData.status
        ]
      });

      // Get user ID
      const [user] = await sequelize.query(`
        SELECT UserID FROM users WHERE Email = ?
      `, { replacements: [userData.email] });

      if (user.length === 0) {
        console.log(`❌ Failed to create/find user: ${userData.email}`);
        continue;
      }

      const userId = user[0].UserID;
      console.log(`✅ User created/updated: ${userData.email} (ID: ${userId})`);

      // Get package ID
      const [packageResult] = await sequelize.query(`
        SELECT id FROM packages WHERE name = ?
      `, { replacements: [userData.packageName] });

      if (packageResult.length === 0) {
        console.log(`❌ Package not found: ${userData.packageName}`);
        continue;
      }

      const packageId = packageResult[0].id;

      // Cancel existing active packages
      await sequelize.query(`
        UPDATE user_packages 
        SET status = 'cancelled', updated_at = NOW()
        WHERE user_id = ? AND status = 'active'
      `, { replacements: [userId] });

      // Create new user package with long expiry
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(2030); // 2030 for testing

      await sequelize.query(`
        INSERT INTO user_packages (
          user_id, package_id, start_at, end_at, status, purchase_price,
          payment_method, transaction_id, boost_used_today, last_boost_reset,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, 'test', ?, 0, CURDATE(), NOW(), NOW())
      `, {
        replacements: [
          userId,
          packageId,
          startDate,
          endDate,
          packageResult[0].price || 0,
          `TEST_${Date.now()}_${userId}`
        ]
      });

      console.log(`✅ Package '${userData.packageName}' assigned to user: ${userData.email}`);
    }

    // 3. Verify created data
    console.log('\n🔍 Verifying created data...');
    
    const [verifyUsers] = await sequelize.query(`
      SELECT 
        u.UserID, u.FullName, u.Email, u.Role,
        p.name as package_name, p.display_name as package_display,
        up.status, up.end_at, up.boost_used_today
      FROM users u
      LEFT JOIN user_packages up ON u.UserID = up.user_id AND up.status = 'active'
      LEFT JOIN packages p ON up.package_id = p.id
      WHERE u.Email IN ('pro_test@example.com', 'premium_test@example.com')
    `);

    console.log('\n👥 Test users created:');
    verifyUsers.forEach(user => {
      console.log(`  - ${user.FullName} (${user.Email})`);
      console.log(`    Role: ${user.Role}`);
      console.log(`    Package: ${user.package_display || 'FREE'}`);
      console.log(`    Expires: ${user.end_at || 'N/A'}`);
      console.log(`    Boost used today: ${user.boost_used_today || 0}`);
      console.log('');
    });

    // 4. Test login
    console.log('\n🔐 Testing login for test accounts...');
    
    for (const userData of testUsers) {
      const [loginUser] = await sequelize.query(`
        SELECT UserID, FullName, Email, PasswordHash, Role, Status
        FROM users 
        WHERE Email = ?
      `, { replacements: [userData.email] });

      if (loginUser.length > 0) {
        const user = loginUser[0];
        const passwordMatch = await bcrypt.compare(testPassword, user.PasswordHash);
        
        if (passwordMatch) {
          console.log(`✅ Login test successful for: ${userData.email}`);
        } else {
          console.log(`❌ Login test failed for: ${userData.email} - Password mismatch`);
        }
      } else {
        console.log(`❌ Login test failed for: ${userData.email} - User not found`);
      }
    }

    console.log('\n🎉 Test accounts creation completed successfully!');
    console.log('\n📋 Test credentials:');
    console.log('  - pro_test@example.com / 123456 (PRO package)');
    console.log('  - premium_test@example.com / 123456 (PREMIUM package)');
    
    console.log('\n🧪 API Test commands:');
    console.log('# Test PRO user login:');
    console.log('curl -X POST http://localhost:3001/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"pro_test@example.com","password":"123456"}\'');
    
    console.log('\n# Test PREMIUM user login:');
    console.log('curl -X POST http://localhost:3001/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email":"premium_test@example.com","password":"123456"}\'');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Test accounts creation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTestAccounts();
}

module.exports = createTestAccounts;
