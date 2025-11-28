const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const initModels = require('../models/init-models');

async function createTestNotifications() {
    try {
        console.log('🔍 Creating test notifications...');

        // Create notifications using raw SQL since model might not exist
        await sequelize.query(`
            INSERT INTO notifications (title, message, toUserId, createdAt, isRead) VALUES
            ('Chào mừng đến với hệ thống!', 'Chúc mừng bạn đã tham gia hệ thống bất động sản thông minh của chúng tôi. Hãy khám phá các tính năng mới!', NULL, NOW(), false),
            ('Thông báo quan trọng', 'Bạn có một yêu cầu xác minh tài khoản mới cần được xử lý.', 18, DATE_SUB(NOW(), INTERVAL 2 HOUR), false),
            ('Cập nhật hệ thống', 'Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai. Vui lòng lưu ý.', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), false)
        `);


        console.log('✅ Test notifications created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test notifications:', error);
        process.exit(1);
    }
}

createTestNotifications();
