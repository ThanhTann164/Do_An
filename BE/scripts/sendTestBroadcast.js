const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

async function sendTestBroadcast() {
  try {
    console.log('📢 Gửi thông báo test từ Admin đến toàn hệ thống...');
    
    // Lấy danh sách tất cả user active
    const [users] = await sequelize.query(`
      SELECT UserID, FullName, Email FROM users 
      WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
      LIMIT 10
    `);
    
    console.log(`✅ Tìm thấy ${users.length} users active`);
    users.forEach(user => {
      console.log(`  - ${user.FullName} (${user.Email}) - ID: ${user.UserID}`);
    });

    // Tạo thông báo broadcast
    const title = '🎉 Thông báo test từ Admin';
    const message = 'Đây là thông báo test để kiểm tra hệ thống thông báo. Hệ thống đã hoạt động bình thường! Thời gian: ' + new Date().toLocaleString('vi-VN');
    const type = 'system';

    console.log('\n📝 Tạo thông báo:');
    console.log(`  📌 Tiêu đề: ${title}`);
    console.log(`  💬 Nội dung: ${message}`);
    console.log(`  🏷️ Loại: ${type}`);

    // Insert thông báo cho từng user
    const insertPromises = users.map(user => 
      sequelize.query(`
        INSERT INTO notifications (title, message, type, receiverId, createdAt, isRead, updatedAt)
        VALUES (?, ?, ?, ?, NOW(), FALSE, NOW())
      `, { replacements: [title, message, type, user.UserID] })
    );

    await Promise.all(insertPromises);
    
    console.log(`\n✅ Đã gửi thông báo thành công đến ${users.length} người dùng!`);
    
    // Kiểm tra kết quả
    const [notifications] = await sequelize.query(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE title = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    `, { replacements: [title] });
    
    console.log(`🔍 Kiểm tra: Có ${notifications[0].count} thông báo mới được tạo`);
    
    // Hiển thị một vài thông báo mẫu
    const [sampleNotifications] = await sequelize.query(`
      SELECT n.id, n.title, n.message, n.type, n.receiverId, u.FullName, n.createdAt
      FROM notifications n
      LEFT JOIN users u ON n.receiverId = u.UserID
      WHERE n.title = ?
      ORDER BY n.createdAt DESC
      LIMIT 5
    `, { replacements: [title] });
    
    console.log('\n📋 Mẫu thông báo đã tạo:');
    sampleNotifications.forEach(notif => {
      console.log(`  - ID: ${notif.id} | Người nhận: ${notif.FullName} (${notif.receiverId}) | ${notif.createdAt}`);
    });
    
    console.log('\n🎯 Bây giờ bạn có thể:');
    console.log('  1. Đăng nhập với tài khoản User để xem thông báo tại: http://localhost:3001/notifications');
    console.log('  2. Đăng nhập với tài khoản Admin để quản lý thông báo tại: http://localhost:3001/admin/notifications');
    console.log('  3. Kiểm tra icon thông báo trên navbar sẽ hiển thị số lượng chưa đọc');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi gửi thông báo:', error);
    process.exit(1);
  }
}

sendTestBroadcast();



