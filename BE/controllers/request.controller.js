const RequestService = require("../services/request.service");

// Người mua gửi yêu cầu thuê/mua
exports.createRequest = async (req, res) => {
  try {
    const { HouseID, BuyerID, RequestType, Message } = req.body;

    if (!HouseID || !BuyerID || !RequestType) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu bắt buộc" });
    }

    const request = await RequestService.createRequest({ HouseID, BuyerID, RequestType, Message });
    res.status(201).json({ success: true, message: "Yêu cầu đã được gửi", data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Lỗi server khi gửi yêu cầu" });
  }
};

// Buyer xem lịch sử yêu cầu của mình
exports.getRequestsByBuyer = async (req, res) => {
  try {
    const buyerId = req.params.buyerId;
    const list = await RequestService.getRequestsByBuyer(buyerId);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách yêu cầu" });
  }
};

// Chủ nhà xem toàn bộ yêu cầu của 1 căn
exports.getRequestsByHouse = async (req, res) => {
  try {
    const houseId = req.params.houseId;
    const list = await RequestService.getRequestsByHouse(houseId);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách yêu cầu" });
  }
};

// 🔥 Chủ nhà xem tất cả yêu cầu gửi đến các căn của mình
exports.getRequestsByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId; // thường sẽ lấy từ auth: req.user.UserID
    const list = await RequestService.getRequestsByOwner(ownerId);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách yêu cầu theo chủ nhà" });
  }
};

// 🔥 Chủ nhà cập nhật trạng thái yêu cầu
exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status, ownerId } = req.body; // ownerId có thể lấy từ auth thay vì body

    const updated = await RequestService.changeStatus(id, status, ownerId);
    res.json({ success: true, message: "Cập nhật trạng thái thành công", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || "Lỗi khi cập nhật trạng thái" });
  }
};

// 🔥 Buyer hủy yêu cầu của chính mình
exports.cancelRequestByBuyer = async (req, res) => {
  try {
    const id = req.params.id;
    const { BuyerID } = req.body;
    console.log("📩 Cancel request body:", req.body);

    const result = await RequestService.cancelRequest(id, BuyerID);


    if (!result) {
      return res.status(404).json({ success: false, message: "Không tìm thấy yêu cầu" });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("❌ Lỗi khi hủy request:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
