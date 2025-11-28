const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { houses, postanalytics, userpackages, packages } = require('../models/init-models')(sequelize);
const AppError = require('../Utils/AppError');

class AnalyticsController {
  // POST /api/houses/:id/view - Track view
  static async trackView(req, res, next) {
    try {
      const { id: houseId } = req.params;
      const userId = req.user?.userId || null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer');

      console.log(`👁️ Tracking view for house ${houseId}`);

      // Kiểm tra house có tồn tại không
      const house = await houses.findOne({
        where: {
          HouseID: houseId,
          Status: 'available'
        }
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      // Kiểm tra xem user đã xem trong 1 giờ qua chưa (tránh spam)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const recentView = await postanalytics.findOne({
        where: {
          house_id: houseId,
          event_type: 'view',
          ...(userId ? { user_id: userId } : { ip_address: ipAddress }),
          created_at: {
            [require('sequelize').Op.gte]: oneHourAgo
          }
        }
      });

      if (recentView) {
        return res.status(200).json({
          success: true,
          message: 'View đã được ghi nhận trước đó',
          data: { duplicate: true }
        });
      }

      // Track view
      await postanalytics.create({
        house_id: houseId,
        event_type: 'view',
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        metadata: {
          timestamp: new Date(),
          session_id: req.sessionID || null
        }
      });

      // Increment view count
      await houses.increment('views_count', {
        where: { HouseID: houseId }
      });

      console.log(`✅ View tracked for house ${houseId}`);

      res.status(200).json({
        success: true,
        message: 'Ghi nhận lượt xem thành công',
        data: {
          house_id: houseId,
          viewed_at: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Error tracking view:', error);
      next(new AppError('Lỗi khi ghi nhận lượt xem', 500));
    }
  }

  // POST /api/houses/:id/contact - Track contact
  static async trackContact(req, res, next) {
    try {
      const { id: houseId } = req.params;
      const userId = req.user?.userId || null;
      const { contact_method = 'phone', message = null } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      console.log(`📞 Tracking contact for house ${houseId}`);

      // Kiểm tra house có tồn tại không
      const house = await houses.findOne({
        where: {
          HouseID: houseId,
          Status: 'available'
        }
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng'
        });
      }

      // Track contact
      await postanalytics.create({
        house_id: houseId,
        event_type: 'contact',
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          contact_method: contact_method,
          message: message,
          timestamp: new Date()
        }
      });

      // Increment contact count
      await houses.increment('contact_count', {
        where: { HouseID: houseId }
      });

      console.log(`✅ Contact tracked for house ${houseId}`);

      res.status(200).json({
        success: true,
        message: 'Ghi nhận liên hệ thành công',
        data: {
          house_id: houseId,
          contact_method: contact_method,
          contacted_at: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Error tracking contact:', error);
      next(new AppError('Lỗi khi ghi nhận liên hệ', 500));
    }
  }

  // GET /api/houses/:id/stats - Lấy thống kê của 1 tin đăng
  static async getHouseStats(req, res, next) {
    try {
      const { id: houseId } = req.params;
      const userId = req.user.userId;
      const { days = 30 } = req.query;

      console.log(`📊 Getting stats for house ${houseId}`);

      // Kiểm tra quyền xem thống kê
      const house = await houses.findOne({
        where: {
          HouseID: houseId,
          OwnerID: userId
        }
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng hoặc bạn không có quyền'
        });
      }

      // Kiểm tra gói có quyền xem thống kê không
      const currentPackage = await userpackages.findOne({
        where: {
          user_id: userId,
          status: 'active'
        },
        include: [{
          model: packages,
          as: 'Package'
        }]
      });

      const hasStatsPermission = currentPackage && 
        currentPackage.isActive() && 
        (currentPackage.Package.name === 'pro' || currentPackage.Package.name === 'premium');

      if (!hasStatsPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bạn cần gói PRO hoặc PREMIUM để xem thống kê chi tiết',
          data: {
            basic_stats: {
              views_count: house.views_count,
              contact_count: house.contact_count
            }
          }
        });
      }

      // Lấy thống kê chi tiết
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(days));

      const detailedStats = await postanalytics.findAll({
        where: {
          house_id: houseId,
          created_at: {
            [require('sequelize').Op.gte]: dateFrom
          }
        },
        attributes: [
          'event_type',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
          [require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'date']
        ],
        group: ['event_type', require('sequelize').fn('DATE', require('sequelize').col('created_at'))],
        order: [[require('sequelize').fn('DATE', require('sequelize').col('created_at')), 'DESC']],
        raw: true
      });

      // Tổng hợp dữ liệu
      const statsByDate = {};
      const totalStats = { views: 0, contacts: 0 };

      detailedStats.forEach(stat => {
        const date = stat.date;
        if (!statsByDate[date]) {
          statsByDate[date] = { views: 0, contacts: 0 };
        }
        
        if (stat.event_type === 'view') {
          statsByDate[date].views = parseInt(stat.count);
          totalStats.views += parseInt(stat.count);
        } else if (stat.event_type === 'contact') {
          statsByDate[date].contacts = parseInt(stat.count);
          totalStats.contacts += parseInt(stat.count);
        }
      });

      res.status(200).json({
        success: true,
        message: 'Lấy thống kê tin đăng thành công',
        data: {
          house_id: houseId,
          house_title: house.Title,
          period_days: parseInt(days),
          total_stats: {
            ...totalStats,
            all_time_views: house.views_count,
            all_time_contacts: house.contact_count
          },
          stats_by_date: statsByDate,
          package: currentPackage.Package.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('❌ Error getting house stats:', error);
      next(new AppError('Lỗi khi lấy thống kê tin đăng', 500));
    }
  }

  // GET /api/analytics/my-overview - Tổng quan thống kê của user
  static async getMyOverview(req, res, next) {
    try {
      const userId = req.user.userId;
      const { days = 30 } = req.query;

      console.log(`📊 Getting analytics overview for user ${userId}`);

      // Kiểm tra quyền xem thống kê
      const currentPackage = await userpackages.findOne({
        where: {
          user_id: userId,
          status: 'active'
        },
        include: [{
          model: packages,
          as: 'Package'
        }]
      });

      const hasStatsPermission = currentPackage && 
        currentPackage.isActive() && 
        (currentPackage.Package.name === 'pro' || currentPackage.Package.name === 'premium');

      if (!hasStatsPermission) {
        return res.status(403).json({
          success: false,
          message: 'Bạn cần gói PRO hoặc PREMIUM để xem thống kê',
          data: {
            required_package: ['pro', 'premium'],
            current_package: currentPackage?.Package?.name || 'free'
          }
        });
      }

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(days));

      // Lấy tất cả houses của user
      const userHouses = await houses.findAll({
        where: {
          OwnerID: userId,
          Status: 'available'
        },
        attributes: ['HouseID', 'Title', 'views_count', 'contact_count', 'CreatedAt']
      });

      const houseIds = userHouses.map(h => h.HouseID);

      if (houseIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Chưa có tin đăng nào',
          data: {
            total_houses: 0,
            total_stats: { views: 0, contacts: 0 },
            top_houses: [],
            package: currentPackage.Package.toPublicJSON()
          }
        });
      }

      // Lấy thống kê tổng hợp
      const totalStats = await postanalytics.findAll({
        where: {
          house_id: {
            [require('sequelize').Op.in]: houseIds
          },
          created_at: {
            [require('sequelize').Op.gte]: dateFrom
          }
        },
        attributes: [
          'event_type',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['event_type'],
        raw: true
      });

      const summary = { views: 0, contacts: 0 };
      totalStats.forEach(stat => {
        if (stat.event_type === 'view') summary.views = parseInt(stat.count);
        if (stat.event_type === 'contact') summary.contacts = parseInt(stat.count);
      });

      // Top houses by views
      const topHouses = userHouses
        .sort((a, b) => b.views_count - a.views_count)
        .slice(0, 5)
        .map(house => ({
          house_id: house.HouseID,
          title: house.Title,
          views: house.views_count,
          contacts: house.contact_count,
          created_at: house.CreatedAt
        }));

      res.status(200).json({
        success: true,
        message: 'Lấy tổng quan thống kê thành công',
        data: {
          total_houses: userHouses.length,
          period_days: parseInt(days),
          total_stats: summary,
          all_time_stats: {
            views: userHouses.reduce((sum, h) => sum + h.views_count, 0),
            contacts: userHouses.reduce((sum, h) => sum + h.contact_count, 0)
          },
          top_houses: topHouses,
          package: currentPackage.Package.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('❌ Error getting analytics overview:', error);
      next(new AppError('Lỗi khi lấy tổng quan thống kê', 500));
    }
  }
}

module.exports = AnalyticsController;
