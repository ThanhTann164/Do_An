const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Mock staff controller
const StaffController = {
  getDashboard: async (req, res) => {
    try {
      const mockStats = {
        totalUsers: 1250,
        totalProperties: 450,
        todayViewings: 12,
        pendingRequests: 8,
        recentActivities: [
          {
            id: 1,
            type: 'viewing',
            message: 'Lịch xem nhà mới được đặt cho Villa tại Quận 7',
            time: '10 phút trước'
          }
        ]
      };
      
      res.json({
        success: true,
        data: mockStats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy dashboard staff'
      });
    }
  },

  getViewings: async (req, res) => {
    try {
      const mockViewings = [
        {
          id: 1,
          propertyTitle: 'Căn hộ 2PN tại Quận 1',
          buyerName: 'Nguyễn Văn A',
          scheduledDate: '2024-12-01',
          scheduledTime: '14:00',
          status: 'scheduled'
        }
      ];
      
      res.json({
        success: true,
        data: mockViewings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch xem nhà'
      });
    }
  }
};

// Staff routes
router.get('/dashboard', authMiddleware, StaffController.getDashboard);
router.get('/viewings', authMiddleware, StaffController.getViewings);

module.exports = router;
