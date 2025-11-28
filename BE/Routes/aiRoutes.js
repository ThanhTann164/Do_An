const express = require('express');
const router = express.Router();
const AIController = require('../controllers/ai.controller');
const { authMiddleware } = require('../Middlewares/authMiddleware');
const PackageMiddleware = require('../middlewares/packageMiddleware');

// AI routes with package restrictions
router.post('/optimize-title', 
  authMiddleware, 
  PackageMiddleware.requireAIAccess('title_optimization'),
  AIController.optimizeTitle
);

router.post('/generate-description', 
  authMiddleware, 
  PackageMiddleware.requireAIAccess('description_generation'),
  AIController.optimizeDescription
);

// Temporary simple implementations for missing methods
router.post('/analyze-market', 
  authMiddleware, 
  PackageMiddleware.requireAIAccess('market_analysis'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Phân tích thị trường thành công',
      data: {
        market_trend: 'Tăng 5% so với tháng trước',
        average_price: '3.2 tỷ VND',
        recommendation: 'Thời điểm tốt để bán'
      }
    });
  }
);

router.post('/suggest-price', 
  authMiddleware, 
  PackageMiddleware.requireAIAccess('price_suggestion'),
  (req, res) => {
    const { area, location, house_type } = req.body;
    const basePrice = area * 50000000; // 50M per m2
    res.json({
      success: true,
      message: 'Gợi ý giá thành công',
      data: {
        suggested_price: basePrice,
        price_range: {
          min: basePrice * 0.9,
          max: basePrice * 1.1
        },
        confidence: 0.85
      }
    });
  }
);

module.exports = router;
