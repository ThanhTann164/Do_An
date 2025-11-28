const RequestRepo = require("../repositories/request.repository");

const VALID_STATUS = ["Pending", "Approved", "Rejected", "Cancelled"];

class RequestService {
  async createRequest(data) {
    return await RequestRepo.create(data);
  }

  async getRequestsByBuyer(buyerId) {
    return await RequestRepo.findByBuyer(buyerId);
  }

  async getRequestsByHouse(houseId) {
    return await RequestRepo.findByHouse(houseId);
  }

  // 🔥 Lấy tất cả yêu cầu gửi đến các căn nhà của 1 Owner
  async getRequestsByOwner(ownerId) {
    return await RequestRepo.findByOwner(ownerId);
  }

  // 🔥 Chủ nhà cập nhật trạng thái (có xác thực quyền sở hữu nếu truyền ownerId)
  async changeStatus(requestId, status, ownerId) {
  const VALID_STATUS = ["Pending", "Approved", "Rejected", "Cancelled"];
  if (!VALID_STATUS.includes(status)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const request = await RequestRepo.findByIdDetailed(requestId);
  if (!request) throw new Error("Không tìm thấy yêu cầu");

  if (ownerId && request.House.OwnerID !== Number(ownerId)) {
    throw new Error("Bạn không có quyền xử lý yêu cầu này");
  }

  if (request.Status !== "Pending") {
    throw new Error(`Không thể cập nhật vì hiện tại là ${request.Status}`);
  }

  return await RequestRepo.updateStatus(requestId, status);
}


  // 🔥 Người mua hủy yêu cầu của chính mình (chỉ khi Pending)
  async cancelRequest(requestId, buyerId) {
    const current = await RequestRepo.findByIdDetailed(requestId);
    if (!current) throw new Error("Không tìm thấy yêu cầu");
    if (current.BuyerID !== Number(buyerId)) {
      throw new Error("Bạn không có quyền hủy yêu cầu này");
    }
    if (current.Status !== "Pending") {
      throw new Error(`Không thể hủy vì trạng thái hiện tại là ${current.Status}`);
    }
    return await RequestRepo.cancelByBuyer(requestId, buyerId);
  }
}

module.exports = new RequestService();
