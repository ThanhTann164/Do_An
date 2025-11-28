const authService = require("../Services/authservice");
const { sign } = require("../middlewares/authMiddleware");

// Helper function for error handling
const handleError = (res, error) => {
  console.error("Auth Error:", error);
  const statusCode = error.statusCode || 500;
  const message = error.message || "Server error";
  res.status(statusCode).json({ 
    success: false, 
    message 
  });
};

// 📌 Đăng ký (tạo user + sinh OTP gửi mail)
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }

    const result = await authService.register({ fullName, email, phone, password });
    
    // User đã tồn tại nhưng chưa active
    if (result.alreadyRegistered) {
      return res.status(200).json({
        success: true,
        userId: result.userId,
        email: result.email,
        expiredAt: result.expiredAt,
        message: "Email already registered but inactive. Please verify OTP.",
      });
    }

    // User mới
    res.status(201).json({
      success: true,
      userId: result.userId,
      email: result.email,
      expiredAt: result.expiredAt,
      message: "User created. Please verify OTP sent to your email.",
    });
  } catch (err) {
    handleError(res, err);
  }
};

// 📌 Xác thực OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp, fromLogin } = req.body;
    console.log("🔐 Verify OTP request:", { userId, otp, fromLogin });

    if (!userId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and OTP are required" 
      });
    }

    const result = await authService.verifyOtp(userId, otp);
    
    // Nếu user đã active hoặc vừa mới activate
    if (result.alreadyActive || result.success) {
      // Nếu từ login, trả về token luôn
      if (fromLogin) {
        console.log("🔑 OTP verified from login, getting user info...");
        const user = await authService.findUserByUserId(userId);
        
        if (user) {
          const token = sign({ 
            userId: user.UserID, 
            email: user.Email, 
            role: user.Role  // Đổi từ roles thành role để đồng nhất
          });

          const { PasswordHash, OtpCode, ...safeUser } = user.toJSON ? user.toJSON() : user;
          
          return res.json({
            success: true,
            message: result.alreadyActive ? 
              "Tài khoản đã được kích hoạt. Đăng nhập thành công!" :
              "Kích hoạt tài khoản và đăng nhập thành công!",
            token: token,
            user: safeUser
          });
        }
      }
      
      // Regular verification (from registration)
      return res.json({ 
        success: true, 
        message: result.alreadyActive ? 
          "Tài khoản đã được kích hoạt" : 
          "Kích hoạt tài khoản thành công!" 
      });
    }

    // Không có kết quả nào khớp
    return res.status(400).json({
      success: false,
      message: "Xác thực OTP thất bại"
    });

  } catch (err) {
    console.error("❌ Verify OTP error:", err.message);
    handleError(res, err);
  }
};

// 📌 Gửi lại OTP
exports.resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const { expiredAt } = await authService.resendOtp(userId);
    res.json({
      success: true,
      expiredAt,
      message: "New OTP has been sent to your email",
    });
  } catch (err) {
    handleError(res, err);
  }
};

// 📌 Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await authService.login(email, password);
    
    // Lấy userId từ result.user (có thể là UserID hoặc userId)
    const userId = result.user.UserID || result.user.userId || result.user.id;
    console.log("📦 [Login] User ID from result:", userId, "Full user object:", result.user);
    
    if (!userId) {
      console.error("❌ [Login] Cannot get userId from result.user:", result.user);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng"
      });
    }
    
    // Lấy package info của user ngay sau khi login
    const PackageMiddleware = require("../Middlewares/packageMiddleware");
    const userPackageDetails = await PackageMiddleware.getUserPackage(userId);
    
    console.log("📦 [Login] User package details:", userPackageDetails);
    
    // Format package data theo chuẩn FE cần
    const packageData = userPackageDetails ? {
      userPackage: {
        name: userPackageDetails.name,
        display_name: userPackageDetails.display_name,
        is_free: userPackageDetails.is_free,
        expires_at: userPackageDetails.expires_at
      },
      rules: userPackageDetails.rules,
      limits: {
        posts: {
          daily: userPackageDetails.rules.max_posts_per_day,
          daily_used: userPackageDetails.posts_today || 0,
          daily_remaining: userPackageDetails.rules.max_posts_per_day > 0 ? Math.max(0, userPackageDetails.rules.max_posts_per_day - (userPackageDetails.posts_today || 0)) : -1
        },
        boost: {
          per_day: userPackageDetails.rules.boost_per_day,
          used_today: userPackageDetails.boost_used_today || 0,
          remaining_today: userPackageDetails.rules.boost_per_day > 0 ? Math.max(0, userPackageDetails.rules.boost_per_day - (userPackageDetails.boost_used_today || 0)) : -1
        }
      },
      features: {
        ai_tools: userPackageDetails.rules.ai_tools,
        highlight: userPackageDetails.rules.highlight,
        priority: userPackageDetails.rules.priority,
        video_panorama: userPackageDetails.rules.video_panorama,
        banner_ads: userPackageDetails.rules.banner_ads
      }
    } : null;
    
    res.json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
      package: packageData
    });
  } catch (err) {
    console.log("🔥 Login error details:", {
      message: err.message,
      statusCode: err.statusCode,
      includesInactive: err.message.includes("chưa được kích hoạt")
    });
    
    // Xử lý trường hợp tài khoản chưa kích hoạt
    if (err.message.includes("chưa được kích hoạt")) {
      try {
        const user = await authService.findUserByEmail(req.body.email);
        console.log("👤 Found user:", {
          exists: !!user,
          status: user?.Status,
          userId: user?.UserID,
          email: user?.Email
        });
        
        if (user && user.Status === "Inactive") {
          return res.status(401).json({
            success: false,
            notActivated: true,
            userId: user.UserID,
            email: user.Email,
            expiredAt: user.OtpExpiredAt,
            message: err.message,
          });
        }
      } catch (userError) {
        console.error("❌ Error finding user:", userError);
      }
    }
    
    handleError(res, err);
  }
};

// 📌 Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.userId;

    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New password is required" 
      });
    }

    await authService.changePassword(userId, newPassword);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

// 📌 Cập nhật profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.userId;

    if (!email && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one field (email or phone) is required" 
      });
    }

    await authService.updateProfile(userId, email, phone);
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

// 📌 Lấy thông tin user từ JWT (cho cả /me và /user)
exports.getUserInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Lấy thông tin đầy đủ từ database
    const userId = req.user.userId;
    const user = await authService.findUserByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Loại bỏ thông tin nhạy cảm
    const { PasswordHash, OtpCode, OtpExpiredAt, ...dbUser } = user.toJSON ? user.toJSON() : user;

    // Map sang lowercase properties để khớp với frontend
    const safeUser = {
      userId: dbUser.UserID,
      id: dbUser.UserID,
      email: dbUser.Email,
      phone: dbUser.PhoneNumber,
      role: dbUser.Role,
      status: dbUser.Status,
      display_name: dbUser.FullName,
      fullName: dbUser.FullName,
      username: dbUser.Email,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };

    res.json({
      success: true,
      user: safeUser,
      data: safeUser
    });
  } catch (err) {
    console.error('getUserInfo error:', err);
    handleError(res, err);
  }
};

// 📌 Lấy thông tin OTP
exports.getOtpInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const data = await authService.getOtpInfo(userId);
    res.json({ success: true, ...data });
  } catch (err) {
    handleError(res, err);
  }
};