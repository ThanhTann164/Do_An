const UserRepo = require("../repositories/user.repository");

class UserService {
  async login(email, password) {
    return await UserRepo.findByEmailAndPassword(email, password);
  }

  async getUserByEmail(email) {
    return await UserRepo.findByEmail(email);
  }

  async register(userData) {
    return await UserRepo.createUser(userData);
  }

  async changePassword(email, newPassword) {
    return await UserRepo.updatePassword(email, newPassword);
  }

  async updateProfile(userId, fullName, email, phoneNumber) {
    return await UserRepo.updateProfile(userId, fullName, email, phoneNumber);
  }

  async updateUserStatus(userId, status) {
    return await UserRepo.updateUserStatus(userId, status);
  }

  async getAllSellers() {
    return await UserRepo.findAllSellers();
  }

  async getAllBuyers() {
    return await UserRepo.findAllBuyers();
  }
}

module.exports = new UserService();
