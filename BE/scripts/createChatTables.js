const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function createChatTables() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'realestate_db'
        });

        console.log('✅ Connected to database');

        // Tạo bảng conversations
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS conversations (
                ConversationID BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                Participant1ID BIGINT UNSIGNED NOT NULL,
                Participant2ID BIGINT UNSIGNED NOT NULL,
                LastMessageAt DATETIME NULL,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (Participant1ID) REFERENCES users(UserID) ON DELETE CASCADE,
                FOREIGN KEY (Participant2ID) REFERENCES users(UserID) ON DELETE CASCADE,
                INDEX idx_participant1 (Participant1ID),
                INDEX idx_participant2 (Participant2ID),
                UNIQUE KEY unique_conversation (Participant1ID, Participant2ID)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Created conversations table');

        // Tạo bảng messages
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                MessageID BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                ConversationID BIGINT UNSIGNED NOT NULL,
                SenderID BIGINT UNSIGNED NOT NULL,
                MessageText TEXT NOT NULL,
                IsRead BOOLEAN DEFAULT FALSE,
                CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (ConversationID) REFERENCES conversations(ConversationID) ON DELETE CASCADE,
                FOREIGN KEY (SenderID) REFERENCES users(UserID) ON DELETE CASCADE,
                INDEX idx_conversation (ConversationID),
                INDEX idx_sender (SenderID),
                INDEX idx_created (CreatedAt)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ Created messages table');

        console.log('✅ All chat tables created successfully!');

    } catch (error) {
        console.error('❌ Error creating chat tables:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the script
createChatTables()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
