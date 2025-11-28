

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authcontroller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// 🔓 Public
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.get("/otp-info/:userId", authController.getOtpInfo);

// 🔒 Protected
// router.post("/change-password", authMiddleware(), authController.changePassword); // Using new route in userRoutes.js
// router.post("/update-profile", authMiddleware(), authController.updateProfile); // Commented out - using new route in userRoutes.js
router.get("/user", authMiddleware(), authController.getUserInfo); 

// 🔒 Role-based (chỉ Admin mới vào được)
router.get("/admin-only", authMiddleware(["Admin"]), (req, res) => {
  res.json({ success: true, message: "Welcome Admin!" });
});

module.exports = router;