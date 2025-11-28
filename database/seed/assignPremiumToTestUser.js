const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../config.env') });

const { connection } = require('../../BE/mysql.js');

const assignPackage = async (email, packageName) => {
  const conn = await connection;
  try {
    const [[user]] = await conn.query('SELECT UserID FROM users WHERE Email = ?', [email]);
    if (!user) throw new Error(`User ${email} not found`);

    const [[pkg]] = await conn.query('SELECT id, price FROM packages WHERE name = ?', [packageName]);
    if (!pkg) throw new Error(`Package ${packageName} not found`);

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30);

    await conn.query('DELETE FROM user_packages WHERE user_id = ?', [user.UserID]);
    await conn.query(
      `INSERT INTO user_packages (
        user_id, package_id, status, start_at, end_at,
        payment_method, transaction_id, purchase_price,
        boost_used_today, last_boost_reset, created_at, updated_at
      ) VALUES (?, ?, 'active', ?, ?, 'manual', ?, ?, 0, CURDATE(), NOW(), NOW())`,
      [user.UserID, pkg.id, start, end, `ASSIGN_${Date.now()}_${user.UserID}`, pkg.price]
    );

    console.log(`Assigned ${packageName} to ${email} until ${end.toISOString()}`);
  } catch (error) {
    console.error('Assign failed:', error.message);
    process.exitCode = 1;
  } finally {
    (await connection).end();
  }
};

assignPackage('premium_test@example.com', 'PREMIUM');

