const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/authMiddleware');
const { requireAdminAPI } = require('../middlewares/adminAuth');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { emitNewNotification, broadcastNotification } = require('../Config/websocket');

const NotificationController = {
  // API lấy thông báo của user
  getMyNotifications: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const [notifications] = await sequelize.query(`
        SELECT id, title, message, type, createdAt, isRead, updatedAt
        FROM notifications 
        WHERE receiverId = ? OR receiverId IS NULL
        ORDER BY createdAt DESC
        LIMIT 50
      `, { replacements: [userId] });
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông báo'
      });
    }
  },

  // API đánh dấu đã đọc
  markAsRead: async (req, res) => {
    try {
      const { id } = req.body;
      const userId = req.user.userId;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu ID thông báo'
        });
      }
      
      await sequelize.query(`
        UPDATE notifications 
        SET isRead = TRUE, updatedAt = NOW()
        WHERE id = ? AND (receiverId = ? OR receiverId IS NULL)
      `, { replacements: [id, userId] });
      
      res.json({
        success: true,
        message: 'Đã đánh dấu đã đọc'
      });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật thông báo'
      });
    }
  },

  // API đánh dấu đã đọc theo ID trong URL (cho FE User)
  markAsReadById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu ID thông báo'
        });
      }
      
      await sequelize.query(`
        UPDATE notifications 
        SET isRead = TRUE, updatedAt = NOW()
        WHERE id = ? AND (receiverId = ? OR receiverId IS NULL)
      `, { replacements: [id, userId] });
      
      res.json({
        success: true,
        message: 'Đã đánh dấu đã đọc'
      });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật thông báo'
      });
    }
  },

  // API đánh dấu tất cả đã đọc
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.userId;
      
      await sequelize.query(`
        UPDATE notifications 
        SET isRead = TRUE, updatedAt = NOW()
        WHERE (receiverId = ? OR receiverId IS NULL) AND isRead = FALSE
      `, { replacements: [userId] });
      
      res.json({
        success: true,
        message: 'Đã đánh dấu tất cả thông báo đã đọc'
      });
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật thông báo'
      });
    }
  },

  // API gửi thông báo broadcast (toàn hệ thống)
  broadcastNotification: async (req, res) => {
    try {
      const { title, message, type = 'system', sendTo = 'all' } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ tiêu đề và nội dung'
        });
      }

      if (!['system', 'promotion', 'maintenance'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Loại thông báo không hợp lệ'
        });
      }
      
      // Lấy danh sách tất cả user
      const [users] = await sequelize.query(`
        SELECT UserID FROM users 
        WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
      `);
      
      if (users.length === 0) {
        return res.json({
          success: true,
          message: 'Không có người dùng nào để gửi thông báo',
          sentCount: 0
        });
      }

      // Tạo thông báo cho từng user
      const insertPromises = users.map(user => 
        sequelize.query(`
          INSERT INTO notifications (title, message, type, receiverId, createdAt, isRead, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), FALSE, NOW())
        `, { replacements: [title, message, type, user.UserID] })
      );

      await Promise.all(insertPromises);

      // Gửi thông báo realtime qua WebSocket
      const notificationData = {
        id: Date.now(), // Temporary ID
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      // Broadcast đến tất cả users
      broadcastNotification(notificationData);
      
      res.json({
        success: true,
        message: `Đã gửi thông báo thành công đến ${users.length} người dùng`,
        sentCount: users.length
      });
    } catch (error) {
      console.error('❌ Error broadcasting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi gửi thông báo broadcast'
      });
    }
  },

  // API gửi thông báo cho user cụ thể
  sendNotification: async (req, res) => {
    try {
      const { userId, title, message, type = 'custom' } = req.body;
      
      if (!userId || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin: userId, title, message'
        });
      }

      // Kiểm tra user tồn tại
      const [userExists] = await sequelize.query(`
        SELECT UserID FROM users WHERE UserID = ? AND Status = 'Active'
      `, { replacements: [userId] });

      if (userExists.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      await sequelize.query(`
        INSERT INTO notifications (title, message, type, receiverId, createdAt, isRead, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), FALSE, NOW())
      `, { replacements: [title, message, type, userId] });

      // Gửi thông báo realtime qua WebSocket
      const notificationData = {
        id: Date.now(), // Temporary ID
        title,
        message,
        type,
        receiverId: userId,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      emitNewNotification(userId, notificationData);
      
      res.json({
        success: true,
        message: 'Đã gửi thông báo thành công',
        sentCount: 1
      });
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi gửi thông báo'
      });
    }
  },

  // API lấy danh sách users cho admin
  getUsersList: async (req, res) => {
    try {
      const [users] = await sequelize.query(`
        SELECT UserID as id, FullName as name, Email as email, Role as role
        FROM users 
        WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
        ORDER BY FullName ASC
        LIMIT 100
      `);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('❌ Error getting users list:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách người dùng'
      });
    }
  },

  // API admin lấy tất cả thông báo
  getAllNotifications: async (req, res) => {
    try {
      const [notifications] = await sequelize.query(`
        SELECT 
          n.id,
          n.title,
          n.message,
          n.type,
          n.receiverId,
          n.createdAt,
          n.updatedAt,
          CASE 
            WHEN n.receiverId IS NULL THEN 'all_users'
            ELSE 'specific_user'
          END as target,
          CASE 
            WHEN n.receiverId IS NULL THEN 'Toàn hệ thống'
            ELSE u.FullName
          END as targetName,
          'sent' as status,
          CASE 
            WHEN n.receiverId IS NULL THEN (
              SELECT COUNT(*) FROM users WHERE Role IN ('Buyer', 'Seller') AND IsActive = 1
            )
            ELSE 1
          END as recipientCount
        FROM notifications n
        LEFT JOIN users u ON n.receiverId = u.UserID
        ORDER BY n.createdAt DESC
        LIMIT 100
      `);
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('❌ Error getting all notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách thông báo'
      });
    }
  }
};

// Notification routes
router.get('/my', authMiddleware, NotificationController.getMyNotifications);
router.put('/mark-as-read', authMiddleware, NotificationController.markAsRead);
router.put('/mark-all-read', authMiddleware, NotificationController.markAllAsRead);
router.patch('/read/:id', authMiddleware, NotificationController.markAsReadById);
router.post('/broadcast', requireAdminAPI, NotificationController.broadcastNotification);
router.post('/send', requireAdminAPI, NotificationController.sendNotification);
router.get('/users', requireAdminAPI, NotificationController.getUsersList);
router.get('/admin/all', requireAdminAPI, NotificationController.getAllNotifications);

module.exports = router;
