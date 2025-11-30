const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { broadcastNotification } = require('../Config/websocket');

async function sendRealtimeTest() {
  try {
    console.log('🚀 Gửi thông báo realtime test...');
    
    // Tạo thông báo trong database
    const title = '🔥 THÔNG BÁO REALTIME TEST';
    const message = `Test thông báo realtime qua WebSocket! Thời gian: ${new Date().toLocaleString('vi-VN')}`;
    const type = 'system';

    // Lấy một vài users để test
    const [users] = await sequelize.query(`
      SELECT UserID, FullName, Email FROM users 
      WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
      LIMIT 5
    `);
    
    console.log(`✅ Tìm thấy ${users.length} users để test`);

    // Insert vào database
    const insertPromises = users.map(user => 
      sequelize.query(`
        INSERT INTO notifications (title, message, type, receiverId, createdAt, isRead, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), FALSE, NOW())
      `, { replacements: [title, message, type, user.UserID] })
    );

    await Promise.all(insertPromises);
    console.log('✅ Đã lưu vào database');

    // Gửi qua WebSocket
    const notificationData = {
      id: Date.now(),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    console.log('📡 Broadcasting qua WebSocket...');
    broadcastNotification(notificationData);
    
    console.log('🎉 HOÀN THÀNH! Kiểm tra:');
    console.log('  1. Mở trang http://localhost:3001/notifications');
    console.log('  2. Kiểm tra icon thông báo trên navbar');
    console.log('  3. Xem console browser có nhận được WebSocket event không');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

sendRealtimeTest();



