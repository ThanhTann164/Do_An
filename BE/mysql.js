const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });

// MySQL connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'buithanhTan@123',
  database: process.env.DB_NAME || 'smarthome',
  port: process.env.DB_PORT || 3306
});

module.exports = { connection };
