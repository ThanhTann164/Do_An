const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../config.env') });

const { connection } = require('../../BE/mysql.js');

const log = (message) => console.log(`[DB] ${message}`);

const createTablesIfNeeded = async (conn) => {
  // Packages base structure
  await conn.query(`
    CREATE TABLE IF NOT EXISTS packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      display_name VARCHAR(200) NOT NULL DEFAULT 'Package',
      description TEXT NULL,
      daily_post INT NOT NULL DEFAULT 1,
      daily_boost INT NOT NULL DEFAULT 0,
      price INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // User packages structure
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id BIGINT UNSIGNED NOT NULL,
      package_id INT NOT NULL,
      status ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active',
      start_at DATETIME NOT NULL,
      end_at DATETIME NOT NULL,
      boost_used_today INT NOT NULL DEFAULT 0,
      last_boost_reset DATE NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_packages_user FOREIGN KEY (user_id) REFERENCES users(UserID) ON DELETE CASCADE,
      CONSTRAINT fk_user_packages_package FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const columnExists = async (conn, table, column) => {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0].count > 0;
};

const ensureColumn = async (conn, table, column, definition) => {
  const exists = await columnExists(conn, table, column);
  if (!exists) {
    await conn.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
};

const ensureColumns = async (conn) => {
  await ensureColumn(conn, 'packages', 'display_name', "display_name VARCHAR(200) NOT NULL DEFAULT 'Package' AFTER name");
  await ensureColumn(conn, 'packages', 'description', 'description TEXT NULL AFTER display_name');
  await ensureColumn(conn, 'packages', 'daily_post', 'daily_post INT NOT NULL DEFAULT 1 AFTER description');
  await ensureColumn(conn, 'packages', 'daily_boost', 'daily_boost INT NOT NULL DEFAULT 0 AFTER daily_post');
  await ensureColumn(conn, 'packages', 'price', 'price INT NOT NULL DEFAULT 0 AFTER daily_boost');
  await ensureColumn(conn, 'packages', 'created_at', 'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn(conn, 'packages', 'updated_at', 'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await ensureColumn(conn, 'user_packages', 'status', "status ENUM('active','expired','cancelled') NOT NULL DEFAULT 'active'");
  await ensureColumn(conn, 'user_packages', 'start_at', 'start_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn(conn, 'user_packages', 'end_at', 'end_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn(conn, 'user_packages', 'payment_method', "payment_method VARCHAR(50) NULL");
  await ensureColumn(conn, 'user_packages', 'transaction_id', "transaction_id VARCHAR(100) NULL");
  await ensureColumn(conn, 'user_packages', 'purchase_price', 'purchase_price INT NOT NULL DEFAULT 0');
  await ensureColumn(conn, 'user_packages', 'boost_used_today', 'boost_used_today INT NOT NULL DEFAULT 0');
  await ensureColumn(conn, 'user_packages', 'last_boost_reset', 'last_boost_reset DATE NULL');
  await ensureColumn(conn, 'user_packages', 'created_at', 'created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn(conn, 'user_packages', 'updated_at', 'updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await conn.query(`ALTER TABLE user_packages CHANGE COLUMN started_at start_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`).catch(() => {});
  await conn.query(`ALTER TABLE user_packages CHANGE COLUMN expires_at end_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP`).catch(() => {});
};

(async () => {
  const conn = await connection;
  try {
    log('Ensuring packages & user_packages tables...');
    await createTablesIfNeeded(conn);
    await ensureColumns(conn);
    log('✅ Tables are up to date');
  } catch (error) {
    console.error('❌ Failed to ensure tables:', error);
    process.exitCode = 1;
  } finally {
    conn.end();
  }
})();

