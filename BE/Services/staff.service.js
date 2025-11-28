const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const authRepo = require('../Repositories/authRepository');
const StaffRepository = require('../Repositories/staff.repository');
const AppError = require('../Utils/AppError');
const { sign } = require('../Middlewares/authMiddleware');

const { users } = initModels(sequelize);

const STAFF_VERIFY_STATUS = ['Pending', 'Verified', 'Rejected'];

const sanitizeUser = (user) => {
  if (!user) return null;
  const plain = user.toJSON ? user.toJSON() : { ...user };
  delete plain.PasswordHash;
  delete plain.OtpCode;
  delete plain.OtpExpiredAt;
  return plain;
};

class StaffService {
  // Remove staff login - will use common login in authService

  async getProfile(staffId) {
    return authRepo.findById(staffId);
  }

  async getDashboardSummary(staffId) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      todayViewings,
      pendingVerifications,
      housesWithoutDocs,
      pendingIdentities
    ] = await Promise.all([
      StaffRepository.countTodayViewings(staffId, startOfDay, endOfDay),
      StaffRepository.countPendingStaffVerifications(staffId),
      StaffRepository.countHousesWithoutVerifiedDocs(),
      StaffRepository.countPendingIdentityVerifications()
    ]);

    return {
      todayViewings,
      pendingVerifications,
      housesWithoutVerifiedDocuments: housesWithoutDocs,
      pendingIdentityChecks: pendingIdentities
    };
  }

  async getAssignedViewings(staffId) {
    return StaffRepository.getAssignedViewings(staffId);
  }

  async verifyViewing(staffId, viewingId, status, note = '') {
    if (!STAFF_VERIFY_STATUS.includes(status)) {
      throw new AppError('Trạng thái không hợp lệ', 400);
    }

    const viewing = await StaffRepository.findViewingById(viewingId);
    if (!viewing || Number(viewing.StaffID) !== Number(staffId)) {
      throw new AppError('Không tìm thấy lịch xem phù hợp', 404);
    }

    await viewing.update({
      StaffVerifyStatus: status,
      StaffVerifyNote: note,
      StaffVerifyTime: new Date()
    });

    return viewing;
  }

  async listStaff() {
    const list = await users.findAll({
      where: { Role: 'Staff' },
      attributes: { exclude: ['PasswordHash', 'OtpCode', 'OtpExpiredAt'] },
      order: [['createdAt', 'DESC']]
    });
    return list;
  }

  async createStaff({ fullName, email, phone, password, avatarUrl, status = 'Active' }) {
    if (!fullName || !email || !password) {
      throw new AppError('Vui lòng nhập đầy đủ thông tin staff', 400);
    }

    const existing = await users.findOne({ where: { Email: email } });
    if (existing) {
      throw new AppError('Email đã tồn tại', 400);
    }

    if (phone) {
      const existingPhone = await users.findOne({ where: { PhoneNumber: phone } });
      if (existingPhone) {
        throw new AppError('Số điện thoại đã tồn tại', 400);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const staff = await users.create({
      FullName: fullName,
      Email: email,
      PhoneNumber: phone || null,
      PasswordHash: passwordHash,
      Role: 'Staff',
      Status: status,
      AvatarUrl: avatarUrl || null,
      OtpCode: null,
      OtpExpiredAt: null
    });

    return sanitizeUser(staff);
  }

  async updateStaff(staffId, { fullName, phone, avatarUrl, status, password }) {
    const staff = await users.findOne({
      where: { UserID: staffId, Role: 'Staff' }
    });

    if (!staff) {
      throw new AppError('Staff không tồn tại', 404);
    }

    const payload = {};
    if (fullName) payload.FullName = fullName;
    if (phone) {
      const existingPhone = await users.findOne({
        where: { PhoneNumber: phone, UserID: { [Op.ne]: staffId } }
      });
      if (existingPhone) {
        throw new AppError('Số điện thoại đã tồn tại', 400);
      }
      payload.PhoneNumber = phone;
    }
    if (typeof avatarUrl !== 'undefined') payload.AvatarUrl = avatarUrl;
    if (status) payload.Status = status;
    if (password) {
      payload.PasswordHash = await bcrypt.hash(password, 10);
    }

    await staff.update(payload);
    return sanitizeUser(staff);
  }

  async deleteStaff(staffId) {
    const staff = await users.findOne({
      where: { UserID: staffId, Role: 'Staff' }
    });
    if (!staff) {
      throw new AppError('Staff không tồn tại', 404);
    }
    await staff.update({ Status: 'Inactive' });
    return true;
  }

  // Staff Viewing Assignment & Confirmation
  async getPendingViewings() {
    const viewings = await StaffRepository.getPendingViewings();
    return viewings;
  }

  async assignViewing(staffId, viewingId) {
    const viewing = await StaffRepository.findViewingById(viewingId);
    if (!viewing) {
      throw new AppError('Không tìm thấy lịch xem', 404);
    }

    if (viewing.StaffID) {
      throw new AppError('Lịch xem này đã có staff phụ trách', 400);
    }

    if (viewing.Status !== 'CONFIRMED') {
      throw new AppError('Chỉ có thể nhận lịch xem đã được xác nhận', 400);
    }

    await viewing.update({ StaffID: staffId });
    return viewing;
  }

  async checkinViewing(staffId, viewingId, latitude, longitude) {
    const viewing = await StaffRepository.findViewingById(viewingId);
    if (!viewing || Number(viewing.StaffID) !== Number(staffId)) {
      throw new AppError('Không tìm thấy lịch xem phù hợp', 404);
    }

    if (viewing.StaffCheckinTime) {
      throw new AppError('Đã check-in rồi', 400);
    }

    await viewing.update({
      StaffCheckinTime: new Date(),
      StaffCheckinLat: latitude,
      StaffCheckinLng: longitude
    });

    return viewing;
  }

  async verifyViewingComplete(staffId, viewingId, verificationData) {
    const { buyerPresent, sellerPresent, houseCondition, staffNotes } = verificationData;
    
    const viewing = await StaffRepository.findViewingById(viewingId);
    if (!viewing || Number(viewing.StaffID) !== Number(staffId)) {
      throw new AppError('Không tìm thấy lịch xem phù hợp', 404);
    }

    if (!viewing.StaffCheckinTime) {
      throw new AppError('Vui lòng check-in trước khi xác minh', 400);
    }

    await viewing.update({
      BuyerPresent: buyerPresent,
      SellerPresent: sellerPresent,
      HouseCondition: houseCondition,
      StaffNotes: staffNotes,
      StaffVerifyStatus: 'Verified',
      StaffVerifyTime: new Date()
    });

    return viewing;
  }

  async getViewingDetail(staffId, viewingId) {
    const viewing = await StaffRepository.getViewingWithDetails(viewingId);
    if (!viewing) {
      throw new AppError('Không tìm thấy lịch xem', 404);
    }

    // Staff chỉ có thể xem lịch xem được giao cho mình
    if (viewing.StaffID && Number(viewing.StaffID) !== Number(staffId)) {
      throw new AppError('Không có quyền xem lịch xem này', 403);
    }

    return viewing;
  }

  async uploadViewingImages(staffId, viewingId, files) {
    const viewing = await StaffRepository.findViewingById(viewingId);
    if (!viewing || Number(viewing.StaffID) !== Number(staffId)) {
      throw new AppError('Không tìm thấy lịch xem phù hợp', 404);
    }

    const updateData = {};
    
    if (files.houseFront) {
      updateData.HouseFrontImage = `/uploads/viewings/${files.houseFront[0].filename}`;
    }
    
    if (files.staffBuyerSelfie) {
      updateData.StaffBuyerSelfie = `/uploads/viewings/${files.staffBuyerSelfie[0].filename}`;
    }
    
    if (files.sellerDocument) {
      updateData.SellerDocumentImage = `/uploads/viewings/${files.sellerDocument[0].filename}`;
    }

    await viewing.update(updateData);
    return viewing;
  }
}

module.exports = new StaffService();

