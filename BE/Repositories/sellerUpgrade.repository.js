// repositories/sellerUpgrade.repository.js
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require("../models/init-models");
const {
  requests,
  contracts,
  contractsignatures,
  users,
  digitalcertificates,
  userdocuments,
} = initModels(sequelize);

class SellerUpgradeRepository {
  
  // Tạo hoặc update request nâng cấp Seller
async createOrUpdateRequest(buyerId) {
  const existing = await requests.findOne({
    where: { BuyerID: buyerId, RequestType: "UpgradeToSeller" },
    order: [["CreatedAt", "DESC"]],
  });

  if (existing && existing.Status === "Rejected") {
    existing.Status = "Pending";
    existing.Message = "Muốn trở thành Seller (gửi lại sau khi bị từ chối)";
    existing.updatedAt = new Date();
    await existing.save();
    return existing;
  }

  return await requests.create({
    BuyerID: buyerId,
    RequestType: "UpgradeToSeller",
    Message: "Muốn trở thành Seller",
    Status: "Pending",
    CreatedAt: new Date(),
    updatedAt: new Date(),
  });
}

// Lấy tài liệu theo userId, requestId, documentType
async getUserDocument(userId, requestId, documentType) {
  return await userdocuments.findOne({
    where: {
      UserID: userId,
      RequestID: requestId,
      DocumentType: documentType,
    },
  });
}

// 📝 Tạo hoặc update giấy tờ người dùng
  async createOrUpdateUserDocument(doc) {
    const existingDoc = await userdocuments.findOne({
      where: {
        UserID: doc.UserID,
        DocumentType: doc.DocumentType,
        RequestID: doc.RequestID,
      },
    });

    if (existingDoc) {
      return await existingDoc.update({
        FileName: doc.FileName,
        FilePath: doc.FilePath,
        FileHash: doc.FileHash,
        Status: "Pending",
        UploadedAt: new Date(),
      });
    } else {
      return await userdocuments.create({
        UserID: doc.UserID,
        DocumentType: doc.DocumentType,
        FileName: doc.FileName,
        FilePath: doc.FilePath,
        FileHash: doc.FileHash,
        Status: "Pending",
        UploadedAt: new Date(),
        RequestID: doc.RequestID,
      });
    }
  }

  // 🔍 Lấy request kèm Buyer
  async getRequestById(requestId) {
    return await requests.findByPk(requestId, {
      include: [{ model: users, as: "Buyer", attributes: ["UserID", "FullName", "Email"] }],
    });
  }

  async updateRequestStatus(requestId, status, reason = null) {
    const validStatus = ["Pending", "Approved", "Rejected", "Cancelled"];
    if (!validStatus.includes(status)) throw new Error("Status không hợp lệ");

    const req = await requests.findByPk(requestId);
    if (!req) throw new Error("Request không tồn tại");
    req.setDataValue("Status", status);
    if (reason !== null) req.Message = reason;

    try {
      await req.save({ fields: ["Status", "Message"] });
    } catch (err) {
      console.error("💥 Sequelize save error:", err);
      throw err;
    }
    return req;
  }
async createRequest(buyerId) {
  return await requests.create({
    BuyerID: buyerId,
    RequestType: "UpgradeToSeller",
    Message: "Muốn trở thành Seller",
    Status: "Pending",
    CreatedAt: new Date(),
    updatedAt: new Date(),
  });
}
async updateUserDocumentsStatus(requestId, status) {
  const validStatus = ["Approved", "Rejected"];
  if (!validStatus.includes(status)) throw new Error("Status tài liệu không hợp lệ");

  const docs = await userdocuments.findAll({ where: { RequestID: requestId } });
  if (!docs || docs.length === 0) return [];

  const now = new Date();
  for (const doc of docs) {
    doc.Status = status;
    doc.VerifiedAt = now;
    await doc.save({ fields: ["Status", "VerifiedAt"] });
  }
  return docs;
}
  // 🔍 Lấy request kèm tài liệu đính kèm
  async getRequestWithDocuments(requestId) {
    return await requests.findByPk(requestId, {
      include: [
        { model: users, as: "Buyer", attributes: ["UserID", "FullName", "Email"] },
        { model: userdocuments, as: "userdocuments" },
      ],
    });
  }

  // 📄 Hợp đồng
  async createContract(transactionId, contractContent, contractType = "SellerUpgrade") {
    const contractData = {
      ContractContent: contractContent,
      ContractType: contractType,
      Status: "Sent",
    };
    
    // Only add TransactionID if it exists
    if (transactionId) {
      contractData.TransactionID = transactionId;
    }
    
    return await contracts.create(contractData);
  }

  async updateContractStatus(contractId, status) {
    const c = await contracts.findByPk(contractId);
    if (!c) return null;
    c.Status = status;
    await c.save();
    return c;
  }

  // 🔑 Chứng thư số
  async createCertificate(userId, provider, publicKey, privateKeyEncrypted) {
    return await digitalcertificates.create({
      UserID: userId,
      Provider: provider || "Viettel-CA",
      PublicKey: publicKey,
      PrivateKeyEncrypted: privateKeyEncrypted,
      Status: "Active",
      ValidFrom: new Date(),
      ValidTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });
  }

  // ✍️ Chữ ký
  async signTarget(userId, certificateId, targetType, targetId, signedData, signatureHash) {
    return await contractsignatures.create({
      ContractID: targetId,
      UserID: userId,
      CertificateID: certificateId,
      TargetType: targetType,
      TargetID: targetId,
      SignedData: signedData,
      SignatureHash: signatureHash,
      VerifiedStatus: "Pending",
      SignedAt: new Date(),
    });
  }

  async getSignatureById(signatureId) {
    return await contractsignatures.findByPk(signatureId);
  }

  async updateSignatureVerification(signatureId, status) {
    const sig = await contractsignatures.findByPk(signatureId);
    if (!sig) return null;
    sig.VerifiedStatus = status;
    await sig.save();
    return sig;
  }

  // 👤 Cập nhật role người dùng
  async updateUserRole(userId, role) {
  return await users.update(
    { Role: role },
    { where: { UserID: userId } }
  );
}


// 🔍 Lấy tất cả request UpgradeToSeller
async getAllRequests() {
  return await requests.findAll({
    where: { RequestType: "UpgradeToSeller" },
    include: [
      { 
        model: users, 
        as: "Buyer", 
        attributes: ["UserID", "FullName", "Email", "Role"] 
      },
      { 
        model: userdocuments, 
        as: "userdocuments"   
      }
    ],
    order: [["CreatedAt", "DESC"]],
  });
}
// 🔍 Lấy tất cả request của Buyer hiện tại
async getRequestsByBuyerId(buyerId) {
  return await requests.findAll({
    where: {
      BuyerID: buyerId,
      RequestType: "UpgradeToSeller",
    },
    include: [
      { model: userdocuments, as: "userdocuments" }
    ],
    order: [["CreatedAt", "DESC"]],
  });
}

// 📄 Lấy contract của buyer (contract mới nhất chờ ký)
async getContractByBuyerId(buyerId) {
  // Lấy certificate của buyer để tìm contract được tạo gần thời điểm đó
  const certificate = await digitalcertificates.findOne({
    where: { UserID: buyerId },
    order: [["ValidFrom", "DESC"]],
  });
  
  if (!certificate) return null;
  
  // Lấy contract mới nhất với type SellerUpgrade và status Sent
  return await contracts.findOne({
    where: { 
      ContractType: "SellerUpgrade",
      Status: "Sent"
    },
    order: [["ContractID", "DESC"]],
  });
}

// 🔑 Lấy certificate của user
async getCertificateByUserId(userId) {
  return await digitalcertificates.findOne({
    where: { 
      UserID: userId,
      Status: "Active"
    },
    order: [["ValidFrom", "DESC"]],
  });
}

// 🔑 Lấy certificate theo ID
async getCertificateById(certificateId) {
  return await digitalcertificates.findByPk(certificateId);
}

// 🔄 Update certificate với key mới
async updateCertificate(certificateId, publicKey, privateKey) {
  const cert = await digitalcertificates.findByPk(certificateId);
  if (!cert) throw new Error("Certificate không tồn tại");
  
  cert.PublicKey = publicKey;
  cert.PrivateKeyEncrypted = privateKey;
  await cert.save();
  
  return cert;
}

}

module.exports = new SellerUpgradeRepository();
