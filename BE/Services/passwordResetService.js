const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const connection = require('../config/database');

class PasswordResetService {
    
    // Tạo token reset password và lưu vào database
    async createResetToken(email) {
        return new Promise((resolve, reject) => {
            // Kiểm tra email có tồn tại không
            const checkUserQuery = 'SELECT UserID, Email, FullName FROM Users WHERE Email = ?';
            
            connection.query(checkUserQuery, [email], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Lỗi hệ thống'));
                }
                
                if (results.length === 0) {
                    return reject(new Error('Email không tồn tại trong hệ thống'));
                }
                
                const user = results[0];
                
                // Tạo token ngẫu nhiên
                const resetToken = crypto.randomBytes(32).toString('hex');
                const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
                
                // Token hết hạn sau 1 giờ
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
                
                // Xóa các token cũ của user này
                const deleteOldTokensQuery = 'DELETE FROM password_reset_tokens WHERE user_id = ?';
                
                connection.query(deleteOldTokensQuery, [user.UserID], (err) => {
                    if (err) {
                        console.error('Error deleting old tokens:', err);
                        return reject(new Error('Lỗi hệ thống'));
                    }
                    
                    // Lưu token mới
                    const insertTokenQuery = `
                        INSERT INTO password_reset_tokens (UserID, token, expires_at, created_at) 
                        VALUES (?, ?, ?, NOW())
                    `;
                    
                    connection.query(insertTokenQuery, [user.UserID, hashedToken, expiresAt], (err) => {
                        if (err) {
                            console.error('Error saving reset token:', err);
                            return reject(new Error('Lỗi hệ thống'));
                        }
                        
                        resolve({
                            resetToken: resetToken, // Token gốc để gửi email
                            user: user,
                            expiresAt: expiresAt
                        });
                    });
                });
            });
        });
    }
    
    // Xác thực token reset password
    async validateResetToken(token) {
        return new Promise((resolve, reject) => {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            
            const query = `
                SELECT prt.*, u.UserID, u.Email, u.FullName 
                FROM password_reset_tokens prt
                JOIN Users u ON prt.user_id = u.UserID
                WHERE prt.token = ? AND prt.expires_at > NOW()
            `;
            
            connection.query(query, [hashedToken], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Lỗi hệ thống'));
                }
                
                if (results.length === 0) {
                    return reject(new Error('Token không hợp lệ hoặc đã hết hạn'));
                }
                
                resolve(results[0]);
            });
        });
    }
    
    // Đặt lại mật khẩu
    async resetPassword(token, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                // Xác thực token
                const tokenData = await this.validateResetToken(token);
                
                // Hash mật khẩu mới
                const saltRounds = 12;
                const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                
                // Cập nhật mật khẩu
                const updatePasswordQuery = 'UPDATE Users SET PasswordHash = ? WHERE UserID = ?';
                
                connection.query(updatePasswordQuery, [hashedPassword, tokenData.UserID], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return reject(new Error('Lỗi cập nhật mật khẩu'));
                    }
                    
                    // Xóa token đã sử dụng
                    const deleteTokenQuery = 'DELETE FROM password_reset_tokens WHERE user_id = ?';
                    
                    connection.query(deleteTokenQuery, [tokenData.UserID], (err) => {
                        if (err) {
                            console.error('Error deleting used token:', err);
                            // Không reject vì mật khẩu đã được cập nhật thành công
                        }
                        
                        resolve({
                            success: true,
                            message: 'Mật khẩu đã được đặt lại thành công',
                            user: {
                                id: tokenData.UserID,
                                email: tokenData.Email,
                                fullName: tokenData.FullName
                            }
                        });
                    });
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // Xóa các token đã hết hạn (cleanup job)
    async cleanupExpiredTokens() {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM password_reset_tokens WHERE expires_at <= NOW()';
            
            connection.query(query, (err, results) => {
                if (err) {
                    console.error('Error cleaning up expired tokens:', err);
                    return reject(err);
                }
                
                console.log(`Cleaned up ${results.affectedRows} expired reset tokens`);
                resolve(results.affectedRows);
            });
        });
    }
    
    // Tạo bảng password_reset_tokens nếu chưa có
    async createResetTokensTable() {
        return new Promise((resolve, reject) => {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    token VARCHAR(255) NOT NULL,
                    expires_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_token (token),
                    INDEX idx_user_id (user_id),
                    INDEX idx_expires_at (expires_at),
                    FOREIGN KEY (user_id) REFERENCES Users(UserID) ON DELETE CASCADE
                )
            `;
            
            connection.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating password_reset_tokens table:', err);
                    return reject(err);
                }
                
                console.log('✅ Password reset tokens table ready');
                resolve();
            });
        });
    }
}

module.exports = new PasswordResetService();
