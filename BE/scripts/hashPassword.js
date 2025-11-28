// Script để hash password cho user trong database
const bcrypt = require('bcrypt');
const connection = require('../config/sequelize');
const { QueryTypes } = require('sequelize');

async function hashUserPassword(email, plainPassword) {
    try {
        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        
        console.log('📧 Email:', email);
        console.log('🔑 Plain Password:', plainPassword);
        console.log('🔐 Hashed Password:', hashedPassword);
        
        // Update trong database
        const result = await connection.query(
            'UPDATE users SET PasswordHash = ? WHERE Email = ?',
            {
                replacements: [hashedPassword, email],
                type: QueryTypes.UPDATE
            }
        );
        
        console.log('✅ Password đã được hash và cập nhật trong database!');
        console.log('📊 Số dòng được cập nhật:', result[1]);
        
        // Verify hash
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('✔️ Verify hash:', isValid ? 'OK' : 'FAILED');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Sử dụng:
// node BE/scripts/hashPassword.js

// Thay đổi email và password ở đây:
const EMAIL = 'phanthinh571@gmail.com';  // Email của user cần hash password
const PLAIN_PASSWORD = 'Abc@1234';  // Password gốc (chưa hash)

hashUserPassword(EMAIL, PLAIN_PASSWORD);
