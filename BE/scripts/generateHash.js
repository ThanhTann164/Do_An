// Script để tạo hash từ plain password (không update database)
const bcrypt = require('bcrypt');

async function generateHash(plainPassword) {
    try {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        
        console.log('🔑 Plain Password:', plainPassword);
        console.log('🔐 Hashed Password:', hashedPassword);
        console.log('\n📋 Copy hash này để paste vào database:');
        console.log(hashedPassword);
        
        // Verify
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('\n✔️ Verify:', isValid ? 'OK' : 'FAILED');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Lấy password từ command line argument
const password = process.argv[2] || '123456';

console.log('🔄 Generating hash for password...\n');
generateHash(password);
