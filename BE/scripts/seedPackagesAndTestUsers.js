const bcrypt = require('bcrypt');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function seedPackagesAndTestUsers() {
  try {
    console.log('🌱 Starting seed process...');

    // 1. Tạo/cập nhật packages
    console.log('\n📦 Creating/updating packages...');
    
    const packagesData = [
      {
        name: 'free',
        display_name: 'Gói Miễn Phí',
        type: 'FREE',
        price: 0.00,
        duration_days: 365, // 1 year
        max_posts: 3,
        max_premium_posts: 0,
        max_images_per_post: 3,
        ai_tools: [],
        boost_features: [],
        priority_level: 3,
        is_active: true,
        description: 'Gói miễn phí cho người dùng mới',
        features: [
          'Đăng tối đa 3 bài viết',
          'Tối đa 3 hình ảnh mỗi bài',
          'Hỗ trợ cơ bản',
          'Tìm kiếm cơ bản'
        ]
      },
      {
        name: 'pro',
        display_name: 'Gói PRO',
        type: 'PREMIUM',
        price: 99000.00,
        duration_days: 30,
        max_posts: 20,
        max_premium_posts: 5,
        max_images_per_post: 10,
        ai_tools: ['title_optimization', 'description_generation'],
        boost_features: ['daily_boost'],
        priority_level: 2,
        is_active: true,
        description: 'Gói PRO cho người bán chuyên nghiệp',
        features: [
          'Đăng tối đa 20 bài viết',
          'Tối đa 10 hình ảnh mỗi bài',
          '5 bài viết premium',
          'AI tối ưu tiêu đề và mô tả',
          '1 lượt boost mỗi ngày',
          'Hỗ trợ ưu tiên',
          'Thống kê chi tiết',
          'Badge PRO'
        ]
      },
      {
        name: 'premium',
        display_name: 'Gói PREMIUM',
        type: 'VIP',
        price: 299000.00,
        duration_days: 30,
        max_posts: -1, // unlimited
        max_premium_posts: -1, // unlimited
        max_images_per_post: 20,
        ai_tools: ['title_optimization', 'description_generation', 'market_analysis', 'price_suggestion'],
        boost_features: ['unlimited_boost', 'priority_listing', 'featured_badge'],
        priority_level: 1,
        is_active: true,
        description: 'Gói PREMIUM cho doanh nghiệp',
        features: [
          'Đăng bài không giới hạn',
          'Tối đa 20 hình ảnh mỗi bài',
          'Bài viết premium không giới hạn',
          'Tất cả tính năng AI',
          'Boost không giới hạn',
          'Ưu tiên hiển thị',
          'Badge PREMIUM',
          'Thống kê nâng cao',
          'Hỗ trợ 24/7',
          'Video panorama',
          'Báo cáo thị trường'
        ]
      }
    ];

    // Insert or update packages
    for (const packageData of packagesData) {
      const [package, created] = await sequelize.query(`
        INSERT INTO packages (
          name, display_name, type, price, duration_days, max_posts, max_premium_posts,
          max_images_per_post, ai_tools, boost_features, priority_level, is_active,
          description, features, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          display_name = VALUES(display_name),
          type = VALUES(type),
          price = VALUES(price),
          duration_days = VALUES(duration_days),
          max_posts = VALUES(max_posts),
          max_premium_posts = VALUES(max_premium_posts),
          max_images_per_post = VALUES(max_images_per_post),
          ai_tools = VALUES(ai_tools),
          boost_features = VALUES(boost_features),
          priority_level = VALUES(priority_level),
          is_active = VALUES(is_active),
          description = VALUES(description),
          features = VALUES(features),
          updated_at = NOW()
      `, {
        replacements: [
          packageData.name,
          packageData.display_name,
          packageData.type,
          packageData.price,
          packageData.duration_days,
          packageData.max_posts,
          packageData.max_premium_posts,
          packageData.max_images_per_post,
          JSON.stringify(packageData.ai_tools),
          JSON.stringify(packageData.boost_features),
          packageData.priority_level,
          packageData.is_active,
          packageData.description,
          JSON.stringify(packageData.features)
        ]
      });
      
      console.log(`✅ Package '${packageData.name}' created/updated`);
    }

    // 2. Tạo test users
    console.log('\n👥 Creating test users...');
    
    const testPassword = 'Test@1234';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUsers = [
      {
        fullName: 'Test Pro User',
        email: 'pro_test@example.com',
        password: hashedPassword,
        role: 'Seller',
        status: 'Active',
        packageName: 'pro'
      },
      {
        fullName: 'Test Premium User', 
        email: 'premium_test@example.com',
        password: hashedPassword,
        role: 'Seller',
        status: 'Active',
        packageName: 'premium'
      }
    ];

    for (const userData of testUsers) {
      // Insert or update user
      const [userResult] = await sequelize.query(`
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
        UPDATE userpackages 
        SET status = 'cancelled', updated_at = NOW()
        WHERE user_id = ? AND status = 'active'
      `, { replacements: [userId] });

      // Create new user package
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // 30 days

      await sequelize.query(`
        INSERT INTO userpackages (
          user_id, package_id, status, started_at, expires_at, 
          payment_method, transaction_id, created_at, updated_at
        ) VALUES (?, ?, 'active', ?, ?, 'test', ?, NOW(), NOW())
      `, {
        replacements: [
          userId,
          packageId,
          startDate,
          endDate,
          `TEST_${Date.now()}_${userId}`
        ]
      });

      console.log(`✅ Package '${userData.packageName}' assigned to user: ${userData.email}`);
    }

    // 3. Verify data
    console.log('\n🔍 Verifying created data...');
    
    const [packages] = await sequelize.query(`
      SELECT id, name, display_name, type, price FROM packages WHERE is_active = 1
    `);
    
    console.log('\n📦 Available packages:');
    packages.forEach(pkg => {
      console.log(`  - ${pkg.name}: ${pkg.display_name} (${pkg.type}) - ${pkg.price} VND`);
    });

    const [users] = await sequelize.query(`
      SELECT 
        u.UserID, u.FullName, u.Email, u.Role,
        p.name as package_name, p.display_name as package_display,
        up.status, up.expires_at
      FROM users u
      LEFT JOIN userpackages up ON u.UserID = up.user_id AND up.status = 'active'
      LEFT JOIN packages p ON up.package_id = p.id
      WHERE u.Email IN ('pro_test@example.com', 'premium_test@example.com')
    `);

    console.log('\n👥 Test users:');
    users.forEach(user => {
      console.log(`  - ${user.FullName} (${user.Email})`);
      console.log(`    Role: ${user.Role}`);
      console.log(`    Package: ${user.package_display || 'FREE'}`);
      console.log(`    Expires: ${user.expires_at || 'N/A'}`);
      console.log('');
    });

    console.log('🎉 Seed process completed successfully!');
    console.log('\n📋 Test credentials:');
    console.log('  - pro_test@example.com / Test@1234 (PRO package)');
    console.log('  - premium_test@example.com / Test@1234 (PREMIUM package)');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedPackagesAndTestUsers();
}

module.exports = seedPackagesAndTestUsers;

