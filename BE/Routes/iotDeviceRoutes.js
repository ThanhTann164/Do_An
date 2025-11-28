const express = require('express');
const router = express.Router();
const iotDeviceController = require('../controllers/iotDeviceController');
const authenticateJwt = require('../middlewares/authJwt');
const { requireSeller } = require('../middlewares/roleAuth');

// Tất cả routes cần authentication và role Seller
router.use(authenticateJwt);
router.use(requireSeller);

// API Routes
// GET /api/devices - Lấy danh sách tất cả thiết bị
router.get('/api/devices', iotDeviceController.getAllDevices);

// GET /api/devices/:id - Lấy thiết bị theo ID
router.get('/api/devices/:id', iotDeviceController.getDeviceById);

// POST /api/devices - Tạo thiết bị mới
router.post('/api/devices', iotDeviceController.createDevice);

// PUT /api/devices/:id - Cập nhật thiết bị
router.put('/api/devices/:id', iotDeviceController.updateDevice);

// DELETE /api/devices/:id - Xóa thiết bị
router.delete('/api/devices/:id', iotDeviceController.deleteDevice);

// PATCH /api/devices/:id/status - Cập nhật trạng thái thiết bị
router.patch('/api/devices/:id/status', iotDeviceController.updateDeviceStatus);

module.exports = router;
