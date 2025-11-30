const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Get seller statistics
const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // This would be replaced with actual database queries
    // For now, return empty stats structure
    const stats = {
      totalPosts: 0,
      approvedPosts: 0,
      pendingPosts: 0,
      rejectedPosts: 0,
      totalViews: 0,
      totalViewings: 0,
      pendingViewings: 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê seller'
    });
  }
};

// Get seller posts
const getSellerPosts = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;
    
    // This would be replaced with actual database queries
    // For now, return empty array
    const posts = [];

    res.json({
      success: true,
      data: posts,
      total: 0
    });
  } catch (error) {
    console.error('Error fetching seller posts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài đăng'
    });
  }
};

// Routes
router.get('/stats', authMiddleware, getSellerStats);
router.get('/posts', authMiddleware, getSellerPosts);

module.exports = router;



