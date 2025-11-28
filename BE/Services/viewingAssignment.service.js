const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');
const AppError = require('../Utils/AppError');

const { houseviewings, users, houses } = initModels(sequelize);

class ViewingAssignmentService {
  async assignStaff(viewingId, staffId) {
    const viewing = await houseviewings.findByPk(viewingId);
    if (!viewing) {
      throw new AppError('Không tìm thấy lịch xem', 404);
    }

    const staff = await users.findOne({
      where: {
        UserID: staffId,
        Role: 'Staff',
        Status: 'Active'
      },
      attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber', 'AvatarUrl']
    });

    if (!staff) {
      throw new AppError('Nhân viên không hợp lệ hoặc đã bị vô hiệu hóa', 400);
    }

    await viewing.update({
      StaffID: staffId,
      StaffVerifyStatus: 'Pending',
      StaffVerifyNote: null,
      StaffVerifyTime: null
    });

    return {
      viewingId: viewing.ViewingID,
      staff
    };
  }

  async getAssignedStaff(viewingId) {
    const viewing = await houseviewings.findByPk(viewingId, {
      include: [
        {
          model: users,
          as: 'Staff',
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber', 'AvatarUrl', 'Status']
        }
      ]
    });

    if (!viewing) {
      throw new AppError('Không tìm thấy lịch xem', 404);
    }

    return viewing.Staff || null;
  }

  async listAllViewings() {
    return houseviewings.findAll({
      include: [
        {
          model: houses,
          as: 'House',
          attributes: ['HouseID', 'Title', 'Address', 'Price', 'Status']
        },
        {
          model: users,
          as: 'User',
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber']
        },
        {
          model: users,
          as: 'Staff',
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber', 'AvatarUrl']
        }
      ],
      order: [['ViewingDate', 'DESC']]
    });
  }
}

module.exports = new ViewingAssignmentService();

