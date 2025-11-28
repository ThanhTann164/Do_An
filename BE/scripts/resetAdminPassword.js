const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function resetAdminPassword() {
    let connection;
    
    try {
        // Tạo kết nối database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smarthome_db'
        });

        console.log('✅ Connected to database');

        // Tìm admin user
        const [admins] = await connection.execute(
            'SELECT UserID, FullName, Email, PhoneNumber FROM users WHERE Role = ? LIMIT 1',
            ['Admin']
        );
        
        if (admins.length === 0) {
            console.log('❌ Không tìm thấy tài khoản admin!');
            return;
        }

        const admin = admins[0];
        console.log('🔍 Found admin user:');
        console.log('   ID:', admin.UserID);
        console.log('   Name:', admin.FullName);
        console.log('   Email:', admin.Email);
        console.log('   Phone:', admin.PhoneNumber);

        // Reset password
        const newPassword = 'Admin@123';
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        await connection.execute(
            'UPDATE users SET PasswordHash = ? WHERE UserID = ?',
            [hashedPassword, admin.UserID]
        );

        console.log('✅ Password reset successfully!');
        console.log('🎯 Thông tin đăng nhập admin:');
        console.log(`   Email: ${admin.Email}`);
        console.log(`   Password: ${newPassword}`);
        console.log('   Role: Admin');
        
        console.log('\n🌐 Truy cập admin dashboard tại:');
        console.log('   http://localhost:3001/admin/dashboard');

    } catch (error) {
        console.error('❌ Error resetting admin password:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Chạy script
resetAdminPassword();

