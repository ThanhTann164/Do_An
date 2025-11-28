const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }
    
    initializeTransporter() {
        // Cấu hình email transporter
        // Trong môi trường development, sử dụng Ethereal Email (fake SMTP)
        // Trong production, sử dụng Gmail hoặc service email thực
        
        if (process.env.NODE_ENV === 'production') {
            // Production - sử dụng Gmail
            this.transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        } else {
            // Development - sử dụng Ethereal Email (test)
            this.createTestAccount();
        }
    }
    
    async createTestAccount() {
        try {
            // Tạo tài khoản test với Ethereal Email
            const testAccount = await nodemailer.createTestAccount();
            
            this.transporter = nodemailer.createTransporter({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            
            console.log('📧 Email service initialized with test account');
            console.log('📧 Test account user:', testAccount.user);
        } catch (error) {
            console.error('❌ Error creating test email account:', error);
            // Fallback: sử dụng console log thay vì gửi email thực
            this.transporter = null;
        }
    }
    
    async sendPasswordResetEmail(email, fullName, resetToken) {
        const resetUrl = `http://localhost:${process.env.PORT || 3000}/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@realestate.com',
            to: email,
            subject: 'Đặt lại mật khẩu - Real Estate Website',
            html: this.getPasswordResetEmailTemplate(fullName, resetUrl)
        };
        
        try {
            if (!this.transporter) {
                // Fallback: Log thông tin thay vì gửi email
                console.log('📧 EMAIL FALLBACK - Password Reset');
                console.log('📧 To:', email);
                console.log('📧 Reset URL:', resetUrl);
                console.log('📧 Full Name:', fullName);
                
                return {
                    success: true,
                    message: 'Link đặt lại mật khẩu đã được tạo (check console log)',
                    messageId: 'console-log-' + Date.now(),
                    resetUrl: resetUrl // For development testing
                };
            }
            
            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('📧 Password reset email sent successfully');
            console.log('📧 Message ID:', info.messageId);
            
            // Nếu sử dụng Ethereal Email, log URL để xem email
            if (process.env.NODE_ENV !== 'production') {
                console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
            }
            
            return {
                success: true,
                message: 'Email đặt lại mật khẩu đã được gửi thành công',
                messageId: info.messageId
            };
            
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            
            // Fallback: Log thông tin
            console.log('📧 EMAIL FALLBACK - Password Reset');
            console.log('📧 To:', email);
            console.log('📧 Reset URL:', resetUrl);
            
            return {
                success: true,
                message: 'Link đặt lại mật khẩu đã được tạo (fallback mode)',
                messageId: 'fallback-' + Date.now(),
                resetUrl: resetUrl // For development testing
            };
        }
    }
    
    getPasswordResetEmailTemplate(fullName, resetUrl) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Đặt lại mật khẩu</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #007bff;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #007bff;
                    margin: 0;
                }
                .content {
                    margin-bottom: 30px;
                }
                .button {
                    display: inline-block;
                    background-color: #007bff;
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                }
                .button:hover {
                    background-color: #0056b3;
                }
                .footer {
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                    text-align: center;
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏠 Real Estate Website</h1>
                    <p>Đặt lại mật khẩu</p>
                </div>
                
                <div class="content">
                    <p>Xin chào <strong>${fullName}</strong>,</p>
                    
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nếu bạn đã yêu cầu điều này, vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Đặt Lại Mật Khẩu</a>
                    </div>
                    
                    <p>Hoặc copy và paste link sau vào trình duyệt:</p>
                    <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
                        <a href="${resetUrl}">${resetUrl}</a>
                    </p>
                    
                    <div class="warning">
                        <strong>⚠️ Lưu ý quan trọng:</strong>
                        <ul>
                            <li>Link này sẽ hết hạn sau <strong>1 giờ</strong></li>
                            <li>Chỉ sử dụng được <strong>1 lần</strong></li>
                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    <p>© 2024 Real Estate Website. All rights reserved.</p>
                    <p>Nếu bạn gặp vấn đề với nút trên, copy và paste URL vào trình duyệt.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
    
    // Test email service
    async testEmailService() {
        try {
            const testResult = await this.sendPasswordResetEmail(
                'test@example.com',
                'Test User',
                'test-token-123'
            );
            
            console.log('📧 Email service test result:', testResult);
            return testResult;
        } catch (error) {
            console.error('❌ Email service test failed:', error);
            throw error;
        }
    }
    
  
}

module.exports = new EmailService();
