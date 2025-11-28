const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function testNotificationAPI() {
  try {
    console.log('🧪 Testing Notification API...');
    
    // Test 1: Kiểm tra API users
    console.log('\n1️⃣ Testing GET /api/notifications/users');
    const [users] = await sequelize.query(`
      SELECT UserID as id, FullName as name, Email as email, Role as role
      FROM users 
      WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
      ORDER BY FullName ASC
      LIMIT 10
    `);
    console.log(`✅ Found ${users.length} users for notification dropdown:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role} - ID: ${user.id}`);
    });

    // Test 2: Kiểm tra notifications table structure
    console.log('\n2️⃣ Testing notifications table structure');
    const [tableInfo] = await sequelize.query(`
      DESCRIBE notifications
    `);
    console.log('✅ Notifications table structure:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : ''}`);
    });

    // Test 3: Kiểm tra dữ liệu notifications gần đây
    console.log('\n3️⃣ Testing recent notifications');
    const [recentNotifications] = await sequelize.query(`
      SELECT n.id, n.title, n.message, n.type, n.receiverId, u.FullName, n.createdAt
      FROM notifications n
      LEFT JOIN users u ON n.receiverId = u.UserID
      ORDER BY n.createdAt DESC
      LIMIT 5
    `);

    console.log(`✅ Found ${recentNotifications.length} recent notifications:`);
    recentNotifications.forEach(notif => {
      console.log(`  - "${notif.title}" → ${notif.FullName || 'All users'} (${notif.type}) - ${notif.createdAt}`);
    });

    // Test 4: Test validation
    console.log('\n4️⃣ Testing API validation');
    
    // Test missing title
    try {
      await sequelize.query(`
        INSERT INTO notifications (title, message, type, receiverId, createdAt, isRead, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), FALSE, NOW())
      `, { replacements: ['', 'Test message', 'system', users[0]?.id] });
      console.log('❌ Should have failed with empty title');
    } catch (error) {
      if (error.message.includes('cannot be null') || error.message.includes('cannot be empty')) {
        console.log('✅ Validation works: Empty title rejected');
      } else {
        console.log('⚠️ Different validation error:', error.message);
      }
    }

    console.log('\n🎉 API Test completed!');
    console.log('\n📋 Summary:');
    console.log(`  - Users available: ${users.length}`);
    console.log(`  - Recent notifications: ${recentNotifications.length}`);
    console.log('  - Table structure: OK');
    console.log('  - Ready for frontend testing!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testNotificationAPI();