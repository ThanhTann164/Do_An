/**
 * Migration Script: Update Houses Status ENUM
 * 
 * Mục đích:
 * 1. Thêm giá trị 'Rejected' vào ENUM của field Status trong bảng houses
 * 2. Thay đổi default value từ 'Available' sang 'Pending'
 * 
 * Lý do:
 * - Cần có trạng thái 'Rejected' để Admin từ chối bài đăng
 * - Default 'Pending' để tất cả bài mới đều chờ duyệt
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function updateHousesStatus() {
    let connection;
    
    try {
        console.log('🔧 [Migration] Starting database update...\n');
        
        // Kết nối database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'realestate_db'
        });

        console.log('✅ Connected to database:', process.env.DB_NAME);

        // Kiểm tra cấu trúc hiện tại
        console.log('\n📋 Checking current Status column structure...');
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM houses WHERE Field = 'Status'
        `);
        
        if (columns.length > 0) {
            console.log('Current Status column:', columns[0]);
            console.log('  Type:', columns[0].Type);
            console.log('  Default:', columns[0].Default);
        }

        // Bước 1: Tạo temporary column
        console.log('\n🔄 Step 1: Creating temporary column...');
        await connection.query(`
            ALTER TABLE houses 
            ADD COLUMN Status_new ENUM('Available','Pending','Sold','Rejected') 
            DEFAULT 'Pending' 
            AFTER Status
        `);
        console.log('✅ Temporary column created');

        // Bước 2: Copy dữ liệu từ column cũ sang mới
        console.log('\n🔄 Step 2: Copying data from old to new column...');
        await connection.query(`
            UPDATE houses 
            SET Status_new = Status
        `);
        console.log('✅ Data copied');

        // Bước 3: Drop column cũ
        console.log('\n🔄 Step 3: Dropping old Status column...');
        await connection.query(`
            ALTER TABLE houses DROP COLUMN Status
        `);
        console.log('✅ Old column dropped');

        // Bước 4: Rename column mới thành Status
        console.log('\n🔄 Step 4: Renaming new column to Status...');
        await connection.query(`
            ALTER TABLE houses 
            CHANGE COLUMN Status_new Status 
            ENUM('Available','Pending','Sold','Rejected') 
            DEFAULT 'Pending'
            COMMENT 'Trạng thái'
        `);
        console.log('✅ Column renamed');

        // Kiểm tra kết quả
        console.log('\n📋 Verifying updated structure...');
        const [newColumns] = await connection.query(`
            SHOW COLUMNS FROM houses WHERE Field = 'Status'
        `);
        
        if (newColumns.length > 0) {
            console.log('\n✅ Updated Status column:');
            console.log('  Type:', newColumns[0].Type);
            console.log('  Default:', newColumns[0].Default);
            console.log('  Null:', newColumns[0].Null);
        }

        // Kiểm tra dữ liệu
        const [statusCount] = await connection.query(`
            SELECT Status, COUNT(*) as count 
            FROM houses 
            GROUP BY Status
        `);
        
        console.log('\n📊 Current status distribution:');
        statusCount.forEach(row => {
            console.log(`  ${row.Status}: ${row.count} records`);
        });

        console.log('\n🎉 Migration completed successfully!\n');
        console.log('📝 Summary:');
        console.log('  ✅ Added "Rejected" to Status ENUM');
        console.log('  ✅ Changed default value to "Pending"');
        console.log('  ✅ All existing data preserved');
        console.log('\n💡 Next steps:');
        console.log('  1. Restart your server to load new model');
        console.log('  2. Test creating new posts (should default to Pending)');
        console.log('  3. Test Admin approval/rejection flow');

    } catch (error) {
        console.error('\n❌ Migration failed!');
        console.error('Error:', error.message);
        console.error('\nFull error:', error);
        
        // Rollback nếu có lỗi
        if (connection) {
            try {
                console.log('\n🔄 Attempting rollback...');
                // Kiểm tra xem có column nào tồn tại không
                const [checkNew] = await connection.query(`
                    SHOW COLUMNS FROM houses WHERE Field = 'Status_new'
                `);
                const [checkOld] = await connection.query(`
                    SHOW COLUMNS FROM houses WHERE Field = 'Status'
                `);
                
                if (checkNew.length > 0 && checkOld.length === 0) {
                    // Có Status_new nhưng không có Status, rename lại
                    await connection.query(`
                        ALTER TABLE houses 
                        CHANGE COLUMN Status_new Status 
                        ENUM('Available','Pending','Sold') 
                        DEFAULT 'Available'
                    `);
                    console.log('✅ Rollback successful');
                } else if (checkNew.length > 0) {
                    // Có cả 2, drop Status_new
                    await connection.query(`ALTER TABLE houses DROP COLUMN Status_new`);
                    console.log('✅ Cleaned up temporary column');
                }
            } catch (rollbackError) {
                console.error('❌ Rollback failed:', rollbackError.message);
                console.error('⚠️  Manual intervention may be required!');
            }
        }
        
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run migration
updateHousesStatus();

