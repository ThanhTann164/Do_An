const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/authMiddleware');
const { requireAdminAPI } = require('../middlewares/adminAuth');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

// Only enable in development or for admin users
const isDev = process.env.NODE_ENV !== 'production';

// POST /api/dev/assign-package - Assign package to user (Dev/Admin only)
router.post('/assign-package', authMiddleware, async (req, res) => {
  try {
    // Only allow in dev environment or for admin users
    if (!isDev && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint này chỉ khả dụng trong môi trường development hoặc cho Admin'
      });
    }

    const { email, package: packageName, days = 30 } = req.body;

    if (!email || !packageName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và package'
      });
    }

    // Validate package
    const validPackages = ['FREE', 'PRO', 'PREMIUM'];
    if (!validPackages.includes(packageName)) {
      return res.status(400).json({
        success: false,
        message: 'Package không hợp lệ. Chỉ chấp nhận: ' + validPackages.join(', ')
      });
    }

    // Find user
    const [user] = await sequelize.query(`
      SELECT UserID FROM users WHERE Email = ?
    `, { replacements: [email] });

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user với email này'
      });
    }

    const userId = user[0].UserID;

    if (packageName === 'FREE') {
      // Cancel all active packages to revert to FREE
      await sequelize.query(`
        UPDATE user_packages 
        SET status = 'cancelled', updated_at = NOW()
        WHERE user_id = ? AND status = 'active'
      `, { replacements: [userId] });

      return res.json({
        success: true,
        message: `User ${email} đã được chuyển về gói FREE`,
        data: {
          user_id: userId,
          email: email,
          package: 'FREE',
          expires_at: null
        }
      });
    }

    // Find package
    const [packageResult] = await sequelize.query(`
      SELECT id, name, display_name, price FROM packages WHERE name = ?
    `, { replacements: [packageName] });

    if (packageResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy package'
      });
    }

    const packageInfo = packageResult[0];

    // Cancel existing active packages
    await sequelize.query(`
      UPDATE user_packages 
      SET status = 'cancelled', updated_at = NOW()
      WHERE user_id = ? AND status = 'active'
    `, { replacements: [userId] });

    // Create new user package
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(days));

    await sequelize.query(`
      INSERT INTO user_packages (
        user_id, package_id, start_at, end_at, status, purchase_price,
        payment_method, transaction_id, boost_used_today, last_boost_reset,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'active', ?, 'dev_assign', ?, 0, CURDATE(), NOW(), NOW())
    `, {
      replacements: [
        userId,
        packageInfo.id,
        startDate,
        endDate,
        packageInfo.price,
        `DEV_${Date.now()}_${userId}`
      ]
    });

    res.json({
      success: true,
      message: `User ${email} đã được gán gói ${packageName} thành công`,
      data: {
        user_id: userId,
        email: email,
        package: packageName,
        package_display: packageInfo.display_name,
        expires_at: endDate,
        duration_days: days
      }
    });

  } catch (error) {
    console.error('❌ Error assigning package:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gán package'
    });
  }
});

// GET /api/dev/user-package/:email - Get user package info
router.get('/user-package/:email', authMiddleware, async (req, res) => {
  try {
    if (!isDev && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint này chỉ khả dụng trong môi trường development hoặc cho Admin'
      });
    }

    const { email } = req.params;

    const [result] = await sequelize.query(`
      SELECT 
        u.UserID, u.FullName, u.Email, u.Role,
        p.name as package_name, p.display_name as package_display,
        up.status, up.start_at, up.end_at, up.boost_used_today,
        p.ai_tools, p.boost_per_day, p.features
      FROM users u
      LEFT JOIN user_packages up ON u.UserID = up.user_id AND up.status = 'active'
      LEFT JOIN packages p ON up.package_id = p.id
      WHERE u.Email = ?
    `, { replacements: [email] });

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    const userInfo = result[0];

    res.json({
      success: true,
      data: {
        user: {
          id: userInfo.UserID,
          name: userInfo.FullName,
          email: userInfo.Email,
          role: userInfo.Role
        },
        package: {
          name: userInfo.package_name || 'FREE',
          display_name: userInfo.package_display || 'Gói Miễn Phí',
          status: userInfo.status || 'free',
          start_at: userInfo.start_at,
          end_at: userInfo.end_at,
          boost_used_today: userInfo.boost_used_today || 0,
          ai_tools: userInfo.ai_tools || [],
          boost_per_day: userInfo.boost_per_day || 0,
          features: userInfo.features || []
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting user package:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin package'
    });
  }
});

// POST /api/dev/reset-boost/:email - Reset boost count for user
router.post('/reset-boost/:email', authMiddleware, async (req, res) => {
  try {
    if (!isDev && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint này chỉ khả dụng trong môi trường development hoặc cho Admin'
      });
    }

    const { email } = req.params;

    const [user] = await sequelize.query(`
      SELECT UserID FROM users WHERE Email = ?
    `, { replacements: [email] });

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    const userId = user[0].UserID;

    await sequelize.query(`
      UPDATE user_packages 
      SET boost_used_today = 0, last_boost_reset = CURDATE(), updated_at = NOW()
      WHERE user_id = ? AND status = 'active'
    `, { replacements: [userId] });

    res.json({
      success: true,
      message: `Đã reset boost count cho user ${email}`
    });

  } catch (error) {
    console.error('❌ Error resetting boost:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi reset boost'
    });
  }
});

module.exports = router;



