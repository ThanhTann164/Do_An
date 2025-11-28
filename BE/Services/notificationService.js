const { getIO, emitToUser } = require('../Config/websocket');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const { notifications, users } = initModels(sequelize);

class NotificationService {
  /**
   * Tạo thông báo mới
   * @param {number} userId - ID người dùng
   * @param {string} title - Tiêu đề thông báo
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo (success, warning, alert, error, device, system, security, package, iot)
   * @param {object} options - Các tùy chọn bổ sung
   * @returns {Promise<object>} - Thông báo đã tạo
   */
  static async createNotification(userId, title, message, type = 'system', options = {}) {
    try {
      console.log(`📢 Creating notification for user ${userId}:`, { title, type });

      const notificationData = {
        UserID: userId,
        Title: title,
        Message: message,
        Type: type,
        Priority: options.priority || 'medium',
        Meta: options.meta || null,
        ActionUrl: options.actionUrl || null,
        ExpiresAt: options.expiresAt || null
      };

      // Tạo thông báo trong database
      const notification = await notifications.create(notificationData);

      // Lấy thông tin user để gửi thông báo real-time
      const user = await users.findByPk(userId, {
        attributes: ['UserID', 'FullName', 'Email']
      });

      // Chuẩn bị dữ liệu gửi real-time
      const notificationPayload = {
        id: notification.NotificationID,
        title: notification.Title,
        message: notification.Message,
        type: notification.Type,
        priority: notification.Priority,
        isRead: notification.IsRead,
        meta: notification.Meta,
        actionUrl: notification.ActionUrl,
        createdAt: notification.createdAt,
        user: user ? {
          id: user.UserID,
          name: user.FullName
        } : null
      };

      // Gửi thông báo real-time qua WebSocket
      try {
        emitToUser(userId, 'new_notification', notificationPayload);
        console.log(`✅ Real-time notification sent to user ${userId}`);
      } catch (socketError) {
        console.warn(`⚠️ Could not send real-time notification:`, socketError.message);
      }

      return {
        success: true,
        notification: notificationPayload
      };

    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Tạo thông báo cho nhiều người dùng
   * @param {Array<number>} userIds - Danh sách ID người dùng
   * @param {string} title - Tiêu đề thông báo
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo
   * @param {object} options - Các tùy chọn bổ sung
   */
  static async createBulkNotifications(userIds, title, message, type = 'system', options = {}) {
    try {
      console.log(`📢 Creating bulk notifications for ${userIds.length} users`);

      const notifications = [];
      for (const userId of userIds) {
        const notification = await this.createNotification(userId, title, message, type, options);
        notifications.push(notification);
      }

      return {
        success: true,
        count: notifications.length,
        notifications
      };

    } catch (error) {
      console.error('❌ Error creating bulk notifications:', error);
      throw new Error(`Failed to create bulk notifications: ${error.message}`);
    }
  }

  /**
   * Tạo thông báo IoT
   * @param {number} userId - ID người dùng
   * @param {string} deviceName - Tên thiết bị
   * @param {string} sensorType - Loại cảm biến
   * @param {string} alertMessage - Thông điệp cảnh báo
   * @param {object} sensorData - Dữ liệu cảm biến
   */
  static async createIoTNotification(userId, deviceName, sensorType, alertMessage, sensorData = {}) {
    const title = `🚨 Cảnh báo ${sensorType}`;
    const message = `Thiết bị "${deviceName}": ${alertMessage}`;
    
    const options = {
      priority: this.getIoTPriority(sensorType, sensorData),
      meta: {
        deviceName,
        sensorType,
        sensorData,
        timestamp: new Date().toISOString()
      },
      actionUrl: `/devices/${sensorData.deviceId || 'dashboard'}`
    };

    return await this.createNotification(userId, title, message, 'iot', options);
  }

  /**
   * Tạo thông báo bảo mật
   * @param {number} userId - ID người dùng
   * @param {string} securityEvent - Sự kiện bảo mật
   * @param {object} eventData - Dữ liệu sự kiện
   */
  static async createSecurityNotification(userId, securityEvent, eventData = {}) {
    const title = `🔒 Cảnh báo bảo mật`;
    const message = this.getSecurityMessage(securityEvent, eventData);
    
    const options = {
      priority: 'high',
      meta: {
        securityEvent,
        eventData,
        timestamp: new Date().toISOString()
      },
      actionUrl: '/security/logs'
    };

    return await this.createNotification(userId, title, message, 'security', options);
  }

  /**
   * Tạo thông báo gói dịch vụ
   * @param {number} userId - ID người dùng
   * @param {string} packageEvent - Sự kiện gói (upgrade, expire, payment_failed)
   * @param {object} packageData - Dữ liệu gói
   */
  static async createPackageNotification(userId, packageEvent, packageData = {}) {
    const { title, message, priority } = this.getPackageMessage(packageEvent, packageData);
    
    const options = {
      priority,
      meta: {
        packageEvent,
        packageData,
        timestamp: new Date().toISOString()
      },
      actionUrl: '/packages'
    };

    return await this.createNotification(userId, title, message, 'package', options);
  }

  /**
   * Xác định mức độ ưu tiên cho thông báo IoT
   */
  static getIoTPriority(sensorType, sensorData) {
    const highPrioritySensors = ['gas', 'fire', 'security', 'motion'];
    const urgentConditions = {
      temperature: (value) => value > 40 || value < 0,
      humidity: (value) => value > 90,
      gas: (value) => value > 0.1,
      light: (value) => value > 1000
    };

    if (highPrioritySensors.includes(sensorType.toLowerCase())) {
      return 'urgent';
    }

    if (urgentConditions[sensorType] && urgentConditions[sensorType](sensorData.value)) {
      return 'urgent';
    }

    return 'high';
  }

  /**
   * Tạo thông điệp bảo mật
   */
  static getSecurityMessage(securityEvent, eventData) {
    const messages = {
      'login_suspicious': `Đăng nhập từ thiết bị lạ: ${eventData.device || 'Unknown'}`,
      'motion_detected': `Phát hiện chuyển động tại ${eventData.location || 'khu vực giám sát'}`,
      'door_opened': `Cửa ${eventData.doorName || 'chính'} đã được mở lúc ${new Date().toLocaleTimeString()}`,
      'camera_motion': `Camera phát hiện chuyển động tại ${eventData.cameraLocation || 'khu vực giám sát'}`,
      'unauthorized_access': `Phát hiện truy cập trái phép vào ${eventData.resource || 'hệ thống'}`
    };

    return messages[securityEvent] || `Sự kiện bảo mật: ${securityEvent}`;
  }

  /**
   * Tạo thông điệp gói dịch vụ
   */
  static getPackageMessage(packageEvent, packageData) {
    const messages = {
      'upgrade_success': {
        title: '🎉 Nâng cấp thành công',
        message: `Bạn đã nâng cấp lên gói ${packageData.packageName || 'Premium'} thành công!`,
        priority: 'medium'
      },
      'expire_warning': {
        title: '⏰ Gói sắp hết hạn',
        message: `Gói ${packageData.packageName || 'Premium'} của bạn sẽ hết hạn trong ${packageData.daysLeft || 7} ngày`,
        priority: 'high'
      },
      'expired': {
        title: '❌ Gói đã hết hạn',
        message: `Gói ${packageData.packageName || 'Premium'} của bạn đã hết hạn. Hãy gia hạn để tiếp tục sử dụng.`,
        priority: 'high'
      },
      'payment_failed': {
        title: '💳 Thanh toán thất bại',
        message: `Không thể thanh toán cho gói ${packageData.packageName || 'Premium'}. Vui lòng kiểm tra thông tin thanh toán.`,
        priority: 'high'
      }
    };

    return messages[packageEvent] || {
      title: '📦 Thông báo gói dịch vụ',
      message: `Sự kiện gói: ${packageEvent}`,
      priority: 'medium'
    };
  }

  /**
   * Lấy danh sách thông báo của user
   * @param {number} userId - ID người dùng
   * @param {object} options - Tùy chọn phân trang và lọc
   */
  static async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type = null,
        isRead = null,
        priority = null
      } = options;

      const where = { UserID: userId };
      
      if (type) where.Type = type;
      if (isRead !== null) where.IsRead = isRead;
      if (priority) where.Priority = priority;

      const offset = (page - 1) * limit;

      const result = await notifications.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        success: true,
        notifications: result.rows,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.count / limit)
        }
      };

    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   * @param {number} userId - ID người dùng
   * @param {number|Array} notificationIds - ID thông báo hoặc mảng ID
   */
  static async markAsRead(userId, notificationIds) {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      const [updatedCount] = await notifications.update(
        { 
          IsRead: true,
          ReadAt: new Date()
        },
        {
          where: {
            NotificationID: ids,
            UserID: userId
          }
        }
      );

      // Gửi update real-time
      emitToUser(userId, 'notifications_read', { notificationIds: ids });

      return {
        success: true,
        updatedCount
      };

    } catch (error) {
      console.error('❌ Error marking notifications as read:', error);
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  }

  /**
   * Đếm số thông báo chưa đọc
   * @param {number} userId - ID người dùng
   */
  static async getUnreadCount(userId) {
    try {
      const count = await notifications.count({
        where: {
          UserID: userId,
          IsRead: false
        }
      });

      return {
        success: true,
        unreadCount: count
      };

    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  /**
   * Xóa thông báo cũ (cleanup job)
   * @param {number} daysOld - Số ngày cũ để xóa
   */
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deletedCount = await notifications.destroy({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.lt]: cutoffDate
          },
          IsRead: true
        }
      });

      console.log(`🧹 Cleaned up ${deletedCount} old notifications`);
      return { success: true, deletedCount };

    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
      throw new Error(`Failed to cleanup notifications: ${error.message}`);
    }
  }
}

module.exports = NotificationService;
