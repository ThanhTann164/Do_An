const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const PackageMiddleware = require('../middlewares/packageMiddleware');
const { getBoostLimits } = require('../constants/packages');
const AppError = require('../Utils/AppError');
const { isSellerRole, extractRole } = require('../Utils/roleUtils');

const PACKAGE_FORBIDDEN_MESSAGE = 'Bạn không có quyền sử dụng tính năng package';

class BoostController {
  // POST /api/houses/:id/boost - Boost tin đăng
  static async boostHouse(req, res, next) {
    try {
      const userId = req.user.userId;
      const role = extractRole(req.user);
      if (!isSellerRole(role)) {
        return res.status(403).json({
          success: false,
          message: PACKAGE_FORBIDDEN_MESSAGE
        });
      }
      const { id: houseId } = req.params;
      const { duration_hours = 6 } = req.body;

      console.log(`🚀 User ${userId} boosting house ${houseId}`);

      // Kiểm tra house có thuộc về user không
      const [houseResult] = await sequelize.query(`
        SELECT HouseID, OwnerID, Title, Status, last_boosted_at, priority_level
        FROM houses 
        WHERE HouseID = ? AND OwnerID = ? AND Status IN ('available', 'Pending')
      `, { replacements: [houseId, userId] });

      if (houseResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng hoặc bạn không có quyền'
        });
      }

      const house = houseResult[0];

      // Lấy thông tin gói của user
      const userPackage = await PackageMiddleware.getUserPackage(userId, role);
      if (!userPackage) {
        return res.status(500).json({
          success: false,
          message: 'Không thể kiểm tra gói dịch vụ'
        });
      }

      const rules = userPackage.rules;

      // Kiểm tra quyền boost
      if (rules.boost_per_day === 0) {
        return res.status(403).json({
          success: false,
          message: 'Bạn phải nâng cấp gói để sử dụng tính năng boost',
          data: {
            required_packages: ['PRO', 'PREMIUM'],
            current_package: userPackage.package_name,
            feature: 'boost'
          }
        });
      }

      // Kiểm tra số lần boost còn lại trong ngày (trừ PREMIUM unlimited)
      if (rules.boost_per_day > 0 && userPackage.boost_used_today >= rules.boost_per_day) {
        return res.status(429).json({
          success: false,
          message: `Bạn đã hết lượt boost hôm nay (${rules.boost_per_day} lượt)`,
          data: {
            boost_used_today: userPackage.boost_used_today,
            boost_per_day: rules.boost_per_day,
            remaining_boosts: 0,
            package: userPackage.package_name
          }
        });
      }

      // Kiểm tra cooldown (không cho boost liên tục trong 1 giờ)
      const lastBoosted = house.last_boosted_at;
      if (lastBoosted) {
        const hoursSinceLastBoost = (new Date() - new Date(lastBoosted)) / (1000 * 60 * 60);
        if (hoursSinceLastBoost < 1) {
          return res.status(429).json({
            success: false,
            message: 'Vui lòng đợi ít nhất 1 giờ giữa các lần boost',
            data: {
              last_boosted_at: lastBoosted,
              cooldown_remaining_minutes: Math.ceil((1 - hoursSinceLastBoost) * 60)
            }
          });
        }
      }

      // Thực hiện boost
      const boostEndTime = new Date();
      boostEndTime.setHours(boostEndTime.getHours() + duration_hours);

      // Update house với priority cao hơn
      const newPriority = Math.max(house.priority_level || 0, rules.priority + 10); // Boost tăng priority
      
      await sequelize.query(`
        UPDATE houses 
        SET 
          last_boosted_at = NOW(),
          priority_level = ?,
          UpdatedAt = NOW()
        WHERE HouseID = ?
      `, { replacements: [newPriority, houseId] });

      // Sử dụng lượt boost (chỉ khi không unlimited)
      if (rules.boost_per_day > 0) {
        await sequelize.query(`
          UPDATE user_packages 
          SET boost_used_today = boost_used_today + 1,
              updated_at = NOW()
          WHERE user_id = ? AND status = 'active'
        `, { replacements: [userId] });
      }

      // Track analytics
      await sequelize.query(`
        INSERT INTO post_analytics (house_id, event_type, user_id, metadata, created_at)
        VALUES (?, 'boost', ?, ?, NOW())
      `, { 
        replacements: [
          houseId, 
          userId, 
          JSON.stringify({
            duration_hours: duration_hours,
            package_used: userPackage.package_name,
            boost_end_time: boostEndTime,
            priority_boost: newPriority
          })
        ] 
      }).catch(() => {
        // Ignore analytics error, don't fail the boost
        console.log('📊 Analytics tracking failed (non-critical)');
      });

      console.log(`✅ House ${houseId} boosted successfully by user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Boost tin đăng thành công!',
        data: {
          house_id: houseId,
          boost_duration_hours: duration_hours,
          boost_end_time: boostEndTime,
          new_priority: newPriority,
          package_used: userPackage.package_name,
          remaining_boosts: rules.boost_per_day > 0 ? 
            Math.max(0, rules.boost_per_day - (userPackage.boost_used_today + 1)) : -1
        }
      });

    } catch (error) {
      console.error('❌ Error boosting house:', error);
      next(new AppError('Lỗi khi boost tin đăng', 500));
    }
  }

  // GET /api/my-boosts - Lấy lịch sử boost
  static async getMyBoosts(req, res, next) {
    try {
      const userId = req.user.userId;
      const role = extractRole(req.user);
      if (!isSellerRole(role)) {
        return res.status(403).json({
          success: false,
          message: PACKAGE_FORBIDDEN_MESSAGE
        });
      }
      const { page = 1, limit = 10 } = req.query;

      console.log(`📊 Getting boost history for user ${userId}`);

      const offset = (page - 1) * limit;

      const [boosts] = await sequelize.query(`
        SELECT 
          pa.id,
          pa.house_id,
          pa.created_at as boosted_at,
          pa.metadata,
          h.Title as house_title,
          h.Price as house_price,
          h.Address as house_address
        FROM post_analytics pa
        JOIN houses h ON pa.house_id = h.HouseID
        WHERE pa.user_id = ? AND pa.event_type = 'boost'
        ORDER BY pa.created_at DESC
        LIMIT ? OFFSET ?
      `, { replacements: [userId, parseInt(limit), offset] });

      const [countResult] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM post_analytics pa
        WHERE pa.user_id = ? AND pa.event_type = 'boost'
      `, { replacements: [userId] });

      const total = countResult[0]?.total || 0;

      res.status(200).json({
        success: true,
        message: 'Lấy lịch sử boost thành công',
        data: {
          boosts: boosts.map(boost => ({
            id: boost.id,
            house_id: boost.house_id,
            house_title: boost.house_title,
            house_price: boost.house_price,
            house_address: boost.house_address,
            boosted_at: boost.boosted_at,
            metadata: boost.metadata ? JSON.parse(boost.metadata) : {}
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting boost history:', error);
      next(new AppError('Lỗi khi lấy lịch sử boost', 500));
    }
  }
}

module.exports = BoostController;