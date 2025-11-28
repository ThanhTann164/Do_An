const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require("../models/init-models");

const { users } = initModels(sequelize);

class UserRepository {
  async findByEmail(email) {
    return await users.findOne({ where: { Email: email } });
  }

  async findByEmailAndPassword(email, password) {
    return await users.findOne({ where: { Email: email, PasswordHash: password } });
  }

  async createUser(userData) {
    const user = await users.create({
      FullName: userData.fullName,
      Email: userData.email,
      PhoneNumber: userData.phoneNumber,
      PasswordHash: userData.passwordHash,
      Role: userData.role || 'Buyer',
      Status: userData.status || 'Active'
    });
    return user.UserID;
  }

  async createGoogleUser(userData) {
    const user = await users.create({
      FullName: userData.FullName,
      Email: userData.Email,
      PhoneNumber: userData.PhoneNumber,
      PasswordHash: userData.PasswordHash,
      Role: userData.Role || 'Buyer',
      Status: userData.Status || 'Active'
    });
    return user.UserID;
  }

  async updateFullName(userId, fullName) {
    await users.update(
      { FullName: fullName },
      { where: { UserID: userId } }
    );
  }

  async updatePassword(email, newPasswordHash) {
    return await users.update(
      { PasswordHash: newPasswordHash },
      { where: { Email: email } }
    );
  }

  async updateProfile(userId, fullName, email, phoneNumber) {
    return await users.update(
      { FullName: fullName, Email: email, PhoneNumber: phoneNumber },
      { where: { UserID: userId } }
    );
  }

  async updateUserStatus(userId, status) {
    return await users.update(
      { Status: status },
      { where: { UserID: userId } }
    );
  }

  async setContractOtp(userId, otp) {
    console.log(`\n💾 ========== SETTING CONTRACT OTP ==========`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🔐 OTP: ${otp}`);
    
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 10); // OTP expires in 10 minutes
    console.log(`⏰ Expires at: ${expiredAt.toISOString()}`);
    
    try {
      const [affectedRows] = await users.update(
        { 
          OtpCode: otp,
          OtpExpiredAt: expiredAt
        },
        { where: { UserID: userId } }
      );
      
      console.log(`✅ Update result: ${affectedRows} row(s) affected`);
      
      if (affectedRows === 0) {
        console.error(`❌ WARNING: No rows updated! User ${userId} may not exist.`);
        throw new Error(`Không tìm thấy user với ID ${userId}`);
      }
      
      // Verify OTP was saved
      const user = await users.findByPk(userId, { attributes: ['OtpCode', 'OtpExpiredAt'] });
      console.log(`🔍 Verification - OTP in DB: ${user?.OtpCode || 'NULL'}`);
      console.log(`🔍 Verification - Expires: ${user?.OtpExpiredAt || 'NULL'}`);
      
      return { affectedRows, otp, expiredAt };
    } catch (err) {
      console.error(`❌ Error setting OTP:`, err);
      throw err;
    }
  }

  async verifyContractOtp(userId, otp, clearAfterVerify = false) {
    const user = await users.findOne({ 
      where: { UserID: userId },
      attributes: ['OtpCode', 'OtpExpiredAt']
    });
    
    if (!user || !user.OtpCode || user.OtpCode !== otp) {
      return { valid: false, message: 'Mã OTP không đúng' };
    }
    
    if (new Date() > new Date(user.OtpExpiredAt)) {
      return { valid: false, message: 'Mã OTP đã hết hạn' };
    }
    
    // Chỉ clear OTP nếu được yêu cầu (khi đã fetch contract thành công)
    if (clearAfterVerify) {
      await users.update(
        { OtpCode: null, OtpExpiredAt: null },
        { where: { UserID: userId } }
      );
    }
    
    return { valid: true, message: 'Mã OTP hợp lệ' };
  }

  async findAllSellers() {
    return await users.findAll({ 
      where: { Role: 'Seller', Status: 'Active' },
      attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber'],
      order: [['FullName', 'ASC']]
    });
  }

  async findAllBuyers() {
    return await users.findAll({ 
      where: { Role: 'Buyer', Status: 'Active' },
      attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber'],
      order: [['FullName', 'ASC']]
    });
  }
}

module.exports = new UserRepository();
