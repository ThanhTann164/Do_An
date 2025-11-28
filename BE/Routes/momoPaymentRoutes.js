const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Simplified MoMo routes without full service dependency
router.post('/create', authMiddleware, async (req, res) => {
  try {
    console.log('📦 [MoMo CREATE] Payment request received');
    console.log('📥 Request body:', req.body);
    
    // For now, return a mock response
    res.json({
      success: false,
      message: 'MoMo service chưa được cấu hình đầy đủ',
      details: 'Vui lòng liên hệ admin để kích hoạt thanh toán MoMo'
    });
  } catch (error) {
    console.error('❌ [MoMo CREATE] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo yêu cầu thanh toán',
      details: error.message
    });
  }
});

router.post('/ipn', async (req, res) => {
  try {
    console.log('📞 [MoMo IPN] Callback received');
    console.log('📥 IPN Request body:', req.body);
    
    res.json({
      resultCode: 0,
      message: 'Confirm Success'
    });
  } catch (error) {
    console.error('❌ [MoMo IPN] Error:', error);
    res.status(200).json({
      resultCode: -1,
      message: 'Internal server error'
    });
  }
});

router.get('/return', async (req, res) => {
  try {
    console.log('🔄 [MoMo RETURN] User redirected from MoMo');
    console.log('📥 Query params:', req.query);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/package/payment/result?status=demo`);
  } catch (error) {
    console.error('❌ [MoMo RETURN] Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/package/payment/result?error=internal_error`);
  }
});

module.exports = router;


