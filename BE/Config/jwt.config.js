const path = require('path');
const dotenvPath = path.join(__dirname, '../../config.env');

// Đảm bảo biến môi trường được nạp khi các module khác require file này trực tiếp
require('dotenv').config({ path: dotenvPath });

const DEFAULT_JWT_SECRET = 'your_jwt_secret_key_here_67890';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

module.exports = {
  JWT_SECRET,
  DEFAULT_JWT_SECRET,
};

