const SellerUpgradeService = require("../Services/sellerUpgrade.service");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
exports.listAllRequests = async (req, res) => {
  try {
    const requests = await SellerUpgradeService.listAllRequests();
    res.json({ success: true, data: requests });
  } catch (err) {
    console.error("❌ listAllRequests error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
// 📝 Buyer gửi request kèm giấy tờ (CCCD front/back + selfie)
exports.requestUpgrade = async (req, res) => {
  try {
    const filesArray = [].concat(
      req.files.CCCD_Front || [],
      req.files.CCCD_Back || [],
      req.files.CCCD_Selfie || []
    );

    if (!filesArray.length) throw new Error("Vui lòng upload đầy đủ giấy tờ");

    const result = await SellerUpgradeService.requestUpgrade(req.user?.userId, filesArray);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 👀 Admin xem chi tiết request + giấy tờ
exports.getRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;
    const data = await SellerUpgradeService.getRequestDetails(requestId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✅ Admin duyệt request và tạo hợp đồng
exports.approveRequest = async (req, res) => {
  console.log(`\n🎯 ========== CONTROLLER: approveRequest CALLED ==========`);
  console.log(`📥 Request Body:`, req.body);
  console.log(`👤 User from token:`, req.user);
  console.log(`🔑 Admin ID from token:`, req.user?.userId);
  
  try {
    const { requestId, contractContent } = req.body;
    const adminId = req.user?.userId; // Lấy admin ID từ token
    
    console.log(`📋 Parsed requestId: ${requestId}`);
    console.log(`📄 ContractContent provided: ${contractContent ? 'Yes' : 'No'}`);
    console.log(`👤 Admin ID: ${adminId}`);
    
    if (!requestId) {
      console.error(`❌ Missing requestId in request body!`);
      return res.status(400).json({ success: false, message: 'Thiếu requestId' });
    }
    
    if (!adminId) {
      console.error(`❌ Missing adminId from token!`);
      return res.status(401).json({ success: false, message: 'Không có quyền admin' });
    }
    
    console.log(`🚀 Calling SellerUpgradeService.approveRequest(${requestId}, ${contractContent ? 'content' : 'null'}, ${adminId})...`);
    
    const result = await SellerUpgradeService.approveRequest(requestId, contractContent, adminId);
    
    console.log(`✅ Service returned successfully:`, result);
    res.json({ success: true, data: result, message: 'Đã duyệt yêu cầu và gửi email với mã OTP' });
  } catch (err) {
    console.error('❌ Error approving request:', err);
    console.error('Error stack:', err.stack);
    res.status(400).json({ success: false, message: err.message });
  }
};

// ❌ Admin từ chối hoặc yêu cầu upload lại
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    const request = await SellerUpgradeService.rejectRequest(requestId, reason);
    res.json({ success: true, request });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 📄 Buyer xem contract để ký (yêu cầu OTP)
exports.getContract = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { otp } = req.query; // OTP từ query string hoặc có thể từ body
    const buyerId = req.user.userId;
    const data = await SellerUpgradeService.getContractByRequest(requestId, buyerId, otp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 🔐 Verify OTP để xem/ký hợp đồng
exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const buyerId = req.user.userId;
    const result = await SellerUpgradeService.verifyOtpForContract(buyerId, otp);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ✍️ Buyer ký hợp đồng
exports.signContract = async (req, res) => {
  try {
    const { contractId, certificateId } = req.body;
    const buyerId = req.user.userId; // 👈 lấy từ decoded token (middleware verifyJWT đã set)

    const result = await SellerUpgradeService.signContract(
      contractId,
      buyerId,
      certificateId
    );

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 👤 Buyer xem trạng thái request của chính mình
exports.getMyRequests = async (req, res) => {
  try {
    const buyerId = req.user.userId; // ✅ Lấy ID người dùng từ token đã đăng nhập
    const data = await SellerUpgradeService.getMyRequests(buyerId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 🖼️ Proxy image từ Google Drive
exports.proxyImage = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { downloadFile } = require("../utils/drive");
    
    const imageBuffer = await downloadFile(fileId);
    
    // Set appropriate content type
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 day
    res.send(imageBuffer);
  } catch (err) {
    console.error('Error proxying image:', err);
    res.status(500).json({ success: false, message: 'Không thể tải ảnh' });
  }
};

