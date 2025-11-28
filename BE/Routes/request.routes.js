const express = require("express");
const router = express.Router();
const RequestController = require("../controllers/request.controller");

// Gửi yêu cầu thuê/mua
router.post("/", RequestController.createRequest);

// Buyer xem yêu cầu của mình
router.get("/buyer/:buyerId", RequestController.getRequestsByBuyer);

// Chủ nhà xem yêu cầu của 1 căn hộ
router.get("/house/:houseId", RequestController.getRequestsByHouse);

// 🔥 Chủ nhà xem tất cả yêu cầu gửi đến các căn nhà mình sở hữu
router.get("/owner/:ownerId", RequestController.getRequestsByOwner);

// 🔥 Chủ nhà cập nhật trạng thái (Pending -> Approved/Rejected/Cancelled)
router.put("/:id/status", RequestController.updateStatus);

// 🔥 Buyer hủy yêu cầu của chính mình (chỉ khi Pending)
router.put("/:id/cancel", RequestController.cancelRequestByBuyer);


module.exports = router;
