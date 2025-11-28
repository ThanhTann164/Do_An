const SellerUpgradeRepo = require("../Repositories/sellerUpgrade.repository");
const MailService = require("./mail.service");
const crypto = require("crypto");
const { encryptPrivateKey, decryptPrivateKey } = require("../Utils/certificateEncryption");
const {  createFolder, uploadFileBuffer, deleteFile, getFolderIdFromFileLink, extractFileIdFromLink} = require("../utils/drive");
const UserRepository = require("../repositories/user.repository");

class SellerUpgradeService {
  // 📝 Buyer gửi request + upload giấy tờ
async requestUpgrade(buyerId, files) {
  if (!files || !files.length) throw new Error("Vui lòng upload giấy tờ");
  let request = await SellerUpgradeRepo.createOrUpdateRequest(buyerId);
  let folderId = request.FolderId;
  const folderName = `Request_${buyerId}_${request.RequestID}`;

  if (!folderId) {
    folderId = await createFolder(folderName, process.env.DRIVE_FOLDER_ID_REQUEST);
    request.FolderId = folderId;
    await request.save({ fields: ["FolderId"] });
  }

  const uploadedDocs = [];
  for (const f of files) {
    const documentType = f.fieldname; 
    const newFileName = `${buyerId}_${documentType}_${Date.now()}_${f.originalname}`;
    const existingDoc = await SellerUpgradeRepo.getUserDocument(
      buyerId,
      request.RequestID,
      documentType
    );
    if (existingDoc?.FilePath) {
      const oldFileId = extractFileIdFromLink(existingDoc.FilePath);
      if (oldFileId) await deleteFile(oldFileId);
    }
    const gFile = await uploadFileBuffer(
      f.buffer,
      newFileName,
      folderId,
      f.mimetype
    );
    const fileHash = crypto.createHash("sha256").update(f.buffer).digest("hex");
    const doc = await SellerUpgradeRepo.createOrUpdateUserDocument({
      UserID: buyerId,
      RequestID: request.RequestID,
      DocumentType: documentType,
      FileName: newFileName,
      FilePath: gFile.webViewLink,
      FileHash: fileHash,
      Status: "Pending",
      UploadedAt: new Date(),
      Notes: null
    });

    uploadedDocs.push(doc);
  }

  return { request, uploadedDocs };
}

  // ✅ Admin duyệt request + tạo hợp đồng
async approveRequest(requestId, contractContent, adminId) {
  console.log(`\n🚀 ========== APPROVING REQUEST ${requestId} ==========`);
  console.log(`📋 Request ID: ${requestId}`);
  console.log(`👤 Admin ID: ${adminId}`);
  console.log(`📄 Contract Content provided: ${contractContent ? 'Yes' : 'No (will use default)'}`);
  
  const req = await SellerUpgradeRepo.getRequestById(requestId);
  if (!req) {
    console.error(`❌ Request ${requestId} not found!`);
    throw new Error("Request không tồn tại");
  }
  
  console.log(`👤 Buyer ID: ${req.BuyerID}`);
  console.log(`📧 Buyer Email: ${req.Buyer?.Email}`);
  console.log(`👤 Buyer Name: ${req.Buyer?.FullName}`);

  console.log(`📝 Updating request status to Approved...`);
  await SellerUpgradeRepo.updateRequestStatus(requestId, "Approved");
  console.log(`✅ Request status updated`);
  
  console.log(`📝 Updating user documents status...`);
  await SellerUpgradeRepo.updateUserDocumentsStatus(requestId, "Approved", adminId);
  console.log(`✅ Documents status updated`);

  // Kiểm tra xem đã có certificate chưa
  let certificate = await SellerUpgradeRepo.getCertificateByUserId(req.BuyerID);
  
  if (!certificate) {
    // Generate RSA key pair mới
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Format public key (loại bỏ dấu ngoặc kép và format lại)
    const formattedPublicKey = publicKey.trim().replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n');
    
    // Encrypt private key trước khi lưu vào database
    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    
    certificate = await SellerUpgradeRepo.createCertificate(
      req.BuyerID,
      "Viettel-CA",
      formattedPublicKey,
      encryptedPrivateKey // Lưu encrypted private key
    );
  }

  // Tạo default contract content nếu không có
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const defaultContent = contractContent || `
═══════════════════════════════════════════════════════════════
                    HỢP ĐỒNG MÔI GIỚI BẤT ĐỘNG SẢN
═══════════════════════════════════════════════════════════════

Căn cứ Luật Kinh doanh bất động sản số 66/2014/QH13 và các văn bản hướng dẫn thi hành;
Căn cứ nhu cầu và khả năng của các bên;

Hôm nay, ngày ${formattedDate}, chúng tôi gồm:

BÊN A (BÊN MÔI GIỚI): ${req.Buyer?.FullName || 'N/A'}
   - CMND/CCCD: Đã được xác minh
   - Địa chỉ email: ${req.Buyer?.Email || 'N/A'}
   - Vai trò: Seller (Người bán/Chủ sở hữu BĐS)
   - Sau đây gọi là "Bên A"

BÊN B (CÔNG TY MÔI GIỚI): CÔNG TY TNHH PROPERTY PLATFORM
   - Địa chỉ: Việt Nam
   - Nền tảng: Property Platform
   - Sau đây gọi là "Bên B"

Hai bên thống nhất ký kết Hợp đồng môi giới bất động sản với các điều khoản sau:

───────────────────────────────────────────────────────────────
ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG
───────────────────────────────────────────────────────────────

1.1. Bên A đồng ý sử dụng dịch vụ môi giới bất động sản của Bên B thông qua nền tảng Property Platform.

1.2. Bên B cung cấp dịch vụ môi giới bất động sản, bao gồm:
   - Tư vấn, hỗ trợ Bên A trong việc đăng tin, quảng bá bất động sản
   - Kết nối Bên A với khách hàng có nhu cầu mua/thuê bất động sản
   - Hỗ trợ thủ tục pháp lý, đàm phán giao dịch
   - Quản lý và theo dõi các giao dịch bất động sản

───────────────────────────────────────────────────────────────
ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A
───────────────────────────────────────────────────────────────

2.1. Quyền của Bên A:
   - Được sử dụng các dịch vụ môi giới bất động sản trên nền tảng
   - Được quản lý và theo dõi các giao dịch của mình
   - Được tư vấn, hỗ trợ về pháp lý và nghiệp vụ môi giới
   - Được yêu cầu Bên B hỗ trợ giải quyết tranh chấp phát sinh

2.2. Nghĩa vụ của Bên A:
   - Cung cấp thông tin chính xác, đầy đủ về bất động sản được đăng bán/thuê
   - Cung cấp đầy đủ giấy tờ chứng minh quyền sở hữu, sử dụng bất động sản hợp pháp
   - Thanh toán phí môi giới theo thỏa thuận khi giao dịch thành công
   - Tuân thủ các quy định của pháp luật về kinh doanh bất động sản
   - Tuân thủ các quy định, điều khoản sử dụng của nền tảng Property Platform
   - Chịu trách nhiệm về tính pháp lý, tính chính xác của thông tin bất động sản

───────────────────────────────────────────────────────────────
ĐIỀU 3: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B
───────────────────────────────────────────────────────────────

3.1. Quyền của Bên B:
   - Được nhận phí môi giới khi giao dịch thành công theo thỏa thuận
   - Được yêu cầu Bên A cung cấp đầy đủ thông tin, giấy tờ về bất động sản
   - Được kiểm tra, xác minh tính pháp lý của bất động sản
   - Được từ chối cung cấp dịch vụ nếu Bên A vi phạm hợp đồng

3.2. Nghĩa vụ của Bên B:
   - Cung cấp dịch vụ môi giới bất động sản chuyên nghiệp, uy tín
   - Bảo mật thông tin của Bên A và các giao dịch
   - Hỗ trợ Bên A trong quá trình đàm phán, ký kết hợp đồng mua bán/thuê
   - Chịu trách nhiệm về hoạt động môi giới của mình theo quy định pháp luật

───────────────────────────────────────────────────────────────
ĐIỀU 4: PHÍ MÔI GIỚI
───────────────────────────────────────────────────────────────

4.1. Phí môi giới được tính dựa trên giá trị giao dịch thành công:
   - Đối với giao dịch mua bán: 2% - 3% trên giá bán cuối cùng
   - Đối với giao dịch cho thuê: 1 tháng tiền thuê (tùy thỏa thuận)
   - Mức phí cụ thể sẽ được thỏa thuận riêng cho từng giao dịch

4.2. Thời điểm thanh toán phí môi giới:
   - Thanh toán sau khi giao dịch mua bán/thuê được hoàn tất
   - Thanh toán trong vòng 07 ngày kể từ ngày nhận tiền từ khách hàng

4.3. Phương thức thanh toán:
   - Chuyển khoản ngân hàng
   - Hoặc phương thức khác do hai bên thỏa thuận

───────────────────────────────────────────────────────────────
ĐIỀU 5: TRÁCH NHIỆM PHÁP LÝ
───────────────────────────────────────────────────────────────

5.1. Bên A chịu hoàn toàn trách nhiệm về:
   - Tính pháp lý, tính chính xác của thông tin bất động sản
   - Quyền sở hữu, sử dụng bất động sản hợp pháp
   - Các tranh chấp phát sinh liên quan đến bất động sản
   - Vi phạm cam kết, gây thiệt hại cho Bên B hoặc khách hàng

5.2. Bên B chịu trách nhiệm về:
   - Chất lượng dịch vụ môi giới được cung cấp
   - Hoạt động môi giới tuân thủ quy định pháp luật
   - Bảo mật thông tin khách hàng

───────────────────────────────────────────────────────────────
ĐIỀU 6: GIẢI QUYẾT TRANH CHẤP
───────────────────────────────────────────────────────────────

6.1. Trong quá trình thực hiện hợp đồng, nếu có tranh chấp phát sinh, hai bên ưu tiên giải quyết bằng thương lượng, hòa giải.

6.2. Nếu không giải quyết được bằng thương lượng, hai bên có quyền khởi kiện tại Tòa án có thẩm quyền theo quy định pháp luật.

6.3. Hợp đồng này được lập và thực hiện theo pháp luật Việt Nam.

───────────────────────────────────────────────────────────────
ĐIỀU 7: ĐIỀU KHOẢN CHUNG
───────────────────────────────────────────────────────────────

7.1. Hợp đồng này có hiệu lực kể từ ngày Bên A ký và được Bên B xác nhận.

7.2. Thời hạn hợp đồng: Không xác định thời hạn, có thể chấm dứt khi một trong hai bên thông báo bằng văn bản.

7.3. Mọi thay đổi, bổ sung hợp đồng phải được lập bằng văn bản và có chữ ký của hai bên.

7.4. Trường hợp có điều khoản mâu thuẫn giữa hợp đồng này và các quy định pháp luật, thì áp dụng quy định pháp luật.

───────────────────────────────────────────────────────────────
ĐIỀU 8: CAM KẾT
───────────────────────────────────────────────────────────────

8.1. Bên A cam kết:
   - Cung cấp thông tin đúng, đầy đủ về bất động sản
   - Thanh toán đầy đủ, đúng hạn phí môi giới
   - Tuân thủ quy định pháp luật và quy định của nền tảng

8.2. Bên B cam kết:
   - Cung cấp dịch vụ môi giới chuyên nghiệp, hiệu quả
   - Bảo mật thông tin khách hàng
   - Hỗ trợ tận tình trong quá trình giao dịch

───────────────────────────────────────────────────────────────

Hợp đồng được lập thành 02 (hai) bản, mỗi bên giữ 01 (một) bản có giá trị pháp lý như nhau.

Mã yêu cầu: ${requestId}
Ngày tạo: ${formattedDate}

                              BÊN A (SELLER)                    BÊN B (CÔNG TY MÔI GIỚI)

                          [Chữ ký điện tử]                   [Chữ ký điện tử của hệ thống]

═══════════════════════════════════════════════════════════════
  `;

  const contract = await SellerUpgradeRepo.createContract(
    null, // No transaction for seller upgrade
    defaultContent,
    "SellerUpgrade"
  );
  
  
  // Generate OTP 6 số để ký hợp đồng
  console.log(`\n🔐 ========== GENERATING OTP ==========`);
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  console.log(`📧 Generating OTP for Buyer ${req.BuyerID} (${req.Buyer?.Email}): ${otp}`);
  
  if (!req.BuyerID) {
    console.error(`❌ ERROR: req.BuyerID is null/undefined!`);
    throw new Error('BuyerID không hợp lệ');
  }
  
  if (!otp || otp.length !== 6) {
    console.error(`❌ ERROR: OTP invalid! OTP: ${otp}`);
    throw new Error('OTP không hợp lệ');
  }
 
  // Lưu OTP vào database (expires in 10 minutes)
  console.log(`💾 Calling setContractOtp for user ${req.BuyerID}...`);
  try {
    const saveResult = await UserRepository.setContractOtp(req.BuyerID, otp);
    console.log(`✅ OTP saved to database successfully!`, saveResult);
  } catch (saveErr) {
    console.error(`❌ CRITICAL: Failed to save OTP to database!`, saveErr);
    throw new Error(`Không thể lưu OTP vào database: ${saveErr.message}`);
  }
  
  // Gửi email với OTP
  try {
    console.log(`📧 Attempting to send email to ${req.Buyer.Email}...`);
    await MailService.sendContractEmailWithOtp(
      req.Buyer.Email,
      req.Buyer.FullName,
      requestId, 
      otp
    );
    console.log(`✅ Email with OTP sent successfully to ${req.Buyer.Email}`);
  } catch (emailErr) {
    console.error('❌ Error sending email with OTP:', emailErr);
    console.error('Email error details:', emailErr.message);
    // Throw error để admin biết có vấn đề
    throw new Error(`Đã duyệt yêu cầu nhưng không thể gửi email OTP. Lỗi: ${emailErr.message}. Vui lòng kiểm tra email config hoặc liên hệ buyer với OTP: ${otp}`);
  }

  return { contract, certificate, otp };
}

// 🔐 Verify OTP để xem/ký hợp đồng (không clear OTP, sẽ clear khi fetch contract)
async verifyOtpForContract(buyerId, otp) {
  const result = await UserRepository.verifyContractOtp(buyerId, otp, false);
  if (!result.valid) {
    throw new Error(result.message);
  }
  return { success: true, message: result.message };
}


 // 📄 Buyer xem contract để ký (yêu cầu OTP)
async getContractByRequest(requestId, buyerId, otp) {
  const req = await SellerUpgradeRepo.getRequestById(requestId);
  if (!req) throw new Error("Request không tồn tại");
  if (req.BuyerID !== buyerId) throw new Error("Bạn không có quyền xem hợp đồng này");
  if (req.Status !== "Approved") throw new Error("Request chưa được duyệt");
  
  // Verify OTP trước khi cho xem hợp đồng (không clear ngay)
  if (!otp) throw new Error("Vui lòng nhập mã OTP");
  const verifyResult = await UserRepository.verifyContractOtp(buyerId, otp, false);
  if (!verifyResult.valid) {
    throw new Error(verifyResult.message);
  }
  
  // Get contract linked to this buyer
  const contract = await SellerUpgradeRepo.getContractByBuyerId(buyerId);
  if (!contract) throw new Error("Chưa có hợp đồng để ký");
  
  // Get certificate
  let certificate = await SellerUpgradeRepo.getCertificateByUserId(buyerId);
  if (!certificate) throw new Error("Chưa có chứng thư số");
  
  // Kiểm tra xem private key có hợp lệ không
  // Nếu là plaintext (backward compatibility) hoặc không thể decrypt -> regenerate
  let needsRegenerate = false;
  if (!certificate.PrivateKeyEncrypted) {
    needsRegenerate = true;
  } else {
    try {
      // Thử decrypt để kiểm tra key có hợp lệ không
      decryptPrivateKey(certificate.PrivateKeyEncrypted);
    } catch (err) {
      console.log(`⚠️ Certificate ${certificate.CertificateID} có private key không hợp lệ:`, err.message);
      needsRegenerate = true;
    }
  }
  
  if (needsRegenerate) {
    console.log(`⚠️ Regenerating certificate ${certificate.CertificateID}...`);
    
    // Generate RSA key pair mới
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    // Encrypt private key trước khi lưu
    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    
    // Update certificate với key mới (đã encrypt)
    certificate = await SellerUpgradeRepo.updateCertificate(
      certificate.CertificateID,
      publicKey,
      encryptedPrivateKey
    );
  }
  
  // Clear OTP sau khi fetch contract thành công
  await UserRepository.verifyContractOtp(buyerId, otp, true);
  
  return { contract, certificate };
}

// ✍️ Buyer ký hợp đồng
async signContract(contractId, buyerId, certificateId) {
  const contract = await SellerUpgradeRepo.updateContractStatus(contractId, "Sent");
  if (!contract) throw new Error("Contract không tồn tại");

  // Lấy certificate từ DB để lấy private key
  let certificate = await SellerUpgradeRepo.getCertificateById(certificateId);
  if (!certificate) throw new Error("Certificate không tồn tại");
  if (certificate.UserID !== buyerId) throw new Error("Certificate không thuộc về bạn");

  // Kiểm tra và regenerate private key nếu không hợp lệ
  let needsRegenerate = false;
  if (!certificate.PrivateKeyEncrypted) {
    needsRegenerate = true;
  } else {
    try {
      // Thử decrypt để kiểm tra key có hợp lệ không
      decryptPrivateKey(certificate.PrivateKeyEncrypted);
    } catch (err) {
      console.log(`⚠️ Certificate ${certificate.CertificateID} có private key không hợp lệ:`, err.message);
      needsRegenerate = true;
    }
  }
  
  if (needsRegenerate) {
    console.log(`⚠️ Regenerating certificate ${certificate.CertificateID}...`);
    
    // Generate RSA key pair mới
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    
    // Encrypt private key trước khi lưu
    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    
    // Update certificate với key mới (đã encrypt)
    certificate = await SellerUpgradeRepo.updateCertificate(
      certificate.CertificateID,
      publicKey,
      encryptedPrivateKey
    );
  }

  const signedData = JSON.stringify({
    contractId,
    contentHash: crypto.createHash("sha256").update(contract.ContractContent).digest("hex"),
    timestamp: Date.now(),
  });

  // Decrypt private key từ DB trước khi sử dụng
  const encryptedPrivateKey = certificate.PrivateKeyEncrypted;
  const privateKeyPem = decryptPrivateKey(encryptedPrivateKey);
  
  let signatureBuffer;
  try {
    const sign = crypto.createSign("SHA256");
    sign.update(signedData);
    sign.end();
    signatureBuffer = sign.sign(privateKeyPem);
  } catch (err) {
    console.error('❌ Lỗi khi ký với private key:', err.message);
    throw new Error(`Không thể ký hợp đồng: ${err.message}. Vui lòng liên hệ admin để regenerate certificate.`);
  }

  const signatureHash = crypto.createHash("sha256").update(signatureBuffer).digest("hex");

  const signature = await SellerUpgradeRepo.signTarget(
    buyerId,
    certificateId,
    "Contract",
    contractId,
    signedData,
    signatureHash 
  );

  await SellerUpgradeRepo.updateContractStatus(contractId, "BuyerSigned");
  
  // ✅ Chỉ nâng role sau khi buyer ký hợp đồng
  await SellerUpgradeRepo.updateUserRole(buyerId, "Seller");

  // Lấy thông tin buyer để gửi email
  const getSequelizeInstance = require('../utils/sequelize-instance');
  const { users } = require("../models/init-models")(getSequelizeInstance());
  const buyerInfo = await users.findByPk(buyerId, { attributes: ['Email', 'FullName'] });
  
  // Gửi email với hợp đồng đã ký
  if (buyerInfo) {
    try {
      await MailService.sendSignedContractEmail(
        buyerInfo.Email,
        buyerInfo.FullName,
        contract.ContractContent,
        signatureHash
      );
    } catch (emailErr) {
      console.error('⚠️ Lỗi gửi email hợp đồng đã ký:', emailErr);
      // Không throw error để không ảnh hưởng đến việc ký hợp đồng
    }
  }

  return { 
    message: "Đã ký hợp đồng và nâng role thành Seller", 
    signatureId: signature.SignatureID,
    signatureHash
  };
}
  // 📋 Admin xem chi tiết request kèm giấy tờ
  async getRequestDetails(requestId) {
    const req = await SellerUpgradeRepo.getRequestWithDocuments(requestId);
    if (!req) throw new Error("Request không tồn tại");
    return req;
  }
// ❌ Admin từ chối request
async rejectRequest(requestId, reason, adminId) {
  const req = await SellerUpgradeRepo.getRequestById(requestId);
  if (!req) throw new Error("Request không tồn tại");

  await SellerUpgradeRepo.updateRequestStatus(requestId, "Rejected", reason);
  await SellerUpgradeRepo.updateUserDocumentsStatus(requestId, "Rejected", adminId); 
  return req;
}

// 📑 Admin liệt kê tất cả request nâng cấp Seller
async listAllRequests() {
  return await SellerUpgradeRepo.getAllRequests();
}

// 👤 Buyer xem trạng thái request của chính mình
async getMyRequests(buyerId) {
  const requests = await SellerUpgradeRepo.getRequestsByBuyerId(buyerId);
  return requests.length > 0
    ? requests
    : [{ message: "Bạn chưa gửi yêu cầu nâng cấp Seller nào." }];
}

}

module.exports = new SellerUpgradeService();
