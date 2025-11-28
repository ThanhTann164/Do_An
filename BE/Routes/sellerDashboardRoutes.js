/**
 * Seller Dashboard Routes
 * Định nghĩa các routes cho seller dashboard
 */

const express = require('express');
const router = express.Router();

// Inline controllers để tránh lỗi import
const getDashboardStats = async (req, res) => {
  try {
    // Mock stats data
    const stats = {
      posts: { total: 12, approved: 8, pending: 3, rejected: 1 },
      views: { total: 1250, trend: 15.2 },
      requests: { total: 45, trend: 8.7 },
      revenue: { total: 15750000, trend: 22.1 }
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getChartData = async (req, res) => {
  try {
    // Mock chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      chartData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000000) + 1000000,
        views: Math.floor(Math.random() * 100) + 20
      });
    }
    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopProducts = async (req, res) => {
  try {
    // Mock products data
    const products = [
      {
        id: 1, title: 'Căn hộ 2PN cao cấp tại Quận 1', price: 2500000000,
        location: 'Quận 1, TP.HCM', status: 'approved',
        views: 125, contacts: 8, favorites: 15
      },
      {
        id: 2, title: 'Nhà phố 3 tầng mặt tiền', price: 4200000000,
        location: 'Quận 7, TP.HCM', status: 'pending',
        views: 89, contacts: 5, favorites: 12
      },
      {
        id: 3, title: 'Villa sang trọng view sông', price: 8500000000,
        location: 'Quận 2, TP.HCM', status: 'approved',
        views: 203, contacts: 12, favorites: 28
      }
    ];
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Import middleware
const authJwt = require('../Middlewares/authJwt');

// Dashboard stats
router.get('/dashboard/stats', authJwt, getDashboardStats);
router.get('/dashboard/chart', authJwt, getChartData);

// Products
router.get('/posts/top', authJwt, getTopProducts);

// Requests (orders) - mock data for now
router.get('/requests/recent', authJwt, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Mock requests data
    const requests = [
      {
        id: 1,
        customerName: 'Nguyễn Văn A',
        status: 'pending',
        createdAt: new Date(),
        houseTitle: 'Căn hộ cao cấp Quận 1'
      },
      {
        id: 2,
        customerName: 'Trần Thị B',
        status: 'approved',
        createdAt: new Date(Date.now() - 24*60*60*1000),
        houseTitle: 'Nhà phố Quận 7'
      }
    ];

    res.json({
      success: true,
      data: requests.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Error getting recent requests:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy yêu cầu gần đây',
      error: error.message
    });
  }
});

// Notifications - real data from database
router.get('/notifications/recent', authJwt, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.user.userId;
    
    const getSequelizeInstance = require('../utils/sequelize-instance');
    const sequelize = getSequelizeInstance();
    
    const [notifications] = await sequelize.query(`
      SELECT id, title, message, createdAt, isRead
      FROM notifications 
      WHERE toUserId = ? OR toUserId IS NULL
      ORDER BY createdAt DESC
      LIMIT ?
    `, { replacements: [userId, parseInt(limit)] });

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông báo',
      error: error.message
    });
  }
});

module.exports = router;

