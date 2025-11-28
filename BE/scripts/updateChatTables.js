const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function updateChatTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('🔄 Updating messages table...');

        // Kiểm tra và thêm cột MessageType
        try {
            await connection.execute(`
                ALTER TABLE messages 
                ADD COLUMN MessageType ENUM('text', 'image', 'property_link') 
                DEFAULT 'text' AFTER MessageText
            `);
            console.log('✅ Added MessageType column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  MessageType column already exists');
            } else {
                throw err;
            }
        }

        // Kiểm tra và thêm cột Metadata
        try {
            await connection.execute(`
                ALTER TABLE messages 
                ADD COLUMN Metadata JSON 
                DEFAULT NULL AFTER MessageType
            `);
            console.log('✅ Added Metadata column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  Metadata column already exists');
            } else {
                throw err;
            }
        }

        // Kiểm tra và thêm cột IsEncrypted
        try {
            await connection.execute(`
                ALTER TABLE messages 
                ADD COLUMN IsEncrypted BOOLEAN 
                DEFAULT true AFTER Metadata
            `);
            console.log('✅ Added IsEncrypted column');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  IsEncrypted column already exists');
            } else {
                throw err;
            }
        }

        console.log('✅ Messages table updated successfully!');

    } catch (error) {
        console.error('❌ Error updating tables:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

updateChatTables()
    .then(() => {
        console.log('✅ Database update completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Database update failed:', error);
        process.exit(1);
    });
