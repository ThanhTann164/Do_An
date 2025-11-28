const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Config/jwt.config');
const userController = require('../controllers/user.controller');
const { handleAvatarUpload } = require('../middleware/upload');
const path = require('path');

const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const { users } = initModels(sequelize);

function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.get('Authorization');
  const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  return bearer || (req.cookies && req.cookies.token) || null;
}

// Middleware to extract user from token
const authenticateUser = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.post('/update-profile', authenticateUser, handleAvatarUpload, async (req, res) => {
  try {
    console.log('🔄 UPDATE PROFILE API called');
    console.log('👤 User ID:', req.user.userId);
    console.log('📝 Request body:', req.body);
    console.log('📸 File uploaded:', req.file ? req.file.filename : 'No file');
    
    const userId = req.user.userId;
    
    // Get current user data first
    const currentUser = await User.findByPk(userId);
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    const { fullName, gender, phone, timezone, website, address, bio } = req.body;

    // Validation - only validate if field is provided
    if (fullName !== undefined && (!fullName || fullName.trim().length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Họ và tên không được để trống' 
      });
    }

    // Validate phone if provided
    if (phone && !/^[0-9]{10}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số điện thoại phải có đúng 10 số' 
      });
    }

    // Validate website if provided
    if (website && !/^https?:\/\/.+\..+/.test(website)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Website phải có định dạng URL hợp lệ (http:// hoặc https://)' 
      });
    }

    // Prepare update data - merge with existing data
    const updateData = {
      FullName: fullName?.trim() ?? currentUser.FullName,
      PhoneNumber: phone ?? currentUser.PhoneNumber,
      Gender: gender ?? currentUser.Gender,
      Timezone: timezone ?? currentUser.Timezone ?? 'GMT+7 (ICT)',
      Website: website ?? currentUser.Website,
      Address: address ?? currentUser.Address,
      Bio: bio ?? currentUser.Bio,
      UpdatedAt: new Date()
    };

    // Handle avatar upload
    if (req.file) {
      // Generate avatar URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      updateData.AvatarUrl = avatarUrl;
    }

    // Check if phone number already exists for another user
    if (phone) {
      const existingUser = await users.findOne({
        where: { 
          PhoneNumber: phone,
          UserID: { [require('sequelize').Op.ne]: userId }
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại này đã được sử dụng bởi tài khoản khác'
        });
      }
    }

    // Update user profile
    console.log('📊 Updating user with data:', updateData);
    try {
      const updateResult = await users.update(updateData, { where: { UserID: userId } });
      console.log('📊 Update result:', updateResult);
    } catch (updateError) {
      console.error('❌ Update error:', updateError);
      throw updateError;
    }

    // Get updated user data
    const updatedUser = await users.findOne({
      where: { UserID: userId },
      attributes: { exclude: ['PasswordHash', 'OtpCode', 'OtpExpiredAt'] }
    });
    console.log('📊 Updated user data:', updatedUser ? 'Found' : 'Not found');
    
    if (!updatedUser) {
      console.error('❌ User not found after update for UserID:', userId);
      throw new Error('User not found after update');
    }
    
    console.log('📊 Found updated user:', {
      UserID: updatedUser.UserID,
      FullName: updatedUser.FullName,
      AvatarUrl: updatedUser.AvatarUrl
    });

    const responseData = { 
      success: true, 
      message: 'Cập nhật thông tin thành công!',
      data: {
        user: {
          userId: updatedUser.UserID,
          fullName: updatedUser.FullName,
          email: updatedUser.Email,
          phone: updatedUser.PhoneNumber,
          gender: updatedUser.Gender,
          address: updatedUser.Address,
          timezone: updatedUser.Timezone,
          website: updatedUser.Website,
          bio: updatedUser.Bio,
          avatarUrl: updatedUser.AvatarUrl,
          role: updatedUser.Role,
          status: updatedUser.Status
        }
      }
    };
    
    // Add cache-busting timestamp to avatar URL in response
    if (responseData.data.user.avatarUrl) {
      responseData.data.user.avatarUrl = `${responseData.data.user.avatarUrl}?updated=${Date.now()}`;
    }
    
    console.log('✅ Sending success response:', responseData);
    return res.json(responseData);

  } catch (error) {
    console.error('❌ update-profile error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi cập nhật thông tin',
      error: error.message 
    });
  }
});

router.post('/change-password', authenticateUser, async (req, res) => {
  try {
    console.log('🔐 [NEW] Change password API called for user:', req.user.userId);
    console.log('📝 Request body:', req.body);
    
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    console.log('🔐 Change password request for user:', userId);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới và xác nhận mật khẩu không khớp' 
      });
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số' 
      });
    }

    // Get current user
    const currentUser = await users.findOne({
      where: { UserID: userId },
      attributes: ['UserID', 'PasswordHash']
    });

    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Verify current password
    const bcrypt = require('bcrypt');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.PasswordHash);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu hiện tại không đúng',
        field: 'currentPassword'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await users.update(
      { PasswordHash: newPasswordHash, UpdatedAt: new Date() },
      { where: { UserID: userId } }
    );

    console.log('✅ Password changed successfully for user:', userId);

    return res.json({ 
      success: true, 
      message: 'Đổi mật khẩu thành công!' 
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đổi mật khẩu' 
    });
  }
});

// Get all sellers
router.get('/sellers', userController.getAllSellers);
router.get('/buyers', userController.getAllBuyers);

module.exports = router;


