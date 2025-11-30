const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function updateTestPasswords() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'buithanhTan@123',
      database: process.env.DB_NAME || 'smarthome'
    });

    console.log('✅ Connected to database');

    const password = 'Test@123';
    const newHash = await bcrypt.hash(password, 12);
    console.log('🔐 New password hash:', newHash);

    // Cập nhật mật khẩu cho tất cả tài khoản test
    const testEmails = [
      'buyer1@test.com',
      'buyer2@test.com', 
      'seller1@test.com',
      'seller2@test.com'
    ];

    for (const email of testEmails) {
      await connection.execute(
        'UPDATE users SET PasswordHash = ? WHERE Email = ?',
        [newHash, email]
      );
      console.log(`✅ Updated password for ${email}`);
    }

    console.log('🎉 All test passwords updated successfully!');
    console.log('📝 Test credentials:');
    testEmails.forEach(email => {
      console.log(`   Email: ${email} | Password: ${password}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateTestPasswords();




