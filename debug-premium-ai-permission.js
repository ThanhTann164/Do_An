const getSequelizeInstance = require('./BE/utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const PackageMiddleware = require('./BE/Middlewares/packageMiddleware');
const { hasAITool, getPackageRules } = require('./BE/constants/packages');
const { userpackages, packages } = require('./BE/models/init-models')(sequelize);

/**
 * Script debug để kiểm tra quyền AI của gói PREMIUM
 */
async function debugPremiumAIPermission() {
  try {
    console.log('🔍 Đang kiểm tra quyền AI của gói PREMIUM...\n');

    // Tìm user premium_test
    const [users] = await sequelize.query(`
      SELECT UserID, FullName, Email, Role
      FROM users 
      WHERE Email = 'premium_test@example.com'
      LIMIT 1
    `);

    if (users.length === 0) {
      console.log('❌ Không tìm thấy user premium_test@example.com');
      process.exit(0);
      return;
    }

    const user = users[0];
    const userId = user.UserID;
    console.log(`✅ Tìm thấy user: ${user.Email} (ID: ${userId})\n`);

    console.log('═'.repeat(80));

    // 1. Kiểm tra từ database - bảng packages
    console.log('📦 1. KIỂM TRA TỪ DATABASE (bảng packages):');
    const [packageFromDB] = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.display_name,
        p.ai_tools,
        JSON_EXTRACT(p.ai_tools, '$') as ai_tools_raw
      FROM packages p
      WHERE p.name = 'PREMIUM' OR p.name = 'premium'
      LIMIT 1
    `);

    if (packageFromDB.length > 0) {
      const pkg = packageFromDB[0];
      console.log(`   ✅ Tìm thấy package: ${pkg.name}`);
      console.log(`   - ID: ${pkg.id}`);
      console.log(`   - Display name: ${pkg.display_name}`);
      console.log(`   - AI Tools (raw): ${pkg.ai_tools_raw || pkg.ai_tools}`);
      
      // Parse AI tools
      let aiToolsFromDB = [];
      try {
        if (typeof pkg.ai_tools === 'string') {
          aiToolsFromDB = JSON.parse(pkg.ai_tools);
        } else if (Array.isArray(pkg.ai_tools)) {
          aiToolsFromDB = pkg.ai_tools;
        }
      } catch (e) {
        console.log(`   ⚠️  Lỗi parse AI tools: ${e.message}`);
      }
      
      console.log(`   - AI Tools (parsed): ${JSON.stringify(aiToolsFromDB)}`);
      console.log(`   - Số lượng AI tools: ${aiToolsFromDB.length}`);
    } else {
      console.log('   ❌ Không tìm thấy package PREMIUM trong database');
    }

    // 2. Kiểm tra từ constants (hardcoded)
    console.log('\n📦 2. KIỂM TRA TỪ CONSTANTS (hardcoded):');
    const premiumRules = getPackageRules('PREMIUM');
    console.log(`   - AI Tools từ constants: ${JSON.stringify(premiumRules.ai_tools)}`);
    console.log(`   - Số lượng: ${premiumRules.ai_tools.length}`);

    // 3. Kiểm tra user package từ getUserPackage
    console.log('\n📦 3. KIỂM TRA TỪ getUserPackage():');
    const userPackage = await PackageMiddleware.getUserPackage(userId, user.Role);
    
    if (!userPackage) {
      console.log('   ❌ getUserPackage() trả về null');
    } else {
      console.log(`   ✅ Package name: ${userPackage.name}`);
      console.log(`   - Is free: ${userPackage.is_free}`);
      
      // Lấy ai_tools từ userPackage
      const aiToolsFromUserPackage = userPackage.ai_tools || [];
      console.log(`   - AI Tools từ userPackage: ${JSON.stringify(aiToolsFromUserPackage)}`);
      console.log(`   - Số lượng: ${aiToolsFromUserPackage.length}`);
      
      // Kiểm tra từ rules
      if (userPackage.rules) {
        console.log(`   - AI Tools từ rules: ${JSON.stringify(userPackage.rules.ai_tools || [])}`);
      }
    }

    // 4. Kiểm tra từ user_packages với JOIN packages
    console.log('\n📦 4. KIỂM TRA TỪ user_packages JOIN packages:');
    const [userPackageDetails] = await sequelize.query(`
      SELECT 
        up.id,
        up.user_id,
        up.status,
        up.end_at,
        p.name as package_name,
        p.display_name,
        p.ai_tools,
        JSON_EXTRACT(p.ai_tools, '$') as ai_tools_json
      FROM user_packages up
      JOIN packages p ON up.package_id = p.id
      WHERE up.user_id = ? AND up.status = 'active' AND up.end_at > NOW()
      ORDER BY up.created_at DESC
      LIMIT 1
    `, { replacements: [userId] });

    if (userPackageDetails.length > 0) {
      const up = userPackageDetails[0];
      console.log(`   ✅ User package ID: ${up.id}`);
      console.log(`   - Package name: ${up.package_name}`);
      console.log(`   - Status: ${up.status}`);
      console.log(`   - End at: ${up.end_at}`);
      
      // Parse AI tools
      let aiToolsFromUP = [];
      try {
        if (typeof up.ai_tools === 'string') {
          aiToolsFromUP = JSON.parse(up.ai_tools);
        } else if (Array.isArray(up.ai_tools)) {
          aiToolsFromUP = up.ai_tools;
        }
      } catch (e) {
        console.log(`   ⚠️  Lỗi parse: ${e.message}`);
      }
      
      console.log(`   - AI Tools: ${JSON.stringify(aiToolsFromUP)}`);
      console.log(`   - Số lượng: ${aiToolsFromUP.length}`);
    } else {
      console.log('   ❌ Không tìm thấy user package active');
    }

    // 5. Test các hàm hasAITool với các tool cụ thể
    console.log('\n📦 5. KIỂM TRA hasAITool() VỚI CÁC TOOL CỤ THỂ:');
    const testTools = [
      'title_optimization',
      'description_generation',
      'panorama_ai',
      'market_analysis',
      'price_suggestion'
    ];

    testTools.forEach(tool => {
      const hasAccess = hasAITool('PREMIUM', tool);
      console.log(`   - ${tool}: ${hasAccess ? '✅ Có quyền' : '❌ Không có quyền'}`);
    });

    // 6. Test với userPackage thực tế
    console.log('\n📦 6. KIỂM TRA VỚI userPackage THỰC TẾ:');
    if (userPackage && !userPackage.is_free) {
      const actualPackageName = userPackage.name;
      console.log(`   Package name: ${actualPackageName}`);
      
      testTools.forEach(tool => {
        const hasAccess = hasAITool(actualPackageName, tool);
        console.log(`   - ${tool}: ${hasAccess ? '✅ Có quyền' : '❌ Không có quyền'}`);
      });
    }

    // 7. So sánh constants vs database
    console.log('\n📦 7. SO SÁNH CONSTANTS VS DATABASE:');
    const constantsTools = premiumRules.ai_tools || [];
    const dbTools = packageFromDB.length > 0 ? 
      (typeof packageFromDB[0].ai_tools === 'string' ? 
        JSON.parse(packageFromDB[0].ai_tools) : 
        packageFromDB[0].ai_tools) : [];
    
    console.log(`   Constants: ${JSON.stringify(constantsTools)}`);
    console.log(`   Database: ${JSON.stringify(dbTools)}`);
    
    const missingInDB = constantsTools.filter(t => !dbTools.includes(t));
    const missingInConstants = dbTools.filter(t => !constantsTools.includes(t));
    
    if (missingInDB.length > 0) {
      console.log(`   ⚠️  Tools có trong constants nhưng không có trong DB: ${JSON.stringify(missingInDB)}`);
    }
    if (missingInConstants.length > 0) {
      console.log(`   ⚠️  Tools có trong DB nhưng không có trong constants: ${JSON.stringify(missingInConstants)}`);
    }
    if (missingInDB.length === 0 && missingInConstants.length === 0) {
      console.log(`   ✅ Constants và Database khớp nhau`);
    }

    // 8. Test checkAIPermission từ AIController
    console.log('\n📦 8. KIỂM TRA checkAIPermission() TỪ AIController:');
    const AIController = require('./BE/controllers/ai.controller');
    const aiPermission = await AIController.checkAIPermission(userId, user.Role);
    
    console.log(`   - Has permission: ${aiPermission.hasPermission ? '✅ Có' : '❌ Không'}`);
    console.log(`   - Package: ${aiPermission.package?.name || 'N/A'}`);
    console.log(`   - AI Tools: ${JSON.stringify(aiPermission.ai_tools || [])}`);

    console.log('\n' + '═'.repeat(80));
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
debugPremiumAIPermission();



