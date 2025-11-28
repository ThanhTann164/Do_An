const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function checkMessages() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'realestate'
    });

    try {
        console.log('🔍 Checking messages in database...\n');

        const [rows] = await connection.execute(`
            SELECT 
                MessageID,
                MessageText,
                MessageType,
                Metadata,
                IsEncrypted,
                CreatedAt
            FROM messages
            ORDER BY CreatedAt DESC
            LIMIT 5
        `);

        rows.forEach((row, index) => {
            console.log(`\n📧 Message ${index + 1}:`);
            console.log(`   ID: ${row.MessageID}`);
            console.log(`   Type: ${row.MessageType}`);
            console.log(`   IsEncrypted: ${row.IsEncrypted}`);
            console.log(`   Text (first 100 chars): ${row.MessageText?.substring(0, 100)}`);
            console.log(`   Metadata: ${row.Metadata}`);
            console.log(`   Created: ${row.CreatedAt}`);
        });

        console.log(`\n✅ Total messages: ${rows.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

checkMessages();
