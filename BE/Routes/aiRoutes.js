const express = require('express');
const router = express.Router();
const AIController = require('../controllers/ai.controller');

/**
 * AI Routes
 * 
 * Note: Authentication middleware is removed for easy testing.
 * Add authentication later when ready for production.
 */

// POST /api/ai/generate-description
// Generate property description using Google Gemini
router.post('/generate-description', async (req, res) => {
  try {
    await AIController.generateDescription(req, res);
  } catch (error) {
    console.error('❌ [Route] Error in generate-description:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/ai/analyze-market
// Analyze market using Google Gemini
router.post('/analyze-market', async (req, res) => {
  try {
    await AIController.analyzeMarket(req, res);
  } catch (error) {
    console.error('❌ [Route] Error in analyze-market:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/ai/optimize-title
// Optimize title using Google Gemini
router.post('/optimize-title', async (req, res) => {
  try {
    await AIController.optimizeTitle(req, res);
  } catch (error) {
    console.error('❌ [Route] Error in optimize-title:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/ai/optimize-description
// Optimize description using Google Gemini
router.post('/optimize-description', async (req, res) => {
  try {
    await AIController.optimizeDescription(req, res);
  } catch (error) {
    console.error('❌ [Route] Error in optimize-description:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
