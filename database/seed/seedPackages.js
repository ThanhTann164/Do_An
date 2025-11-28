const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../config.env') });

const bcrypt = require('bcrypt');
const { connection } = require('../../BE/mysql.js');

const packages = [
  { name: 'FREE', display_name: 'Gói Miễn Phí', description: 'Gói cơ bản', daily_post: 1, daily_boost: 0, price: 0 },
  { name: 'PRO', display_name: 'Gói PRO', description: 'Gói cho seller chuyên nghiệp', daily_post: 5, daily_boost: 1, price: 99000 },
  { name: 'PREMIUM', display_name: 'Gói PREMIUM', description: 'Gói đầy đủ tính năng', daily_post: 999, daily_boost: 5, price: 199000 },
];

const testUsers = [
  { email: 'pro_test@example.com', fullName: 'Test Pro User', role: 'Seller' },
  { email: 'premium_test@example.com', fullName: 'Test Premium User', role: 'Seller' },
];

const assignPlan = [
  { email: 'pro_test@example.com', package: 'PRO' },
  { email: 'premium_test@example.com', package: 'PREMIUM' },
];

const PASSWORD = '123456';
const DAYS = 30;

const log = (msg) => console.log(`[Seed] ${msg}`);

(async () => {
  const conn = await connection;
  try {
    log('Seeding packages...');
    for (const pkg of packages) {
      await conn.query(
        `INSERT INTO packages (name, display_name, description, daily_post, daily_boost, price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           display_name = VALUES(display_name),
           description = VALUES(description),
           daily_post = VALUES(daily_post),
           daily_boost = VALUES(daily_boost),
           price = VALUES(price),
           updated_at = NOW()`,
        [pkg.name, pkg.display_name, pkg.description, pkg.daily_post, pkg.daily_boost, pkg.price]
      );
    }

    log('Seeding test users...');
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    for (const user of testUsers) {
      await conn.query(
        `INSERT INTO users (FullName, Email, PasswordHash, Role, Status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'Active', NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           FullName = VALUES(FullName),
           PasswordHash = VALUES(PasswordHash),
           Role = VALUES(Role),
           Status = 'Active',
           updatedAt = NOW()`,
        [user.fullName, user.email, passwordHash, user.role]
      );
    }

    log('Assigning packages to test users...');
    for (const assignment of assignPlan) {
      const [[user]] = await conn.query('SELECT UserID FROM users WHERE Email = ?', [assignment.email]);
      if (!user) {
        console.warn(`User ${assignment.email} not found, skipping assignment`);
        continue;
      }

      const [[pkg]] = await conn.query('SELECT id, price FROM packages WHERE name = ?', [assignment.package]);
      if (!pkg) {
        console.warn(`Package ${assignment.package} not found, skipping assignment`);
        continue;
      }

      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + DAYS);

      await conn.query('DELETE FROM user_packages WHERE user_id = ?', [user.UserID]);
      await conn.query(
        `INSERT INTO user_packages (
           user_id, package_id, status, start_at, end_at,
           payment_method, transaction_id,
           purchase_price, boost_used_today, last_boost_reset, created_at, updated_at
         ) VALUES (?, ?, 'active', ?, ?, 'seed', ?, ?, 0, CURDATE(), NOW(), NOW())`,
        [user.UserID, pkg.id, start, end, `SEED_${Date.now()}_${user.UserID}`, pkg.price]
      );
    }

    log('✅ Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  } finally {
    conn.end();
  }
})();

