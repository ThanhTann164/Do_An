const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Mock dashboard controller
const DashboardController = {
  getDashboard: async (req, res) => {
    try {
      const mockDashboard = {
        totalUsers: 1250,
        totalProperties: 450,
        totalViews: 15000,
        totalRevenue: 50000000,
        recentActivities: [
          {
            id: 1,
            type: 'user_register',
            message: 'Người dùng mới đăng ký: Nguyễn Văn A',
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      res.json({
        success: true,
        data: mockDashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy dashboard'
      });
    }
  },

  getStats: async (req, res) => {
    try {
      const mockStats = {
        users: { total: 1250, growth: 5.2 },
        properties: { total: 450, growth: 8.1 },
        views: { total: 15000, growth: 12.3 },
        revenue: { total: 50000000, growth: 15.7 }
      };
      
      res.json({
        success: true,
        data: mockStats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê'
      });
    }
  },

  getAnalytics: async (req, res) => {
    try {
      const mockAnalytics = {
        chartData: [
          { name: 'T1', users: 100, properties: 50 },
          { name: 'T2', users: 120, properties: 60 },
          { name: 'T3', users: 150, properties: 75 }
        ]
      };
      
      res.json({
        success: true,
        data: mockAnalytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy analytics'
      });
    }
  }
};

// Dashboard routes
router.get('/', authMiddleware, DashboardController.getDashboard);
router.get('/stats', authMiddleware, DashboardController.getStats);
router.get('/analytics', authMiddleware, DashboardController.getAnalytics);

module.exports = router;
