const express = require('express');
const router = express.Router();
const AIController = require('../controllers/ai.controller');
const authenticateJwt = require('../Middlewares/authJwt');
const PackageMiddleware = require('../Middlewares/packageMiddleware');

/**
 * AI Routes
 * 
 * TASK 3: Security Hardening - All routes now require:
 * 1. Authentication (JWT)
 * 2. Package check (PREMIUM for advanced features, PRO for basic)
 */

// POST /api/ai/generate-description
// Generate property description - PREMIUM only
router.post('/generate-description', 
  authenticateJwt, 
  PackageMiddleware.requirePackage('PREMIUM'),
  async (req, res) => {
    try {
      await AIController.generateDescription(req, res);
    } catch (error) {
      console.error('❌ [Route] Error in generate-description:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// POST /api/ai/analyze-market
// Analyze market - PREMIUM only
router.post('/analyze-market', 
  authenticateJwt, 
  PackageMiddleware.requirePackage('PREMIUM'),
  async (req, res) => {
    try {
      await AIController.analyzeMarket(req, res);
    } catch (error) {
      console.error('❌ [Route] Error in analyze-market:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// POST /api/ai/optimize-title
// Optimize title - PRO or PREMIUM
router.post('/optimize-title', 
  authenticateJwt, 
  PackageMiddleware.requirePackage('PRO'),
  async (req, res) => {
    try {
      await AIController.optimizeTitle(req, res);
    } catch (error) {
      console.error('❌ [Route] Error in optimize-title:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// POST /api/ai/optimize-description
// Optimize description - PRO or PREMIUM
router.post('/optimize-description', 
  authenticateJwt, 
  PackageMiddleware.requirePackage('PRO'),
  async (req, res) => {
    try {
      await AIController.optimizeDescription(req, res);
    } catch (error) {
      console.error('❌ [Route] Error in optimize-description:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
