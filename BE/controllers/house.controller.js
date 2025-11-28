const HouseService = require("../Services/house.service");
const HouseRepository = require("../Repositories/house.repository");

// Tạo nhà
exports.createHouse = async (req, res) => {
  try {
    const data = { ...req.body, images: req.files };
    const result = await HouseService.createHouse(req.user, data);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cập nhật nhà
exports.updateHouse = async (req, res) => {
  try {
    const data = {
      ...req.body,
      images: req.files,
      deletedImageIds: req.body.deletedImageIds ? JSON.parse(req.body.deletedImageIds) : [],
    };
    const result = await HouseService.updateHouse(req.user, req.params.id, data);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xóa nhà
exports.deleteHouse = async (req, res) => {
  try {
    await HouseService.deleteHouse(req.user, req.params.id);
    res.json({ success: true, message: "House deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy tất cả nhà VỚI PHÂN TRANG
exports.getAllHouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 9;
    
    console.log(`🔍 Controller: getAllHouses - page: ${page}, pageSize: ${pageSize}`);
    
    const result = await HouseService.getAllHouses(page, pageSize); // THÊM THAM SỐ page, pageSize
    
    console.log(`🔍 Controller: getAllHouses - sending response with ${result.data.length} houses, total: ${result.total}`);
    
    res.json({ 
      success: true, 
      data: result.data,
      total: result.total, // THÊM TRƯỜNG total Ở CẤP GỐC để tương thích với frontend cũ
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    console.error('❌ Controller Error in getAllHouses:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// Lấy nhà theo ID
exports.getHouseById = async (req, res) => {
  try {
    const house = await HouseService.getHouseById(null, req.params.id);
    if (!house) return res.status(404).json({ success: false, message: "House not found" });
    
    console.log(`🔍 [getHouseById] House found for ID ${req.params.id}:`, house.dataValues || house);
    
    // Lấy thêm IoT devices cho house này
    const iotDevices = await HouseService.getIoTDevicesByHouseId(req.params.id);
    console.log(`🔍 [getHouseById] IoT devices for house ${req.params.id}:`, iotDevices);
    
    // Convert Sequelize instances to plain objects
    const plainIotDevices = iotDevices.map(device => ({
      DeviceID: device.DeviceID,
      DeviceName: device.DeviceName,
      DeviceType: device.DeviceType,
      Status: device.Status
    }));
    
    console.log(`🔍 [getHouseById] Plain IoT devices:`, plainIotDevices);
    
    // Thêm iotDevices vào response
    const houseWithIoT = {
      ...house.dataValues || house,
      iotDevices: plainIotDevices
    };
    
    console.log(`🔍 [getHouseById] Final response data:`, houseWithIoT);
    
    res.json({ success: true, data: houseWithIoT });
  } catch (err) {
    console.error(`❌ [getHouseById] Error:`, err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Trong house.controller.js
exports.getMyHouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 6;
    
    console.log(`🔍 Controller: getMyHouses - page: ${page}, pageSize: ${pageSize}`);
    
    const result = await HouseService.getMyHouses(req.user, page, pageSize);
    
    res.json({ 
      success: true, 
      data: result.data,
      total: result.total,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Tìm kiếm nhà theo giá và địa chỉ VỚI PHÂN TRANG
exports.searchHouse = async (req, res) => {
  try {
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const address = req.query.address || '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 9;

    console.log(`🔍 Controller: searchHouse - query:`, {
      address, minPrice, maxPrice, page, pageSize
    });

    // Validate parameters
    if (minPrice && (isNaN(minPrice) || parseFloat(minPrice) < 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid minPrice parameter. Please provide a valid numeric value."
      });
    }

    if (maxPrice && (isNaN(maxPrice) || parseFloat(maxPrice) < 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maxPrice parameter. Please provide a valid numeric value."
      });
    }

    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot be greater than maximum price."
      });
    }

    const result = await HouseService.searchHouse(
      req.user, 
      minPrice, 
      maxPrice, 
      address, 
      page, 
      pageSize
    );

    console.log(`🔍 Controller: searchHouse - sending response with ${result.data.length} houses, total: ${result.total}`);

    res.json({
      success: true,
      message: result.data.length > 0 ? `Found ${result.total} house(s)` : "No houses found with the given criteria",
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('❌ Controller Error in searchHouse:', error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while searching houses"
    });
  }
};

// Đặt ảnh làm ảnh bìa
exports.setAsCover = async (req, res) => {
  try {
    const result = await HouseService.setCoverImage(req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xóa ảnh
exports.deleteImage = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === "Admin";
    const userId = req.user ? req.user.userId : null;
    await HouseService.deleteImage(req.params.id, userId, isAdmin);
    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

