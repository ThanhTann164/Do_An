const { connection } = require('../BE/mysql.js');

const usage = () => {
  console.log('Usage: node scripts/assign-package.js <email> <package=PRO|PREMIUM|FREE> [days=30]');
};

const validPackages = ['FREE', 'PRO', 'PREMIUM'];

(async () => {
  try {
    const [, , email, packageName = 'PRO', daysArg = '30'] = process.argv;

    if (!email) {
      usage();
      process.exit(1);
    }

    if (!validPackages.includes(packageName.toUpperCase())) {
      console.error(`Invalid package. Allowed: ${validPackages.join(', ')}`);
      process.exit(1);
    }

    const days = parseInt(daysArg, 10);
    const conn = await connection;

    const [users] = await conn.query('SELECT UserID FROM users WHERE Email = ?', [email]);
    if (!users.length) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    const userId = users[0].UserID;

    if (packageName.toUpperCase() === 'FREE') {
      await conn.query(
        'UPDATE user_packages SET status = "cancelled", updated_at = NOW() WHERE user_id = ? AND status = "active"',
        [userId]
      );
      console.log(`User ${email} reverted to FREE package`);
      process.exit(0);
    }

    const [packages] = await conn.query('SELECT id, name, display_name, price FROM packages WHERE name = ?', [
      packageName.toUpperCase(),
    ]);
    if (!packages.length) {
      console.error(`Package ${packageName} not found in database`);
      process.exit(1);
    }
    const packageInfo = packages[0];

    await conn.query('UPDATE user_packages SET status = "cancelled", updated_at = NOW() WHERE user_id = ? AND status = "active"', [
      userId,
    ]);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    await conn.query(
      `INSERT INTO user_packages (
        user_id, package_id, start_at, end_at, status, purchase_price,
        payment_method, transaction_id, boost_used_today, last_boost_reset,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'active', ?, 'manual', ?, 0, CURDATE(), NOW(), NOW())`,
      [userId, packageInfo.id, startDate, endDate, packageInfo.price, `SCRIPT_ASSIGN_${Date.now()}_${userId}`]
    );

    console.log(`Assigned ${packageInfo.name} to ${email} until ${endDate.toISOString()}`);
    process.exit(0);
  } catch (error) {
    console.error('Error assigning package:', error);
    process.exit(1);
  }
})();

