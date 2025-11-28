const HouseRepo = require("../Repositories/house.repository");
const RequestRepo = require("../Repositories/request.repository");

class HouseService {
// 🔍 Xem tất cả houses với phân trang
async getAllHouses(page = 1, pageSize = 10) {
  console.log(`🔍 Service: getAllHouses - page: ${page}, pageSize: ${pageSize}`);
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);
  
  const result = await HouseRepo.findAllWithPagination(offset, limit);
  console.log(`🔍 Service: getAllHouses - result: ${result.data.length} houses, total: ${result.total}`);
  return result;
}
  async getMyHouses(user, page = 1, pageSize = 10) {
    const userId = user.userId || user.userid;
    const userRole = user.role || user.Role;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    let houses;
    
    // Nếu là Seller hoặc Admin: lấy nhà theo OwnerID (nhà đã tạo)
    if (userRole === "Seller" || userRole === "Admin") {
      houses = await HouseRepo.findByOwnerWithPagination(userId, offset, limit);
      
      if (!houses || houses.data.length === 0) {
        return { 
          message: "Chưa có nhà nào được đăng",
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0
        };
      }
    } 
    // Nếu là Buyer: lấy nhà từ transactions (nhà đã mua/ký hợp đồng)
    else if (userRole === "Buyer") {
      houses = await HouseRepo.findByBuyerWithPagination(userId, offset, limit);
      
      if (!houses || houses.data.length === 0) {
        return { 
          message: "Chưa có nhà nào đã mua",
          data: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0
        };
      }
    } 
    // Role khác: không có quyền
    else {
      return { 
        message: "Bạn không có quyền xem danh sách nhà",
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }

    return houses;
  }

  // 🔍 Xem 1 house
  async getHouseById(user, id) {
    return HouseRepo.findById(id);
  }

  // 🔍 Lấy IoT devices theo house ID
  async getIoTDevicesByHouseId(houseId) {
    try {
      const getSequelizeInstance = require('../utils/sequelize-instance');
      const sequelize = getSequelizeInstance();
      const initModels = require('../models/init-models');
      const { iotdevices } = initModels(sequelize);
      
      // Convert houseId to integer to ensure proper matching
      const houseIdInt = parseInt(houseId);
      console.log(`🔍 [getIoTDevicesByHouseId] Looking for devices with HouseID: ${houseIdInt} (type: ${typeof houseIdInt})`);
      
      const devices = await iotdevices.findAll({
        where: { HouseID: houseIdInt },
        attributes: ['DeviceID', 'DeviceName', 'DeviceType', 'Status'],
        order: [['DeviceID', 'ASC']]
      });
      
      console.log(`🔍 [getIoTDevicesByHouseId] Found ${devices.length} devices for house ${houseIdInt}`);
      
      return devices;
    } catch (error) {
      console.error('Error fetching IoT devices for house:', error);
      return [];
    }
  }

  async createHouse(user, data) {
    console.log('🔍 Debug createHouse - user:', JSON.stringify(user));
    console.log('🔍 Debug createHouse - user.role:', user.role);
    console.log('🔍 Debug createHouse - typeof user.role:', typeof user.role);
    
    const userId = user.userId || user.userid;
    console.log('🔍 Debug createHouse - userId:', userId);
    console.log('🔍 Debug createHouse - data:', Object.keys(data));
    
    if (!userId) {
      throw new Error("User ID không tồn tại trong token");
    }
    
    // Lấy role từ user.role hoặc user.roles[0] (kết hợp logic của cả 2 branch)
    const rawRole = user.role || (user.roles && user.roles[0]);
    const userRole = rawRole?.toLowerCase();
    
    console.log('🔍 Debug createHouse - rawRole:', rawRole);
    
    if (userRole !== "admin" && userRole !== "seller") {
      console.error('❌ Permission denied - role:', rawRole);
      throw new Error("Bạn không có quyền tạo nhà. Chỉ Seller và Admin mới có quyền này.");
    }
    
    const houseData = { ...data, OwnerID: userId };
    console.log('🔍 Debug createHouse - houseData.OwnerID:', houseData.OwnerID);
    console.log('🔍 Debug createHouse - typeof OwnerID:', typeof houseData.OwnerID);
    
    return HouseRepo.create(houseData);
  }

  // ✏️ Update house (Admin toàn quyền, Seller chỉ sửa house của mình)
  async updateHouse(user, id, data) {
    const house = await HouseRepo.findById(id);
    if (!house) throw new Error("Không tìm thấy nhà");

    const requesterId = Number(user.userId || user.userid);
    if (user.role === "Admin" || (user.role === "Seller" && Number(house.OwnerID) === requesterId)) {
        return HouseRepo.update(id, data);
    }
    throw new Error("Bạn không có quyền sửa nhà này");
  }

  // 🗑 Delete house (Admin toàn quyền, Seller chỉ xóa house của mình)
  async deleteHouse(user, id) {
    const house = await HouseRepo.findById(id);
    if (!house) throw new Error("Không tìm thấy nhà");

    const requesterId = Number(user.userId || user.userid);
    console.log('[deleteHouse] role:', user.role, 'requesterId:', requesterId, 'typeof requesterId:', typeof requesterId);
    console.log('[deleteHouse] house.OwnerID:', house.OwnerID, 'typeof OwnerID:', typeof house.OwnerID);
    console.log('[deleteHouse] equal? ', Number(house.OwnerID) === requesterId);
    if (user.role === "Admin" || (user.role === "Seller" && Number(house.OwnerID) === requesterId)) {
      return HouseRepo.delete(id);
    }

    throw new Error("Bạn không có quyền xóa nhà này");
  }

  // 🔎 Search house với phân trang
async searchHouse(user, minPrice, maxPrice, address, page = 1, pageSize = 10) {
  console.log(`🔍 Service: searchHouse - page: ${page}, pageSize: ${pageSize}, address: ${address}, minPrice: ${minPrice}, maxPrice: ${maxPrice}`);
  const offset = (page - 1) * pageSize;
  const limit = parseInt(pageSize);
  
  const result = await HouseRepo.searchWithPagination({ 
    minPrice, 
    maxPrice, 
    keyword: address,
    offset,
    limit 
  });
  console.log(`🔍 Service: searchHouse - result: ${result.data.length} houses, total: ${result.total}`);
  return result;
}

  // 📩 Buyer gửi request (chỉ Buyer)
  async createRequest(user, data) {
    if (user.role !== "Buyer") {
      throw new Error("Chỉ Buyer mới được gửi yêu cầu");
    }

    return await RequestRepo.create({
      HouseID: data.houseId,
      BuyerID: user.userId,
      RequestType: data.requestType,
      Message: data.message
    });
  }

  // 📋 Seller xem request cho house của mình
  async getRequestsForSeller(user, houseId) {
    if (user.role !== "Seller" && user.role !== "Admin") {
      throw new Error("Bạn không có quyền xem request");
    }

    const house = await HouseRepo.findById(houseId);
    if (!house) throw new Error("Không tìm thấy nhà");

    if (user.role === "Admin" || house.OwnerID === user.userId) {
      return await RequestRepo.findByHouse(houseId);
    }
    throw new Error("Bạn không có quyền xem request của nhà này");
  }

  async setCoverImage(user, imageId) {
    if (user.role !== "Admin" && user.role !== "Seller") {
      throw new Error("Bạn không có quyền đặt ảnh bìa");
    }
    return await HouseRepo.setAsCover(imageId, user.userId, user.role === "Admin");
  }

  async deleteImage(imageId, userId, isAdmin = false) {
    return HouseRepo.deleteImage(imageId, userId, isAdmin);
  }
}

module.exports = new HouseService();