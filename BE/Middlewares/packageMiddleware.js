const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { PACKAGE_RULES, getPackageRules, hasFeature, hasAITool, getPostLimits, getBoostLimits } = require('../constants/packages');

/**
 * Middleware kiểm tra gói và quyền hạn của user
 */
class PackageMiddleware {
  
  /**
   * Lấy thông tin gói hiện tại của user
   */
  static async getUserPackage(userId) {
    try {
      // Kiểm tra user có gói active không
      const [userPackageResult] = await sequelize.query(`
        SELECT 
          up.*,
          p.name as package_name,
          p.display_name,
          p.ai_tools,
          p.boost_per_day,
          p.max_cover_media,
          p.highlight,
          p.top_priority,
          p.verified_seller_badge,
          p.features
        FROM user_packages up
        JOIN packages p ON up.package_id = p.id
        WHERE up.user_id = ? AND up.status = 'active' AND up.end_at > NOW()
        ORDER BY up.created_at DESC
        LIMIT 1
      `, { replacements: [userId] });

      if (userPackageResult.length === 0) {
        // Return FREE package as default
        const freeRules = getPackageRules('FREE');
        return {
          id: null,
          name: 'FREE',
          display_name: 'Gói Miễn Phí',
          rules: freeRules,
          boost_used_today: 0,
          posts_today: 0,
          posts_this_month: 0,
          is_free: true,
          expires_at: null
        };
      }

      const userPackage = userPackageResult[0];
      
      // Reset boost count if new day
      const today = new Date().toISOString().split('T')[0];
      const lastReset = userPackage.last_boost_reset ? 
        new Date(userPackage.last_boost_reset).toISOString().split('T')[0] : null;

      if (lastReset !== today) {
        await sequelize.query(`
          UPDATE user_packages 
          SET boost_used_today = 0, last_boost_reset = CURDATE()
          WHERE id = ?
        `, { replacements: [userPackage.id] });
        userPackage.boost_used_today = 0;
      }

      // Get package rules
      const packageRules = getPackageRules(userPackage.package_name);

      // Count posts today and this month
      const [postCounts] = await sequelize.query(`
        SELECT 
          COUNT(CASE WHEN DATE(createdAt) = CURDATE() THEN 1 END) as posts_today,
          COUNT(CASE WHEN YEAR(createdAt) = YEAR(NOW()) AND MONTH(createdAt) = MONTH(NOW()) THEN 1 END) as posts_this_month
        FROM houses 
        WHERE OwnerID = ?
      `, { replacements: [userId] });

      return {
        id: userPackage.id,
        name: userPackage.package_name,
        display_name: userPackage.display_name,
        rules: packageRules,
        boost_used_today: userPackage.boost_used_today || 0,
        posts_today: postCounts[0]?.posts_today || 0,
        posts_this_month: postCounts[0]?.posts_this_month || 0,
        is_free: false,
        expires_at: userPackage.end_at
      };

    } catch (error) {
      console.error('❌ Error getting user package:', error);
      return null;
    }
  }

  /**
   * Middleware kiểm tra quyền AI tools
   */
  static requireAIAccess(toolName = null) {
    return async (req, res, next) => {
      try {
        const userId = req.user.userId;
        const userPackage = await PackageMiddleware.getUserPackage(userId);

        if (!userPackage) {
          return res.status(500).json({
            success: false,
            message: 'Không thể kiểm tra gói dịch vụ'
          });
        }

        const aiTools = userPackage.ai_tools || [];
        
        if (userPackage.is_free || aiTools.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'Tính năng AI chỉ khả dụng cho gói PRO và PREMIUM',
            required_package: ['PRO', 'PREMIUM'],
            current_package: userPackage.package_name
          });
        }

        if (toolName && !aiTools.includes(toolName)) {
          return res.status(403).json({
            success: false,
            message: `Tính năng AI "${toolName}" không khả dụng trong gói hiện tại`,
            available_tools: aiTools,
            current_package: userPackage.package_name
          });
        }

        req.userPackage = userPackage;
        next();

      } catch (error) {
        console.error('❌ Error in AI access check:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra quyền truy cập AI'
        });
      }
    };
  }

  /**
   * Middleware kiểm tra quyền boost
   */
  static requireBoostAccess() {
    return async (req, res, next) => {
      try {
        const userId = req.user.userId;
        const userPackage = await PackageMiddleware.getUserPackage(userId);

        if (!userPackage) {
          return res.status(500).json({
            success: false,
            message: 'Không thể kiểm tra gói dịch vụ'
          });
        }

        if (userPackage.is_free || userPackage.boost_per_day === 0) {
          return res.status(403).json({
            success: false,
            message: 'Tính năng boost chỉ khả dụng cho gói PRO và PREMIUM',
            required_package: ['PRO', 'PREMIUM'],
            current_package: userPackage.package_name
          });
        }

        // Kiểm tra số lượt boost còn lại
        const boostUsedToday = userPackage.boost_used_today || 0;
        const boostPerDay = userPackage.boost_per_day;

        if (boostPerDay > 0 && boostUsedToday >= boostPerDay) {
          return res.status(429).json({
            success: false,
            message: 'Bạn đã hết lượt boost hôm nay',
            data: {
              boost_used_today: boostUsedToday,
              boost_per_day: boostPerDay,
              remaining_boosts: Math.max(0, boostPerDay - boostUsedToday)
            }
          });
        }

        req.userPackage = userPackage;
        next();

      } catch (error) {
        console.error('❌ Error in boost access check:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra quyền boost'
        });
      }
    };
  }

  /**
   * Middleware kiểm tra giới hạn đăng bài
   */
  static checkPostLimit() {
    return async (req, res, next) => {
      try {
        const userId = req.user.userId;
        const userPackage = await PackageMiddleware.getUserPackage(userId);

        if (!userPackage) {
          return res.status(500).json({
            success: false,
            message: 'Không thể kiểm tra gói dịch vụ'
          });
        }

        // Đếm số bài đăng trong tháng hiện tại
        const [postCount] = await sequelize.query(`
          SELECT COUNT(*) as count
          FROM houses 
          WHERE OwnerID = ? 
            AND YEAR(createdAt) = YEAR(NOW()) 
            AND MONTH(createdAt) = MONTH(NOW())
        `, { replacements: [userId] });

        const currentPosts = postCount[0].count;
        
        // FREE package có giới hạn 3 bài/tháng
        if (userPackage.is_free && currentPosts >= 3) {
          return res.status(403).json({
            success: false,
            message: 'Bạn đã đạt giới hạn 3 bài đăng/tháng của gói miễn phí',
            data: {
              current_posts: currentPosts,
              max_posts: 3,
              current_package: userPackage.package_name
            },
            upgrade_suggestion: 'Nâng cấp lên gói PRO để đăng tối đa 20 bài/tháng'
          });
        }

        // PRO package có giới hạn 20 bài/tháng
        if (userPackage.package_name === 'PRO' && currentPosts >= 20) {
          return res.status(403).json({
            success: false,
            message: 'Bạn đã đạt giới hạn 20 bài đăng/tháng của gói PRO',
            data: {
              current_posts: currentPosts,
              max_posts: 20,
              current_package: userPackage.package_name
            },
            upgrade_suggestion: 'Nâng cấp lên gói PREMIUM để đăng không giới hạn'
          });
        }

        // PREMIUM không có giới hạn
        req.userPackage = userPackage;
        req.postStats = {
          current_posts: currentPosts,
          max_posts: userPackage.is_free ? 3 : (userPackage.package_name === 'PRO' ? 20 : -1)
        };

        next();

      } catch (error) {
        console.error('❌ Error in post limit check:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra giới hạn đăng bài'
        });
      }
    };
  }

  /**
   * Middleware kiểm tra quyền analytics nâng cao (chỉ PREMIUM)
   */
  static requirePremiumAnalytics() {
    return async (req, res, next) => {
      try {
        const userId = req.user.userId;
        const userPackage = await PackageMiddleware.getUserPackage(userId);

        if (!userPackage) {
          return res.status(500).json({
            success: false,
            message: 'Không thể kiểm tra gói dịch vụ'
          });
        }

        if (userPackage.package_name !== 'PREMIUM') {
          return res.status(403).json({
            success: false,
            message: 'Tính năng analytics nâng cao chỉ khả dụng cho gói PREMIUM',
            required_package: ['PREMIUM'],
            current_package: userPackage.package_name
          });
        }

        req.userPackage = userPackage;
        next();

      } catch (error) {
        console.error('❌ Error in premium analytics check:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra quyền analytics'
        });
      }
    };
  }

  /**
   * Middleware yêu cầu gói PRO hoặc cao hơn
   */
  static requirePackage(requiredPackage = 'PRO') {
    return async (req, res, next) => {
      try {
        const userId = req.user.userId;
        const userPackage = await PackageMiddleware.getUserPackage(userId);

        if (!userPackage) {
          return res.status(500).json({
            success: false,
            message: 'Không thể kiểm tra gói dịch vụ'
          });
        }

        const packageHierarchy = {
          'FREE': 0,
          'PRO': 1,
          'PREMIUM': 2
        };

        const currentLevel = packageHierarchy[userPackage.name] || 0;
        const requiredLevel = packageHierarchy[requiredPackage] || 1;

        if (currentLevel < requiredLevel) {
          const upgradeMessage = requiredPackage === 'PREMIUM' 
            ? 'Nâng cấp lên gói PREMIUM để sử dụng tính năng này'
            : 'Nâng cấp lên gói PRO hoặc PREMIUM để sử dụng tính năng này';

          return res.status(403).json({
            success: false,
            message: upgradeMessage,
            data: {
              current_package: userPackage.name,
              required_package: requiredPackage,
              current_level: currentLevel,
              required_level: requiredLevel
            }
          });
        }

        req.userPackage = userPackage;
        next();

      } catch (error) {
        console.error('❌ Error in package requirement check:', error);
        return res.status(500).json({
          success: false,
          message: 'Lỗi kiểm tra gói dịch vụ'
        });
      }
    };
  }

  /**
   * Middleware yêu cầu gói PRO
   */
  static requirePro() {
    return PackageMiddleware.requirePackage('PRO');
  }

  /**
   * Middleware yêu cầu gói PREMIUM
   */
  static requirePremium() {
    return PackageMiddleware.requirePackage('PREMIUM');
  }

  /**
   * Helper: Sử dụng lượt boost
   */
  static async useBoost(userId) {
    try {
      await sequelize.query(`
        UPDATE user_packages 
        SET boost_used_today = boost_used_today + 1,
            updated_at = NOW()
        WHERE user_id = ? AND status = 'active'
      `, { replacements: [userId] });

      return true;
    } catch (error) {
      console.error('❌ Error using boost:', error);
      return false;
    }
  }

  /**
   * Helper: Kiểm tra và cập nhật package hết hạn
   */
  static async checkAndUpdateExpiredPackage(userId) {
    try {
      const [expiredPackages] = await sequelize.query(`
        SELECT id FROM user_packages 
        WHERE user_id = ? AND status = 'active' AND end_at < NOW()
      `, { replacements: [userId] });

      if (expiredPackages.length > 0) {
        await sequelize.query(`
          UPDATE user_packages 
          SET status = 'expired', updated_at = NOW()
          WHERE user_id = ? AND status = 'active' AND end_at < NOW()
        `, { replacements: [userId] });

        console.log(`⏰ Updated ${expiredPackages.length} expired package(s) for user ${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking expired packages:', error);
      return false;
    }
  }
}

module.exports = PackageMiddleware;
