const simpleForgotPasswordService = require('../services/simpleForgotPasswordService');
const passwordValidator = require('../utils/passwordValidator');
const path = require('path');

class PasswordResetController {
    
    // Hiển thị trang quên mật khẩu
    showForgotPasswordPage(req, res) {
        res.sendFile(path.join(__dirname, '../../FE/views/forgot-password.html'));
    }
    
    // Hiển thị trang đặt lại mật khẩu
    showResetPasswordPage(req, res) {
        res.sendFile(path.join(__dirname, '../../FE/views/reset-password.html'));
    }
    
    // Xử lý yêu cầu quên mật khẩu (không cần email)
    async forgotPassword(req, res) {
        const { email, password, confirmPassword } = req.body;
        
        console.log('🔑 Direct password reset request for email:', email);
        
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Định dạng email không hợp lệ'
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            });
        }
        
        // Validate password strength
        const passwordCheck = passwordValidator.validatePassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordCheck.message
            });
        }
        
        try {
            // Đặt lại mật khẩu trực tiếp
            const result = await simpleForgotPasswordService.resetPasswordDirectly(email, password);
            
            res.json({
                success: true,
                message: result.message
            });
            
        } catch (error) {
            console.error('❌ Direct password reset error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Xử lý đặt lại mật khẩu
    async resetPassword(req, res) {
        const { token, password, confirmPassword } = req.body;
        
        console.log('🔑 Reset password request with token');
        
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu xác nhận không khớp'
            });
        }
        
        // Validate password strength
        const passwordCheck = passwordValidator.validatePassword(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordCheck.message
            });
        }
        
        try {
            // Đặt lại mật khẩu
            const result = await passwordResetService.resetPassword(token, password);
            
            console.log('✅ Password reset successful for user:', result.user.email);
            
            res.json({
                success: true,
                message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.'
            });
            
        } catch (error) {
            console.error('❌ Reset password error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    
    // Validate reset token (API endpoint)
    async validateResetToken(req, res) {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token không được cung cấp'
            });
        }
        
        try {
            const tokenData = await passwordResetService.validateResetToken(token);
            
            res.json({
                success: true,
                message: 'Token hợp lệ',
                user: {
                    email: tokenData.Email,
                    fullName: tokenData.FullName
                }
            });
            
        } catch (error) {
            console.error('❌ Token validation error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new PasswordResetController();
