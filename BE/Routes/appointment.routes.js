const express = require("express");
const router = express.Router();
const AppointmentController = require("../controllers/appointment.controller");
const { authMiddleware } = require("../Middlewares/authMiddleware");

// Tạo lịch hẹn (Buyer)
router.post("/", authMiddleware, AppointmentController.createAppointment);

// Xem lịch hẹn của mình (Buyer hoặc Seller)
router.get("/my", authMiddleware, AppointmentController.getMyAppointments);

// Lấy lịch đã confirmed của Seller (public - không cần auth)
router.get("/seller/:sellerId/confirmed", AppointmentController.getSellerConfirmedSchedule);

// Xem chi tiết lịch hẹn
router.get("/:id", authMiddleware, AppointmentController.getAppointmentById);

// Cập nhật trạng thái lịch hẹn
router.put("/:id/status", authMiddleware, AppointmentController.updateAppointmentStatus);

// Xóa lịch hẹn
router.delete("/:id", authMiddleware, AppointmentController.deleteAppointment);

module.exports = router;

