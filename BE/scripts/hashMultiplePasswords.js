// Script để hash password cho nhiều user cùng lúc
const bcrypt = require('bcrypt');
const connection = require('../config/sequelize');
const { QueryTypes } = require('sequelize');

async function hashMultiplePasswords(users) {
    try {
        const saltRounds = 12;
        
        console.log('🔄 Bắt đầu hash password cho', users.length, 'users...\n');
        
        for (const user of users) {
            const { email, password } = user;
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            // Update trong database
            const result = await connection.query(
                'UPDATE users SET PasswordHash = ? WHERE Email = ?',
                {
                    replacements: [hashedPassword, email],
                    type: QueryTypes.UPDATE
                }
            );
            
            console.log('✅', email);
            console.log('   Plain:', password);
            console.log('   Hash:', hashedPassword);
            console.log('   Updated:', result[1], 'row(s)\n');
        }
        
        console.log('🎉 Hoàn thành!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Danh sách users cần hash password
const USERS = [
    { email: 'phanphuocthinh@gmail.com', password: '123456' },
    { email: 'buyer@example.com', password: '123456' },
    { email: 'seller@example.com', password: '123456' },
    // Thêm users khác ở đây...
];

hashMultiplePasswords(USERS);
