const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function createAdminUser() {
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

        // Kiểm tra xem đã có admin chưa
        const [existingAdmins] = await connection.execute(
            'SELECT UserID FROM users WHERE Role = ? LIMIT 1', 
            ['Admin']
        );
        
        if (existingAdmins.length > 0) {
            console.log('⚠️  Admin user already exists!');
            console.log('📋 Existing admin info:');
            
            const [adminInfo] = await connection.execute(
                'SELECT UserID, FullName, Email, PhoneNumber, Status FROM users WHERE Role = ? LIMIT 1',
                ['Admin']
            );
            
            console.log('   ID:', adminInfo[0].UserID);
            console.log('   Name:', adminInfo[0].FullName);
            console.log('   Email:', adminInfo[0].Email);
            console.log('   Phone:', adminInfo[0].PhoneNumber);
            console.log('   Status:', adminInfo[0].Status);
            
            return;
        }

        // Tạo admin user mới
        console.log('📝 Creating new admin user...');
        
        const adminData = {
            fullName: 'Quản trị viên hệ thống',
            email: 'admin@smarthome.com',
            phone: '0123456789',
            password: 'Admin@123'
        };

        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        
        const [result] = await connection.execute(`
            INSERT INTO users (FullName, Email, PhoneNumber, PasswordHash, Role, Status) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            adminData.fullName,
            adminData.email,
            adminData.phone,
            hashedPassword,
            'Admin',
            'Active'
        ]);

        console.log('✅ Admin user created successfully!');
        console.log('📋 Admin credentials:');
        console.log('   ID:', result.insertId);
        console.log('   Name:', adminData.fullName);
        console.log('   Email:', adminData.email);
        console.log('   Phone:', adminData.phone);
        console.log('   Password:', adminData.password);
        console.log('   Role: Admin');
        console.log('   Status: Active');
        
        console.log('\n🎯 Bạn có thể đăng nhập với:');
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️  Email hoặc số điện thoại đã tồn tại!');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Chạy script
createAdminUser();

