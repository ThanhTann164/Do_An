const getSequelizeInstance = require('./BE/utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const PackageMiddleware = require('./BE/Middlewares/packageMiddleware');

/**
 * Script debug để kiểm tra gói của tài khoản test-premium
 */
async function debugTestPremiumPackage() {
  try {
    console.log('🔍 Đang tìm kiếm tài khoản test-premium...\n');

    // Tìm user có email hoặc tên chứa "test-premium" hoặc "premium_test"
    const [users] = await sequelize.query(`
      SELECT 
        UserID,
        FullName,
        Email,
        Role,
        Status,
        CreatedAt
      FROM users 
      WHERE 
        Email LIKE '%test-premium%' 
        OR Email LIKE '%premium_test%'
        OR FullName LIKE '%test-premium%'
        OR FullName LIKE '%Test Premium%'
      ORDER BY CreatedAt DESC
    `);

    if (users.length === 0) {
      console.log('❌ Không tìm thấy tài khoản test-premium');
      console.log('\n📋 Đang liệt kê tất cả user có chứa "premium" hoặc "test":');
      
      const [allUsers] = await sequelize.query(`
        SELECT UserID, FullName, Email, Role, Status
        FROM users 
        WHERE Email LIKE '%premium%' OR Email LIKE '%test%' OR FullName LIKE '%premium%' OR FullName LIKE '%test%'
        ORDER BY Email
      `);
      
      if (allUsers.length > 0) {
        console.log('\n👥 Danh sách user tìm thấy:');
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.Email} (${user.FullName}) - Role: ${user.Role}`);
        });
      }
      
      process.exit(0);
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} tài khoản:\n`);
    
    for (const user of users) {
      console.log('═'.repeat(80));
      console.log(`👤 THÔNG TIN USER:`);
      console.log(`   ID: ${user.UserID}`);
      console.log(`   Tên: ${user.FullName}`);
      console.log(`   Email: ${user.Email}`);
      console.log(`   Role: ${user.Role}`);
      console.log(`   Status: ${user.Status}`);
      console.log(`   Ngày tạo: ${user.CreatedAt || 'N/A'}`);
      console.log('');

      const userId = user.UserID;

      // 1. Kiểm tra gói từ bảng user_packages (raw query)
      console.log('📦 1. KIỂM TRA TỪ BẢNG user_packages:');
      const [userPackages] = await sequelize.query(`
        SELECT 
          up.id,
          up.user_id,
          up.package_id,
          up.status,
          up.start_at,
          up.end_at,
          up.purchase_price,
          up.payment_method,
          up.transaction_id,
          up.boost_used_today,
          up.last_boost_reset,
          up.created_at,
          p.name as package_name,
          p.display_name,
          p.price as package_price,
          p.duration_days,
          p.is_active,
          CASE 
            WHEN up.end_at < NOW() THEN 'Hết hạn'
            WHEN up.status = 'active' AND up.end_at > NOW() THEN 'Đang active'
            WHEN up.status = 'cancelled' THEN 'Đã hủy'
            WHEN up.status = 'expired' THEN 'Đã hết hạn'
            ELSE 'Khác'
          END as package_status_desc,
          DATEDIFF(up.end_at, NOW()) as days_remaining
        FROM user_packages up
        LEFT JOIN packages p ON up.package_id = p.id
        WHERE up.user_id = ?
        ORDER BY up.created_at DESC
      `, { replacements: [userId] });

      if (userPackages.length === 0) {
        console.log('   ⚠️  Không có gói nào trong bảng user_packages');
      } else {
        userPackages.forEach((up, index) => {
          console.log(`\n   📌 Gói #${index + 1}:`);
          console.log(`      - ID: ${up.id}`);
          console.log(`      - Tên gói: ${up.package_name || 'N/A'} (${up.display_name || 'N/A'})`);
          console.log(`      - Status: ${up.status} (${up.package_status_desc})`);
          console.log(`      - Bắt đầu: ${up.start_at || 'N/A'}`);
          console.log(`      - Kết thúc: ${up.end_at || 'N/A'}`);
          console.log(`      - Còn lại: ${up.days_remaining !== null ? up.days_remaining + ' ngày' : 'N/A'}`);
          console.log(`      - Giá mua: ${up.purchase_price || 0} VNĐ`);
          console.log(`      - Phương thức thanh toán: ${up.payment_method || 'N/A'}`);
          console.log(`      - Boost đã dùng hôm nay: ${up.boost_used_today || 0}`);
          console.log(`      - Gói active: ${up.is_active ? 'Có' : 'Không'}`);
        });
      }

      // 2. Sử dụng PackageMiddleware.getUserPackage() - hàm chính trong code
      console.log('\n📦 2. KIỂM TRA BẰNG PackageMiddleware.getUserPackage():');
      const userPackageFromMiddleware = await PackageMiddleware.getUserPackage(userId, user.Role);
      
      if (!userPackageFromMiddleware) {
        console.log('   ⚠️  PackageMiddleware trả về null');
      } else {
        console.log(`   ✅ Gói hiện tại: ${userPackageFromMiddleware.name}`);
        console.log(`      - Display name: ${userPackageFromMiddleware.display_name}`);
        console.log(`      - Is free: ${userPackageFromMiddleware.is_free}`);
        console.log(`      - Expires at: ${userPackageFromMiddleware.expires_at || 'Không có'}`);
        console.log(`      - Boost used today: ${userPackageFromMiddleware.boost_used_today}`);
        console.log(`      - Posts today: ${userPackageFromMiddleware.posts_today}`);
        console.log(`      - Posts this month: ${userPackageFromMiddleware.posts_this_month}`);
        console.log(`      - Rules:`, JSON.stringify(userPackageFromMiddleware.rules, null, 2));
      }

      // 3. Kiểm tra gói active theo logic trong controller
      console.log('\n📦 3. KIỂM TRA GÓI ACTIVE (theo logic controller):');
      const { userpackages: UserPackages } = require('./BE/models/init-models')(sequelize);
      const { Op } = require('sequelize');
      
      const activePackage = await UserPackages.findOne({
        where: {
          user_id: userId,
          status: 'active',
          end_at: { [Op.gt]: new Date() }
        },
        order: [['end_at', 'DESC']]
      });

      if (!activePackage) {
        console.log('   ⚠️  Không có gói active (status=active và end_at > NOW())');
      } else {
        const activePackageData = activePackage.toJSON();
        console.log(`   ✅ Tìm thấy gói active:`);
        console.log(`      - ID: ${activePackageData.id}`);
        console.log(`      - Package ID: ${activePackageData.package_id}`);
        console.log(`      - Status: ${activePackageData.status}`);
        console.log(`      - End at: ${activePackageData.end_at}`);
      }

      // 4. Kiểm tra tất cả packages có sẵn
      console.log('\n📦 4. DANH SÁCH TẤT CẢ PACKAGES CÓ SẴN:');
      const [allPackages] = await sequelize.query(`
        SELECT id, name, display_name, price, duration_days, is_active, priority_level
        FROM packages
        ORDER BY priority_level ASC
      `);
      
      allPackages.forEach((pkg) => {
        console.log(`   - ${pkg.name} (${pkg.display_name}): ${pkg.price} VNĐ, ${pkg.duration_days} ngày, Active: ${pkg.is_active ? 'Có' : 'Không'}`);
      });

      console.log('\n');
    }

    console.log('═'.repeat(80));
    console.log('✅ Hoàn thành kiểm tra!');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Chạy script
debugTestPremiumPackage();



