const bcrypt = require('bcryptjs');
const connection = require('../config/database');

class SimpleForgotPasswordService {
    
    // Đặt lại mật khẩu trực tiếp bằng email
    async resetPasswordDirectly(email, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                // Kiểm tra email có tồn tại không
                const checkUserQuery = 'SELECT UserID, Email, FullName FROM Users WHERE Email = ?';
                
                connection.query(checkUserQuery, [email], async (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        return reject(new Error('Lỗi hệ thống'));
                    }
                    
                    if (results.length === 0) {
                        return reject(new Error('Email không tồn tại trong hệ thống'));
                    }
                    
                    const user = results[0];
                    
                    try {
                        // Hash mật khẩu mới
                        const saltRounds = 12;
                        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
                        
                        // Cập nhật mật khẩu trong database
                        const updatePasswordQuery = 'UPDATE Users SET PasswordHash = ? WHERE UserID = ?';
                        
                        connection.query(updatePasswordQuery, [hashedPassword, user.UserID], (err) => {
                            if (err) {
                                console.error('Error updating password:', err);
                                return reject(new Error('Lỗi cập nhật mật khẩu'));
                            }
                            
                            console.log(`✅ Password reset successful for user: ${user.Email}`);
                            
                            resolve({
                                success: true,
                                message: 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.',
                                user: {
                                    id: user.UserID,
                                    email: user.Email,
                                    fullName: user.FullName
                                }
                            });
                        });
                        
                    } catch (hashError) {
                        console.error('Error hashing password:', hashError);
                        reject(new Error('Lỗi mã hóa mật khẩu'));
                    }
                });
                
            } catch (error) {
                console.error('Reset password error:', error);
                reject(error);
            }
        });
    }
    
    // Kiểm tra email có tồn tại không (để validation)
    async checkEmailExists(email) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT UserID, Email FROM Users WHERE Email = ?';
            
            connection.query(query, [email], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Lỗi hệ thống'));
                }
                
                resolve(results.length > 0);
            });
        });
    }
}

module.exports = new SimpleForgotPasswordService();
