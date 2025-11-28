const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/package.controller');
const AIController = require('../controllers/ai.controller');
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Package routes - Đặt routes cụ thể trước route :id
router.get('/', PackageController.getAllPackages);
router.get('/my-package', authMiddleware, PackageController.getMyPackage);
router.post('/purchase', authMiddleware, PackageController.purchasePackage);
router.get('/history', authMiddleware, PackageController.getPackageHistory);
router.get('/:id', PackageController.getPackageById); // Phải đặt cuối cùng

// AI routes
router.post('/ai/optimize-title', authMiddleware, AIController.optimizeTitle);
router.post('/ai/optimize-description', authMiddleware, AIController.optimizeDescription);
router.get('/ai/my-usage', authMiddleware, AIController.getMyAIUsage);

module.exports = router;