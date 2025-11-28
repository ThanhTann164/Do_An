const AppointmentRepo = require("../Repositories/appointment.repository");

class AppointmentService {
  async createAppointment(appointmentData) {
    return await AppointmentRepo.create(appointmentData);
  }

  async getAppointmentsByBuyer(buyerId) {
    return await AppointmentRepo.findByBuyerId(buyerId);
  }

  async getAppointmentsBySeller(sellerId) {
    return await AppointmentRepo.findBySellerId(sellerId);
  }

  async getAppointmentById(appointmentId) {
    return await AppointmentRepo.findById(appointmentId);
  }

  async updateAppointmentStatus(appointmentId, status) {
    return await AppointmentRepo.updateStatus(appointmentId, status);
  }

  async updateAppointmentWithSellerDates(appointmentId, status, sellerDates) {
    return await AppointmentRepo.updateWithSellerDates(appointmentId, status, sellerDates);
  }

  async deleteAppointment(appointmentId) {
    return await AppointmentRepo.delete(appointmentId);
  }

  async getSellerConfirmedSchedule(sellerId) {
    return await AppointmentRepo.findConfirmedBySellerId(sellerId);
  }
}

module.exports = new AppointmentService();

