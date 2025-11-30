const express = require('express');
const router = express.Router();
const PackageController = require('../controllers/package.controller');
const { authMiddleware } = require('../Middlewares/authMiddleware');

// Package routes - Đặt routes cụ thể trước route :id
router.get('/', PackageController.getAllPackages);
router.get('/my-package', authMiddleware, PackageController.getMyPackage);
router.post('/purchase', authMiddleware, PackageController.purchasePackage);
router.get('/history', authMiddleware, PackageController.getPackageHistory);
router.get('/:id', PackageController.getPackageById); // Phải đặt cuối cùng

// Note: AI routes đã được chuyển sang /api/ai/* trong aiRoutes.js

module.exports = router;