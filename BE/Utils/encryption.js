const crypto = require('crypto');

// Sử dụng secret key từ env hoặc default
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!'; // Must be 32 characters
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Mã hóa text bằng AES-256-CBC
 */
function encrypt(text) {
    try {
        // Đảm bảo key có đúng độ dài 32 bytes
        const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Trả về iv + encrypted data
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt message');
    }
}

/**
 * Giải mã text đã được mã hóa
 */
function decrypt(encryptedText) {
    try {
        // Kiểm tra xem có phải là tin nhắn đã mã hóa không
        if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
            console.log('Not encrypted text, returning as is');
            return encryptedText;
        }
        
        // Đảm bảo key có đúng độ dài 32 bytes
        const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));
        
        const parts = encryptedText.split(':');
        if (parts.length !== 2) {
            console.log('Invalid encrypted format, returning as is');
            return encryptedText;
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        console.log('✅ Decrypted successfully');
        return decrypted;
    } catch (error) {
        console.error('❌ Decryption error:', error.message);
        // Nếu không giải mã được, trả về text gốc
        return encryptedText;
    }
}

module.exports = {
    encrypt,
    decrypt
};
