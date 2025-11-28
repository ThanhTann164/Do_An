const crypto = require('crypto');

// Master key để encrypt private key (trong production nên lưu trong env variable)
// Generate một lần và lưu trong .env
const MASTER_KEY = process.env.CERTIFICATE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt private key trước khi lưu vào database
 * @param {string} privateKey - Private key dạng PEM
 * @returns {string} - Encrypted private key (base64)
 */
function encryptPrivateKey(privateKey) {
  if (!privateKey) throw new Error('Private key không được để trống');
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(MASTER_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Kết hợp IV + AuthTag + Encrypted data
  return iv.toString('base64') + ':' + authTag.toString('base64') + ':' + encrypted;
}

/**
 * Decrypt private key khi đọc từ database
 * @param {string} encryptedKey - Encrypted private key từ database
 * @returns {string} - Decrypted private key (PEM format)
 */
function decryptPrivateKey(encryptedKey) {
  if (!encryptedKey) throw new Error('Encrypted key không được để trống');
  
  // Kiểm tra nếu là plaintext (backward compatibility)
  if (encryptedKey.startsWith('-----BEGIN')) {
    console.warn('⚠️ Private key không được encrypt, đang dùng plaintext');
    return encryptedKey;
  }
  
  try {
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Format encrypted key không hợp lệ');
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(MASTER_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('❌ Lỗi decrypt private key:', err.message);
    throw new Error('Không thể decrypt private key');
  }
}

module.exports = {
  encryptPrivateKey,
  decryptPrivateKey
};

