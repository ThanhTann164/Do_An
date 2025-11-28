const express = require("express");
const router = express.Router();
const viewingController = require("../controllers/viewing.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// Tạo lịch xem nhà mới (yêu cầu đăng nhập)
router.post("/api/viewings", authMiddleware(), viewingController.createViewing);

// Lấy danh sách lịch xem nhà của user
router.get("/api/viewings/my", authMiddleware(), viewingController.getMyViewings);

// Lấy danh sách lịch xem nhà cho một căn nhà (dành cho seller)
router.get("/api/viewings/house/:houseId", authMiddleware(["Seller", "Admin"]), viewingController.getViewingsByHouse);

// Cập nhật trạng thái lịch xem nhà
router.patch("/api/viewings/:id/status", authMiddleware(["Seller", "Admin"]), viewingController.updateViewingStatus);

module.exports = router;
