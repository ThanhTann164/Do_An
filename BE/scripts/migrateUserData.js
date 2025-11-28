// Script to migrate existing user data to new structure
require('dotenv').config({ path: '../config.env' });
const connection = require('../Config/database');

const migrateUserData = () => {
    console.log('🔄 Migrating user data to new structure...');
    
    // First, check current data
    connection.query('SELECT * FROM users LIMIT 5', (err, results) => {
        if (err) {
            console.error('❌ Error checking current data:', err);
            return;
        }
        
        console.log('📋 Current data sample:');
        results.forEach((user, index) => {
            console.log(`${index + 1}.`, user);
        });
        
        // Check if we need to migrate
        if (results.length > 0 && results[0].FullName) {
            console.log('✅ Data already migrated!');
            process.exit(0);
        }
        
        // If no data, insert sample admin user
        if (results.length === 0) {
            console.log('📝 No existing data found. Creating sample admin user...');
            
            const adminUser = {
                FullName: 'Người dùng Quản trị',
                Email: 'admin@smarthome.com',
                PhoneNumber: '0123456789',
                PasswordHash: 'Admin@123',
                Role: 'Admin',
                Status: 'Active'
            };
            
            connection.query(
                'INSERT INTO users (FullName, Email, PhoneNumber, PasswordHash, Role, Status) VALUES (?, ?, ?, ?, ?, ?)',
                [adminUser.FullName, adminUser.Email, adminUser.PhoneNumber, adminUser.PasswordHash, adminUser.Role, adminUser.Status],
                (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error('❌ Error inserting admin user:', insertErr);
                    } else {
                        console.log('✅ Admin user created successfully!');
                        console.log('📋 Admin credentials:');
                        console.log('   Email: admin@smarthome.com');
                        console.log('   Password: Admin@123');
                    }
                    process.exit(0);
                }
            );
        } else {
            console.log('⚠️ Found existing data but structure seems incomplete.');
            console.log('💡 Please manually update your data or clear the table and run this script again.');
            process.exit(0);
        }
    });
};

// Run the migration
migrateUserData();
