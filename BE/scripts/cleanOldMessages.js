const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function cleanOldMessages() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('🧹 Cleaning old test messages...');

        // Xóa tất cả tin nhắn cũ
        const [result] = await connection.execute('DELETE FROM messages');
        console.log(`✅ Deleted ${result.affectedRows} old messages`);

        console.log('✅ Database cleaned successfully!');

    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

cleanOldMessages()
    .then(() => {
        console.log('✅ Cleanup completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    });
