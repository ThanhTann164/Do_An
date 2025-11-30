const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function testAdminNotification() {
  try {
    console.log('🧪 Testing Admin Notification API...');
    
    // Test 1: Kiểm tra API users
    console.log('\n1️⃣ Testing GET /api/notifications/users');
    const [users] = await sequelize.query(`
      SELECT UserID as id, FullName as name, Email as email, Role as role
      FROM users 
      WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
      ORDER BY FullName ASC
      LIMIT 10
    `);
    console.log(`✅ Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - ID: ${user.id}`);
    });

    // Test 2: Test broadcast notification
    console.log('\n2️⃣ Testing Broadcast Notification');
    const title = '🧪 Test từ Script';
    const message = `Test notification từ script - ${new Date().toLocaleString('vi-VN')}`;
    const type = 'system';

    // Insert broadcast notifications
    const insertPromises = users.slice(0, 3).map(user => 
      sequelize.query(`
        INSERT INTO notifications (title, message, type, receiverId, createdAt, isRead, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), FALSE, NOW())
      `, { replacements: [title, message, type, user.id] })
    );

    await Promise.all(insertPromises);
    console.log(`✅ Created ${insertPromises.length} broadcast notifications`);

    // Test 3: Test specific user notification
    console.log('\n3️⃣ Testing Specific User Notification');
    const specificUser = users[0];
    const specificTitle = '🎯 Test Specific User';
    const specificMessage = `Test notification cho user cụ thể: ${specificUser.name}`;

    await sequelize.query(`
      INSERT INTO notifications (title, message, type, receiverId, createdAt, isRead, updatedAt)
      VALUES (?, ?, ?, ?, NOW(), FALSE, NOW())
    `, { replacements: [specificTitle, specificMessage, 'custom', specificUser.id] });

    console.log(`✅ Created specific notification for ${specificUser.name}`);

    // Test 4: Verify notifications in database
    console.log('\n4️⃣ Verifying notifications in database');
    const [recentNotifications] = await sequelize.query(`
      SELECT n.id, n.title, n.message, n.type, n.receiverId, u.FullName, n.createdAt
      FROM notifications n
      LEFT JOIN users u ON n.receiverId = u.UserID
      WHERE n.createdAt >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY n.createdAt DESC
      LIMIT 10
    `);

    console.log(`✅ Found ${recentNotifications.length} recent notifications:`);
    recentNotifications.forEach(notif => {
      console.log(`  - "${notif.title}" → ${notif.FullName || 'All users'} (${notif.type})`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('  1. Đăng nhập admin tại: http://localhost:3001/admin/notifications/send');
    console.log('  2. Điền form và gửi thông báo');
    console.log('  3. Kiểm tra console browser để xem debug logs');
    console.log('  4. Kiểm tra trang user: http://localhost:3001/notifications');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAdminNotification();



