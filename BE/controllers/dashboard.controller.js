const AppError = require('../Utils/AppError');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const { houses, users, houseviewings, iotdevices, notifications } = initModels(sequelize);

class DashboardController {
  /**
   * Lấy thống kê tổng quan cho Seller Dashboard
   * GET /api/dashboard/stats
   */
  static async getStats(req, res, next) {
    try {
      const userId = req.user.userId;
      console.log(`📊 Getting dashboard stats for seller ${userId}`);

      // Lấy thống kê bài đăng
      const totalPosts = await houses.count({
        where: { OwnerID: userId }
      });

      const approvedPosts = await houses.count({
        where: { 
          OwnerID: userId,
          Status: 'approved'
        }
      });

      const pendingPosts = await houses.count({
        where: { 
          OwnerID: userId,
          Status: 'pending'
        }
      });

      const rejectedPosts = await houses.count({
        where: { 
          OwnerID: userId,
          Status: 'rejected'
        }
      });

      // Lấy lượt xem 7 ngày qua (mock data vì chưa có bảng views)
      const last7DaysViews = [
        { date: '2024-11-20', views: 45 },
        { date: '2024-11-21', views: 52 },
        { date: '2024-11-22', views: 38 },
        { date: '2024-11-23', views: 67 },
        { date: '2024-11-24', views: 73 },
        { date: '2024-11-25', views: 89 },
        { date: '2024-11-26', views: 95 }
      ];

      const totalViews7Days = last7DaysViews.reduce((sum, day) => sum + day.views, 0);

      // Lấy thông tin gói dịch vụ hiện tại
      let currentPackage = {
        name: 'Free',
        displayName: 'Gói Miễn Phí',
        type: 'FREE',
        expiryDate: null,
        daysLeft: null,
        features: ['Đăng tin cơ bản', 'Tìm kiếm bất động sản']
      };

      try {
        // Thử lấy gói từ database (nếu có)
        const userPackageQuery = `
          SELECT p.*, up.expires_at, up.status 
          FROM userpackages up 
          JOIN packages p ON up.package_id = p.id 
          WHERE up.user_id = ? AND up.status = 'active' 
          ORDER BY up.created_at DESC 
          LIMIT 1
        `;
        
        const [packageResults] = await sequelize.query(userPackageQuery, {
          replacements: [userId],
          type: sequelize.QueryTypes.SELECT
        });

        if (packageResults) {
          const expiryDate = new Date(packageResults.expires_at);
          const now = new Date();
          const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

          currentPackage = {
            name: packageResults.name,
            displayName: packageResults.display_name || packageResults.name,
            type: packageResults.type,
            expiryDate: packageResults.expires_at,
            daysLeft: daysLeft > 0 ? daysLeft : 0,
            features: JSON.parse(packageResults.features || '[]')
          };
        }
      } catch (packageError) {
        console.log('Package info not available, using default');
      }

      // Lấy số lượng thông báo chưa đọc
      let unreadNotifications = 0;
      try {
        unreadNotifications = await notifications.count({
          where: {
            UserID: userId,
            IsRead: false
          }
        });
      } catch (notifError) {
        console.log('Notifications not available');
      }

      // Lấy số lượt xem hôm nay
      const todayViews = last7DaysViews[last7DaysViews.length - 1].views;

      // Lấy số tin nhắn chưa đọc (mock)
      const unreadMessages = Math.floor(Math.random() * 5);

      // Thống kê doanh thu (mock)
      const revenue = {
        thisMonth: 15750000,
        lastMonth: 12300000,
        growth: 28.1
      };

      res.status(200).json({
        success: true,
        message: 'Lấy thống kê dashboard thành công',
        data: {
          posts: {
            total: totalPosts,
            approved: approvedPosts,
            pending: pendingPosts,
            rejected: rejectedPosts
          },
          views: {
            today: todayViews,
            last7Days: totalViews7Days,
            chartData: last7DaysViews
          },
          currentPackage,
          notifications: {
            unread: unreadNotifications
          },
          messages: {
            unread: unreadMessages
          },
          revenue,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error);
      next(new AppError('Lỗi khi lấy thống kê dashboard', 500));
    }
  }

  /**
   * Lấy trạng thái IoT devices
   * GET /api/dashboard/iot-status
   */
  static async getIoTStatus(req, res, next) {
    try {
      const userId = req.user.userId;
      console.log(`🏠 Getting IoT status for user ${userId}`);

      // Lấy devices của user
      let userDevices = [];
      try {
        userDevices = await iotdevices.findAll({
          where: { UserID: userId },
          attributes: ['DeviceID', 'DeviceName', 'DeviceType', 'Status', 'Location']
        });
      } catch (deviceError) {
        console.log('IoT devices not available, using mock data');
      }

      // Mock IoT data với giá trị thực tế
      const iotStatus = {
        temperature: {
          value: Math.round((Math.random() * 15 + 20) * 10) / 10, // 20-35°C
          unit: '°C',
          status: 'normal', // normal, warning, danger
          location: 'Phòng khách',
          lastUpdate: new Date().toISOString(),
          threshold: { min: 18, max: 32 }
        },
        humidity: {
          value: Math.round((Math.random() * 30 + 40) * 10) / 10, // 40-70%
          unit: '%',
          status: 'normal',
          location: 'Phòng khách',
          lastUpdate: new Date().toISOString(),
          threshold: { min: 30, max: 80 }
        },
        gas: {
          value: Math.round(Math.random() * 0.05 * 1000) / 1000, // 0-0.05 ppm
          unit: 'ppm',
          status: 'normal',
          location: 'Bếp',
          lastUpdate: new Date().toISOString(),
          threshold: { max: 0.1 }
        },
        light: {
          value: Math.round(Math.random() * 800 + 200), // 200-1000 lux
          unit: 'lux',
          status: 'normal',
          location: 'Phòng khách',
          lastUpdate: new Date().toISOString(),
          threshold: { min: 100, max: 1200 }
        },
        motion: {
          detected: Math.random() > 0.8, // 20% chance có chuyển động
          location: 'Cửa chính',
          lastDetected: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Trong 1h qua
          status: 'normal'
        },
        door: {
          isOpen: Math.random() > 0.7, // 30% chance cửa mở
          location: 'Cửa chính',
          lastChanged: new Date(Date.now() - Math.random() * 1800000).toISOString(), // Trong 30p qua
          status: 'normal'
        },
        rain: {
          detected: Math.random() > 0.8, // 20% chance có mưa
          intensity: Math.round(Math.random() * 5 * 10) / 10, // 0-5mm
          unit: 'mm',
          location: 'Ban công',
          lastUpdate: new Date().toISOString(),
          status: 'normal'
        },
        security: {
          armed: true,
          cameras: {
            total: 4,
            online: 4,
            recording: 2
          },
          lastEvent: {
            type: 'motion_detected',
            location: 'Sân trước',
            time: new Date(Date.now() - Math.random() * 7200000).toISOString()
          },
          status: 'normal'
        }
      };

      // Xác định trạng thái tổng thể
      const overallStatus = this.calculateOverallStatus(iotStatus);

      res.status(200).json({
        success: true,
        message: 'Lấy trạng thái IoT thành công',
        data: {
          devices: userDevices,
          sensors: iotStatus,
          overallStatus,
          lastUpdated: new Date().toISOString(),
          connectedDevices: userDevices.length || 8,
          onlineDevices: userDevices.filter(d => d.Status === 'online').length || 7
        }
      });

    } catch (error) {
      console.error('❌ Error getting IoT status:', error);
      next(new AppError('Lỗi khi lấy trạng thái IoT', 500));
    }
  }

  /**
   * Lấy danh sách bài đăng của seller
   * GET /api/dashboard/my-posts
   */
  static async getMyPosts(req, res, next) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10, status, search } = req.query;

      console.log(`📝 Getting posts for seller ${userId}`);

      const where = { OwnerID: userId };
      if (status) where.Status = status;
      if (search) {
        where[sequelize.Sequelize.Op.or] = [
          { Title: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
          { Description: { [sequelize.Sequelize.Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const result = await houses.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'HouseID', 'Title', 'Price', 'Status', 'Location', 
          'createdAt', 'updatedAt', 'Area', 'Bedrooms', 'Bathrooms'
        ]
      });

      // Thêm mock data cho views và stats
      const postsWithStats = result.rows.map(post => ({
        ...post.toJSON(),
        views: Math.floor(Math.random() * 200 + 50),
        contacts: Math.floor(Math.random() * 15 + 2),
        favorites: Math.floor(Math.random() * 25 + 5),
        boost: {
          isActive: Math.random() > 0.7,
          expiresAt: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        }
      }));

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách bài đăng thành công',
        data: {
          posts: postsWithStats,
          pagination: {
            total: result.count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(result.count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting posts:', error);
      next(new AppError('Lỗi khi lấy danh sách bài đăng', 500));
    }
  }

  /**
   * Lấy thống kê chi tiết của một bài đăng
   * GET /api/dashboard/post-stats/:id
   */
  static async getPostStats(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      console.log(`📈 Getting stats for post ${id}`);

      // Kiểm tra quyền sở hữu bài đăng
      const post = await houses.findOne({
        where: { 
          HouseID: id,
          OwnerID: userId 
        }
      });

      if (!post) {
        return next(new AppError('Không tìm thấy bài đăng hoặc bạn không có quyền truy cập', 404));
      }

      // Mock data thống kê chi tiết
      const stats = {
        views: {
          total: Math.floor(Math.random() * 500 + 100),
          today: Math.floor(Math.random() * 50 + 10),
          yesterday: Math.floor(Math.random() * 45 + 8),
          last7Days: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 40 + 10)
          })).reverse()
        },
        contacts: {
          total: Math.floor(Math.random() * 25 + 5),
          phone: Math.floor(Math.random() * 15 + 3),
          email: Math.floor(Math.random() * 10 + 2),
          chat: Math.floor(Math.random() * 8 + 1)
        },
        favorites: Math.floor(Math.random() * 35 + 8),
        shares: Math.floor(Math.random() * 12 + 2),
        conversionRate: Math.round((Math.random() * 5 + 2) * 100) / 100, // 2-7%
        avgTimeOnPage: Math.floor(Math.random() * 180 + 60), // 1-4 phút
        bounceRate: Math.round((Math.random() * 30 + 20) * 100) / 100, // 20-50%
        topSources: [
          { source: 'Google Search', percentage: 45.2 },
          { source: 'Facebook', percentage: 28.7 },
          { source: 'Direct', percentage: 15.3 },
          { source: 'Zalo', percentage: 10.8 }
        ],
        hourlyViews: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          views: Math.floor(Math.random() * 20 + (hour >= 8 && hour <= 22 ? 10 : 2))
        }))
      };

      res.status(200).json({
        success: true,
        message: 'Lấy thống kê bài đăng thành công',
        data: {
          post: {
            id: post.HouseID,
            title: post.Title,
            price: post.Price,
            status: post.Status
          },
          stats,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error getting post stats:', error);
      next(new AppError('Lỗi khi lấy thống kê bài đăng', 500));
    }
  }

  /**
   * Tính toán trạng thái tổng thể của hệ thống IoT
   */
  static calculateOverallStatus(iotStatus) {
    let warningCount = 0;
    let dangerCount = 0;

    // Kiểm tra từng sensor
    Object.values(iotStatus).forEach(sensor => {
      if (sensor.status === 'warning') warningCount++;
      if (sensor.status === 'danger') dangerCount++;
    });

    if (dangerCount > 0) return 'danger';
    if (warningCount > 0) return 'warning';
    return 'normal';
  }
}

module.exports = DashboardController;
