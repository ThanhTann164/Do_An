// Script để kiểm tra users trong database
const connection = require('../config/sequelize');
const { QueryTypes } = require('sequelize');

async function checkUsers() {
    try {
        // Lấy tất cả users
        const users = await connection.query(
            'SELECT UserID, FullName, Email, Role FROM users ORDER BY UserID',
            {
                type: QueryTypes.SELECT
            }
        );
        
        console.log('📊 Danh sách users trong database:\n');
        console.log('='.repeat(80));
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.UserID}`);
            console.log(`   Tên: ${user.FullName}`);
            console.log(`   Email: ${user.Email}`);
            console.log(`   Role: ${user.Role}`);
            console.log('-'.repeat(80));
        });
        
        console.log(`\n✅ Tổng số users: ${users.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUsers();
