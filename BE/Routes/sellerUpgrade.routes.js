const express = require("express");
const router = express.Router();
const SellerUpgradeController = require("../controllers/sellerUpgrade.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// 📝 Buyer gửi request + upload giấy tờ
router.post("/request",authMiddleware(["Buyer"]),upload.fields([
  { name: "CCCD_Front", maxCount: 1 },
    { name: "CCCD_Back", maxCount: 1 },
    { name: "CCCD_Selfie", maxCount: 1 },
  ]),
  SellerUpgradeController.requestUpgrade
);
// 👀 Admin xem chi tiết request + giấy tờ
router.get("/request/:requestId",authMiddleware(["Admin"]),SellerUpgradeController.getRequestDetails);

// ✅ Admin duyệt request & tạo hợp đồng
router.post("/approve", 
  (req, res, next) => {
    console.log(`\n🌐 ========== ROUTE: /api/seller-upgrade/approve ==========`);
    console.log(`📥 Method: ${req.method}`);
    console.log(`🔗 URL: ${req.url}`);
    console.log(`📦 Body:`, req.body);
    console.log(`🔑 Headers Authorization:`, req.headers.authorization ? 'Present' : 'Missing');
    next();
  },
  authMiddleware(["Admin"]),
  SellerUpgradeController.approveRequest
);
// 📑 Admin list tất cả request UpgradeToSeller
router.get("/requests",authMiddleware(["Admin"]), SellerUpgradeController.listAllRequests);

// ❌ Admin từ chối / yêu cầu xác minh lại
router.post("/reject",authMiddleware(["Admin"]),SellerUpgradeController.rejectRequest);

// 🔐 Buyer verify OTP để xem/ký hợp đồng
router.post("/verify-otp", authMiddleware(["Buyer"]), SellerUpgradeController.verifyOtp);

// 📄 Buyer xem contract để ký (yêu cầu OTP trong query)
router.get("/contract/:requestId",authMiddleware(["Buyer"]),SellerUpgradeController.getContract);

// ✍️ Buyer ký hợp đồng
router.post("/sign",authMiddleware(["Buyer"]),SellerUpgradeController.signContract);
router.get("/my-requests",authMiddleware(["Buyer"]),SellerUpgradeController.getMyRequests);

// 🖼️ Proxy image từ Google Drive (chỉ Admin)
router.get("/image/:fileId", authMiddleware(["Admin"]), SellerUpgradeController.proxyImage);

module.exports = router;