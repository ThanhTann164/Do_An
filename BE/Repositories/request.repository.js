const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require("../models/init-models");
const { requests, houses, users } = initModels(sequelize);

class RequestRepository {
  // Tạo request mới
  async create(data) {
    return await requests.create({
      HouseID: data.HouseID,
      BuyerID: data.BuyerID,
      RequestType: data.RequestType,
      Message: data.Message,
      Status: "Pending"
    });
  }

  // Lấy theo Buyer
  async findByBuyer(buyerId) {
    return await requests.findAll({
      where: { BuyerID: buyerId },
      include: [
        { model: houses, as: "House", attributes: ["HouseID", "Title", "Price", "Address", "OwnerID"] }
      ],
      order: [["CreatedAt", "DESC"]]
    });
  }

  // Lấy theo House
  async findByHouse(houseId) {
    return await requests.findAll({
      where: { HouseID: houseId },
      include: [
        { model: users, as: "Buyer", attributes: ["UserID", "FullName", "Email", "PhoneNumber"] }
      ],
      order: [["CreatedAt", "DESC"]]
    });
  }

  // 🔥 Lấy theo Owner (tổng hợp tất cả nhà của chủ nhà)
async findByOwner(ownerId) {
  return await requests.findAll({
    include: [
      {
        model: houses,
        as: "House", 
        where: { OwnerID: ownerId },
        attributes: ["HouseID", "Title", "Price", "Address", "OwnerID"]
      },
      {
        model: users,
        as: "Buyer", 
        attributes: ["UserID", "FullName", "Email", "PhoneNumber"]
      }
    ],
    order: [["CreatedAt", "DESC"]] 
  });
}


  // Lấy chi tiết 1 request (kèm House & Buyer)
  async findByIdDetailed(requestId) {
    return await requests.findByPk(requestId, {
      include: [
        { model: houses, as: "House", attributes: ["HouseID", "Title", "OwnerID"] },
        { model: users, as: "Buyer", attributes: ["UserID", "FullName", "Email", "PhoneNumber"] }
      ]
    });
  }

  // Cập nhật trạng thái (trả về bản ghi sau khi cập nhật)
  async updateStatus(requestId, status) {
    const req = await requests.findByPk(requestId);
    if (!req) return null;
    req.Status = status;
    await req.save();
    return req;
  }

  // Người mua hủy yêu cầu của chính mình (chỉ khi Pending)
async cancelByBuyer(requestId, buyerId) {
  const req = await requests.findOne({ where: { RequestID: requestId } });

  if (!req) {
    console.log("❌ Không tìm thấy request:", requestId);
    return null;
  }

  console.log("🔍 Request tìm thấy:", {
    RequestID: req.RequestID,
    BuyerID_db: req.BuyerID,
    BuyerID_input: buyerId,
    Status: req.Status
  });

  if (Number(req.BuyerID) !== Number(buyerId)) {
    console.log("❌ Sai BuyerID: DB =", req.BuyerID, " | Input =", buyerId);
    throw new Error("Bạn không có quyền hủy yêu cầu này");
  }

  if (req.Status !== "Pending") {
    console.log("❌ Trạng thái không hợp lệ để hủy:", req.Status);
    throw new Error("Chỉ được hủy khi trạng thái là Pending");
  }

  req.Status = "Cancelled";
  await req.save();
  console.log("✅ Hủy thành công:", req.RequestID);

  return req;
}


  
}

module.exports = new RequestRepository();
