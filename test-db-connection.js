// Script kiểm tra kết nối database
require('dotenv').config({ path: './config.env' });
const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;
  
  try {
    console.log('🔌 Đang kết nối đến database...');
    console.log('📋 Thông tin kết nối:');
    console.log('   Host:', process.env.DB_HOST || 'localhost');
    console.log('   Port:', process.env.DB_PORT || 3306);
    console.log('   Database:', process.env.DB_NAME || 'smarthome');
    console.log('   User:', process.env.DB_USER || 'root');
    console.log('');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smarthome'
    });
    
    console.log('✅ Kết nối thành công!');
    
    // Lấy danh sách tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 Danh sách tables trong database:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    // Đếm số lượng records trong một số table chính
    console.log('\n📈 Số lượng records:');
    const mainTables = ['users', 'houses', 'packages', 'userpackages', 'payment_transactions'];
    
    for (const table of mainTables) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${rows[0].count} records`);
      } catch (err) {
        console.log(`   ${table}: Table không tồn tại hoặc có lỗi`);
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi kết nối database:');
    console.error('   Message:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Gợi ý: Kiểm tra lại username và password trong config.env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Gợi ý: Database chưa được tạo. Chạy script tạo database trước.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Gợi ý: MySQL server chưa chạy. Hãy khởi động MySQL service.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Đã đóng kết nối.');
    }
  }
}

testConnection();



