
require("dotenv").config();
const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }
// ✨ Gửi email với OTP để ký hợp đồng
async sendContractEmailWithOtp(to, fullName, contractId, otp) {
  // Validate email config
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error('❌ Gmail config missing! GMAIL_USER or GMAIL_PASS not set in .env');
    throw new Error('Email service chưa được cấu hình. Vui lòng kiểm tra GMAIL_USER và GMAIL_PASS trong .env');
  }
  
  if (!to || !fullName || !otp) {
    console.error('❌ Missing required parameters:', { to, fullName, otp });
    throw new Error('Thiếu thông tin cần thiết để gửi email');
  }
  
  console.log(`📧 Preparing to send OTP email to: ${to}, OTP: ${otp}`);
  
  const contractLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sign-contract/${contractId}`;
  
  const mailOptions = {
    from: `"HomeX Contracts" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Yêu cầu nâng cấp Seller đã được duyệt - Mã OTP ký hợp đồng",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Chúc mừng! Yêu cầu của bạn đã được duyệt</h2>
        
        <p>Chào <strong>${fullName}</strong>,</p>

        <p>Yêu cầu nâng cấp tài khoản từ <strong>Buyer</strong> lên <strong>Seller</strong> của bạn đã được Admin phê duyệt.</p>

        <div style="background-color: #f0f7ff; border-left: 4px solid #0066cc; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0066cc;">🔐 Mã OTP để ký hợp đồng:</h3>
          <p style="font-size: 24px; font-weight: bold; color: #0066cc; letter-spacing: 5px; text-align: center; margin: 10px 0;">
            ${otp}
          </p>
          <p style="font-size: 12px; color: #666; text-align: center;">
            Mã OTP có hiệu lực trong 10 phút
          </p>
        </div>

        <h3>📋 Nội dung hợp đồng:</h3>
        <p>Vui lòng truy cập link dưới đây, nhập mã OTP để xem và ký hợp đồng:</p>
        <p style="text-align: center; margin: 20px 0;">
          <a href="${contractLink}" 
             style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Xem và Ký Hợp Đồng
          </a>
        </p>
        <p style="font-size: 12px; color: #666;">Hoặc copy link: ${contractLink}</p>

        <h3>⚠️ Lưu ý quan trọng:</h3>
        <ul>
          <li>Mã OTP chỉ sử dụng một lần và có hiệu lực trong <strong>10 phút</strong></li>
          <li>Không chia sẻ mã OTP với bất kỳ ai</li>
          <li>Sau khi ký hợp đồng, bạn sẽ nhận được email xác nhận kèm nội dung hợp đồng đã ký</li>
        </ul>

        <p>Trân trọng,<br><strong>HomeX Team</strong></p>
      </div>
    `,
  };

  try {
    console.log(`📧 Sending email via transporter...`);
    const info = await this.transporter.sendMail(mailOptions);
    console.log(`✅ Contract email with OTP sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Accepted: ${info.accepted}`);
    console.log(`📧 Rejected: ${info.rejected}`);
    return info;
  } catch (err) {
    console.error("❌ Error sending contract email with OTP:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Error response:", err.response);
    console.error("Full error:", err);
    throw new Error(`Không thể gửi email OTP. Lỗi: ${err.message || 'Unknown error'}`);
  }
}

// ✨ Gửi email xác nhận với hợp đồng đã ký
async sendSignedContractEmail(to, fullName, contractContent, signatureHash) {
  const mailOptions = {
    from: `"HomeX Contracts" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Xác nhận: Hợp đồng nâng cấp Seller đã được ký thành công",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">✅ Ký hợp đồng thành công!</h2>
        
        <p>Chào <strong>${fullName}</strong>,</p>

        <p>Chúc mừng! Bạn đã ký hợp đồng nâng cấp tài khoản Seller thành công. Tài khoản của bạn đã được nâng cấp lên <strong>Seller</strong>.</p>

        <div style="background-color: #e8f5e9; border-left: 4px solid #27ae60; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #27ae60;">📄 Nội dung hợp đồng đã ký:</h3>
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
            <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; margin: 0;">
${contractContent}
            </pre>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 10px;">
            <strong>Mã hash chữ ký:</strong> <code style="background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${signatureHash}</code>
          </p>
        </div>

        <h3>🎉 Bạn có thể:</h3>
        <ul>
          <li>Đăng bán bất động sản trên nền tảng HomeX</li>
          <li>Quản lý các giao dịch một cách trực tiếp</li>
          <li>Tận hưởng các tính năng dành cho Seller</li>
        </ul>

        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">📌 Lưu ý:</h4>
          <ul style="margin-bottom: 0;">
            <li>Lưu giữ email này làm bằng chứng đã ký hợp đồng</li>
            <li>Mã hash chữ ký có thể dùng để xác minh tính toàn vẹn của hợp đồng</li>
            <li>Mọi tranh chấp sẽ được giải quyết theo pháp luật Việt Nam</li>
          </ul>
        </div>

        <p>Xin cảm ơn bạn đã tin tưởng sử dụng HomeX!</p>

        <p>Trân trọng,<br><strong>HomeX Team</strong></p>
      </div>
    `,
  };

  try {
    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Signed contract email sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending signed contract email:", err);
    throw new Error("Failed to send signed contract email");
  }
}
  async sendOtp(to, otp, expiredAt) {
    const mailOptions = {
      from: `"NestCooking OTP" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your OTP code",
      html: `
        <p>Your OTP code is: <b>${otp}</b></p>
        <p>Expires at: ${expiredAt.toLocaleTimeString()}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${to}: ${otp}`);
    } catch (err) {
      console.error("Error sending OTP:", err);
      throw new Error("Failed to send OTP");
    }
  }
}

module.exports = new MailService();
