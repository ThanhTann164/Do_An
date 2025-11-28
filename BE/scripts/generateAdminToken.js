const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Config/jwt.config');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function generateAdminToken() {
  try {
    console.log('🔑 Generating new Admin token...');
    
    // Tìm admin user
    const [admins] = await sequelize.query(`
      SELECT UserID, FullName, Email, Role, Status 
      FROM users 
      WHERE Role = 'Admin' AND Status = 'Active'
      LIMIT 1
    `);
    
    if (admins.length === 0) {
      console.log('❌ No active admin found!');
      process.exit(1);
    }
    
    const admin = admins[0];
    console.log(`✅ Found admin: ${admin.FullName} (${admin.Email})`);
    
    // Tạo token mới với thời hạn 24h
    const payload = {
      userId: admin.UserID,
      role: admin.Role,
      email: admin.Email,
      fullName: admin.FullName,
      status: admin.Status
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    
    console.log('\n🎫 New Admin Token:');
    console.log('='.repeat(80));
    console.log(token);
    console.log('='.repeat(80));
    
    // Test token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('\n✅ Token verification successful:');
      console.log(`  - User ID: ${decoded.userId}`);
      console.log(`  - Role: ${decoded.role}`);
      console.log(`  - Email: ${decoded.email}`);
      console.log(`  - Expires: ${new Date(decoded.exp * 1000).toLocaleString('vi-VN')}`);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }
    
    console.log('\n📋 How to use:');
    console.log('1. Copy token above');
    console.log('2. Open browser console on admin page');
    console.log('3. Run: localStorage.setItem("token", "YOUR_TOKEN_HERE")');
    console.log('4. Refresh page');
    console.log('5. Or paste into debug-notification.html');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateAdminToken();

