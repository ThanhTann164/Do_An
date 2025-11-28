// Script to update users table structure
require('dotenv').config({ path: '../config.env' });
const connection = require('../Config/database');

const updateUsersTable = () => {
    console.log('🔄 Updating users table structure...');
    
    const alterQueries = [
        // Add new columns if they don't exist
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS UserID INT AUTO_INCREMENT PRIMARY KEY FIRST`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS FullName VARCHAR(255) AFTER UserID`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS PhoneNumber VARCHAR(20) AFTER Email`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS Role VARCHAR(50) DEFAULT 'User' AFTER PhoneNumber`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS Status VARCHAR(20) DEFAULT 'Active' AFTER Role`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER Status`,
        
        // Rename existing columns
        `ALTER TABLE users CHANGE COLUMN email Email VARCHAR(255)`,
        `ALTER TABLE users CHANGE COLUMN password PasswordHash VARCHAR(255)`,
        
        // Drop old columns if they exist
        `ALTER TABLE users DROP COLUMN IF EXISTS username`,
        `ALTER TABLE users DROP COLUMN IF EXISTS display_name`,
        `ALTER TABLE users DROP COLUMN IF EXISTS phone`,
        `ALTER TABLE users DROP COLUMN IF EXISTS google_id`,
        `ALTER TABLE users DROP COLUMN IF EXISTS profile_picture`
    ];
    
    let completed = 0;
    
    alterQueries.forEach((query, index) => {
        connection.query(query, (err, result) => {
            if (err) {
                console.log(`⚠️ Query ${index + 1} skipped:`, err.message);
            } else {
                console.log(`✅ Query ${index + 1} executed successfully`);
            }
            
            completed++;
            if (completed === alterQueries.length) {
                console.log('\n🎉 Users table update completed!');
                console.log('📋 New table structure:');
                connection.query('DESCRIBE users', (descErr, columns) => {
                    if (!descErr) {
                        columns.forEach(col => {
                            console.log(`   ${col.Field} (${col.Type})`);
                        });
                    }
                    process.exit(0);
                });
            }
        });
    });
};

// Run the update
updateUsersTable();
