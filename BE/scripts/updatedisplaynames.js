// Script to update display_name for existing users
require('dotenv').config({ path: '../config.env' });
const connection = require('../Config/database');

const updateDisplayNames = () => {
    console.log('🔄 Starting display_name update for existing users...');
    
    // First, check if display_name column exists
    connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'display_name'
    `, (checkError, results) => {
        if (checkError) {
            console.error('❌ Error checking column existence:', checkError);
            return;
        }
        
        if (results.length === 0) {
            // Column doesn't exist, add it
            connection.query(`
                ALTER TABLE users 
                ADD COLUMN display_name VARCHAR(255) AFTER username
            `, (alterError) => {
                if (alterError) {
                    console.error('❌ Error adding display_name column:', alterError);
                    return;
                }
                console.log('✅ Display_name column added');
                updateExistingUsers();
            });
        } else {
            console.log('✅ Display_name column already exists');
            updateExistingUsers();
        }
    });
    
    function updateExistingUsers() {
        // Update existing users without display_name
        connection.query(`
            UPDATE users 
            SET display_name = username 
            WHERE display_name IS NULL OR display_name = ''
        `, (updateError, results) => {
            if (updateError) {
                console.error('❌ Error updating display names:', updateError);
                return;
            }
            
            console.log(`✅ Updated ${results.affectedRows} users with display names`);
            
            // Show updated users
            connection.query('SELECT id, username, display_name, email FROM users LIMIT 5', (selectError, users) => {
                if (selectError) {
                    console.error('❌ Error fetching users:', selectError);
                    return;
                }
                
                console.log('📋 Sample updated users:');
                users.forEach(user => {
                    console.log(`   ID: ${user.id}, Username: ${user.username}, Display: ${user.display_name}, Email: ${user.email}`);
                });
                
                console.log('🎉 Display name update completed!');
                process.exit(0);
            });
        });
    }
};

// Run the update
updateDisplayNames();
