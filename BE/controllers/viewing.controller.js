const initModels = require("../models/init-models");
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

const models = initModels(sequelize);
const { houseviewings, houses, users } = models;

// Tạo lịch xem nhà mới
exports.createViewing = async (req, res) => {
  try {
    const { HouseID, ViewingDate } = req.body;
    const UserID = req.user.userId;

    if (!HouseID || !ViewingDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin HouseID hoặc ViewingDate"
      });
    }

    // Kiểm tra nhà có tồn tại
    const house = await houses.findByPk(HouseID);
    if (!house) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhà"
      });
    }

    // Tạo viewing
    const viewing = await houseviewings.create({
      HouseID,
      UserID,
      ViewingDate: new Date(ViewingDate),
      Status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: "Đặt lịch xem nhà thành công",
      data: viewing
    });
  } catch (error) {
    console.error("Error creating viewing:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo lịch xem nhà",
      error: error.message
    });
  }
};

// Lấy danh sách lịch xem nhà của user
exports.getMyViewings = async (req, res) => {
  try {
    const UserID = req.user.userId;

    const viewings = await houseviewings.findAll({
      where: { UserID },
      include: [
        {
          model: houses,
          as: "House",
          attributes: ["HouseID", "Title", "Address", "City"]
        }
      ],
      order: [["ViewingDate", "DESC"]]
    });

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error("Error fetching viewings:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lịch xem nhà",
      error: error.message
    });
  }
};

// Lấy danh sách lịch xem nhà cho một căn nhà (dành cho seller)
exports.getViewingsByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;

    const viewings = await houseviewings.findAll({
      where: { HouseID: houseId },
      include: [
        {
          model: users,
          as: "User",
          attributes: ["UserID", "Username", "Email", "Phone"]
        }
      ],
      order: [["ViewingDate", "DESC"]]
    });

    res.json({
      success: true,
      data: viewings
    });
  } catch (error) {
    console.error("Error fetching house viewings:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lịch xem nhà",
      error: error.message
    });
  }
};

// Cập nhật trạng thái lịch xem nhà
exports.updateViewingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    if (!["PENDING", "CONFIRMED", "CANCELLED"].includes(Status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ"
      });
    }

    const viewing = await houseviewings.findByPk(id);
    if (!viewing) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch xem nhà"
      });
    }

    viewing.Status = Status;
    await viewing.save();

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: viewing
    });
  } catch (error) {
    console.error("Error updating viewing status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái",
      error: error.message
    });
  }
};

module.exports = exports;
