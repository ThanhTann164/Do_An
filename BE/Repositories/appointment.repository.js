const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require("../models/init-models");

const { appointments, users } = initModels(sequelize);

class AppointmentRepository {
  async create(appointmentData) {
    return await appointments.create(appointmentData);
  }

  async findByBuyerId(buyerId) {
    return await appointments.findAll({
      where: { BuyerID: buyerId },
      include: [
        {
          model: users,
          as: 'Seller',
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findBySellerId(sellerId) {
    return await appointments.findAll({
      where: { SellerID: sellerId },
      include: [
        {
          model: users,
          as: 'Buyer',
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async findById(appointmentId) {
    return await appointments.findByPk(appointmentId, {
      include: [
        {
          model: users,
          as: 'Buyer',
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber']
        },
        {
          model: users,
          as: 'Seller',
          attributes: ['UserID', 'FullName', 'Email', 'PhoneNumber']
        }
      ]
    });
  }

  async updateStatus(appointmentId, status) {
    return await appointments.update(
      { Status: status },
      { where: { AppointmentID: appointmentId } }
    );
  }

  async updateWithSellerDates(appointmentId, status, sellerDates) {
    return await appointments.update(
      { 
        Status: status,
        SellerDates: sellerDates
      },
      { where: { AppointmentID: appointmentId } }
    );
  }

  async delete(appointmentId) {
    return await appointments.destroy({
      where: { AppointmentID: appointmentId }
    });
  }

  async findConfirmedBySellerId(sellerId) {
    const confirmed = await appointments.findAll({
      where: { 
        SellerID: sellerId,
        Status: 'Confirmed'
      },
      attributes: ['AppointmentID', 'BuyerDates', 'SellerDates', 'Status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Parse BuyerDates và SellerDates từ JSON
    const result = [];
    confirmed.forEach(apt => {
      const sellerDates = apt.SellerDates || [];
      sellerDates.forEach(dateTime => {
        result.push({
          date: dateTime.date,
          time: dateTime.time,
          appointmentId: apt.AppointmentID
        });
      });
    });

    return result;
  }
}

module.exports = new AppointmentRepository();

