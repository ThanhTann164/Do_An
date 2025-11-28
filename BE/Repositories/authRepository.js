const getSequelizeInstance = require('../utils/sequelize-instance');
const { Op } = require("sequelize");
const sequelize = getSequelizeInstance();
const initModels = require("../models/init-models");
const bcrypt = require("bcrypt");

const { users } = initModels(sequelize);

class AuthRepository {
  async findByEmail(email) {
    return users.findOne({ where: { Email: email } });
  }

 async findById(userId) {
  try {
    const user = await users.findOne({ 
      where: { UserID: userId },
      attributes: { 
        exclude: ['PasswordHash', 'OtpCode', 'OtpExpiredAt'] 
      }
    });
    
    if (!user) {
      console.log(`❌ User not found with ID: ${userId}`);
      return null;
    }
    
    console.log(`✅ User found: ${user.Email}`);
    return user;
  } catch (error) {
    console.error('❌ Error in findById:', error);
    throw error;
  }
}

  async findByIdWithOtp(userId) {
    return users.findOne({ 
      where: { UserID: userId },
      attributes: ['UserID', 'Email', 'OtpCode', 'OtpExpiredAt', 'Status']
    });
  }

  async createUser({ fullName, email, phone, password, role = "Buyer" }) {
    const existingEmail = await users.findOne({ where: { Email: email } });
    if (existingEmail) {
      throw new Error("Email already registered");
    }

    const existingPhone = await users.findOne({ where: { PhoneNumber: phone } });
    if (existingPhone) {
      throw new Error("Phone number already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await users.create({
      FullName: fullName,
      Email: email,
      PhoneNumber: phone,
      PasswordHash: passwordHash,
      Role: role,
      Status: "Inactive",
      OtpCode: otp,
      OtpExpiredAt: expiredAt,
    });

    return {
      userId: user.UserID,
      fullName: user.FullName,
      email: user.Email,
      otp,
      expiredAt,
    };
  }

  async verifyOtp(userId, otp) {
    const user = await users.findOne({ 
      where: { UserID: userId },
      attributes: ['UserID', 'OtpCode', 'OtpExpiredAt', 'Status']
    });
    
    if (!user) return false;
    if (user.OtpCode !== otp) return false;
    if (!user.OtpExpiredAt || new Date() > user.OtpExpiredAt) return false;

    await users.update(
      { Status: "Active", OtpCode: null, OtpExpiredAt: null },
      { where: { UserID: userId } }
    );
    return true;
  }

  async resendOtp(userId) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000);

    await users.update(
      { OtpCode: otp, OtpExpiredAt: expiredAt }, 
      { where: { UserID: userId } }
    );
    
    const user = await users.findOne({
      where: { UserID: userId },
      attributes: ['Email']
    });
    
    return { otp, expiredAt, email: user?.Email };
  }

  // ✅ THÊM METHOD NÀY
  async activateUser(userId) {
    const user = await users.findOne({ 
      where: { UserID: userId },
      attributes: ['UserID', 'Status']
    });
    
    if (!user) {
      throw new Error("User not found");
    }

    await users.update(
      { 
        Status: "Active", 
        OtpCode: null, 
        OtpExpiredAt: null 
      },
      { where: { UserID: userId } }
    );

    return await users.findOne({
      where: { UserID: userId },
      attributes: { exclude: ['PasswordHash', 'OtpCode', 'OtpExpiredAt'] }
    });
  }

  async updatePassword(userId, newPassword) {
    if (!newPassword) throw new Error("New password required");
    const newHash = await bcrypt.hash(newPassword, 10);
    
    return users.update(
      { PasswordHash: newHash },
      { where: { UserID: userId } }
    );
  }

  async updateProfile(userId, newEmail, newPhone) {
    // Kiểm tra email/phone trùng
    if (newEmail) {
      const existingEmail = await users.findOne({ 
        where: { Email: newEmail, UserID: { [Op.ne]: userId } }
      });
      if (existingEmail) throw new Error("Email already exists");
    }

    if (newPhone) {
      const existingPhone = await users.findOne({ 
        where: { PhoneNumber: newPhone, UserID: { [Op.ne]: userId } }
      });
      if (existingPhone) throw new Error("Phone number already exists");
    }

    return users.update(
      { 
        ...(newEmail && { Email: newEmail }),
        ...(newPhone && { PhoneNumber: newPhone })
      }, 
      { where: { UserID: userId } }
    );
  }
}

module.exports = new AuthRepository();