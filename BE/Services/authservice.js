require("dotenv").config();
const bcrypt = require("bcrypt");
const authRepo = require("../Repositories/authRepository");
const validatePassword = require("../utils/passwordValidator");
const MailService = require("./mail.service");
const { sign } = require("../middlewares/authMiddleware");
const AppError = require("../Utils/AppError");

class AuthService {
  async login(email, password) {
    console.log('🔍 Login attempt:', { email, password: password ? 'PROVIDED' : 'MISSING' });
    const user = await authRepo.findByEmail(email);
    console.log('👤 User found:', user ? { id: user.UserID, email: user.Email, status: user.Status } : 'NOT FOUND');
    if (!user) {
      throw new AppError("Sai thông tin đăng nhập", 401);
    }

    if (user.Status !== "Active") {
      throw new AppError("Tài khoản chưa được kích hoạt", 401);
    }

    console.log('🔐 Comparing password with hash...');
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    console.log('🔐 Password match result:', isMatch);
    if (!isMatch) {
      throw new AppError("Sai thông tin đăng nhập", 401);
    }

    console.log('🎫 Creating JWT token...');
    const token = sign({ 
      userId: user.UserID, 
      email: user.Email, 
      role: user.Role  // Đổi từ roles thành role để đồng nhất
    });
    console.log('🎫 Token created successfully');
    
    const { PasswordHash, OtpCode, ...safeUser } = user.toJSON ? user.toJSON() : user;
    console.log('✅ Login successful, returning data');
    return { user: safeUser, token };
  }

  async register({ fullName, password, email, phone }) {
    // Check existing user
    const existingUser = await authRepo.findByEmail(email);
    if (existingUser) {
      if (existingUser.Status === "Inactive") {
        return {
          userId: existingUser.UserID,
          email: existingUser.Email,
          expiredAt: existingUser.OtpExpiredAt,
          alreadyRegistered: true,
        };
      }
      throw new AppError("Email đã tồn tại", 400);
    }

    // Validate password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      throw new AppError(passwordCheck.message, 400);
    }

    // Create user
    const { userId, fullName: name, otp, expiredAt } = await authRepo.createUser({ 
      fullName, 
      password, 
      email, 
      phone 
    });

    // Send OTP email
    await MailService.sendOtp(email, otp, expiredAt);
    return { userId, name, email, expiredAt };
  }

  async verifyOtp(userId, otp) {
    const user = await authRepo.findByIdWithOtp(userId);
    if (!user) {
      throw new AppError("Người dùng không tồn tại", 404);
    }

    // Already active
    if (user.Status === 'Active') {
      return { alreadyActive: true };
    }

    // Check OTP match
    if (user.OtpCode !== otp) {
      throw new AppError("Mã OTP không đúng", 400);
    }

    // Check OTP expiration
    const currentTime = new Date();
    const expiredTime = new Date(user.OtpExpiredAt);
    
    if (currentTime > expiredTime) {
      throw new AppError("Mã OTP đã hết hạn", 400);
    }

    // Activate user
    await authRepo.activateUser(userId);
    return { success: true };
  }

  async getOtpInfo(userId) {
    const user = await authRepo.findByIdWithOtp(userId);
    if (!user) {
      throw new AppError("Người dùng không tồn tại", 404);
    }

    if (user.Status === "Active") {
      throw new AppError("Tài khoản đã được kích hoạt", 400);
    }

    return {
      email: user.Email,
      expiredAt: user.OtpExpiredAt
    };
  }

  async resendOtp(userId) {
    const { otp, expiredAt, email } = await authRepo.resendOtp(userId);
    if (!email) {
      throw new AppError("Không tìm thấy email của người dùng", 404);
    }

    await MailService.sendOtp(email, otp, expiredAt);
    return { expiredAt };
  }

  async changePassword(userId, newPassword) {
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      throw new AppError(passwordCheck.message, 400);
    }

    await authRepo.updatePassword(userId, newPassword);
    return true;
  }

  async updateProfile(userId, email, phone) {
    return await authRepo.updateProfile(userId, email, phone);
  }

  async findUserByEmail(email) {
    const user = await authRepo.findByEmail(email);
    return user || null;
  }

  // NEW: Missing method that controller was calling
  async findUserByUserId(userId) {
    const user = await authRepo.findById(userId);
    return user || null;
  }
}

module.exports = new AuthService();