const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function addIoTToHouse1004() {
    let connection;
    
    try {
        // Tạo kết nối database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smarthome_db'
        });

        console.log('✅ Connected to database');

        // Kiểm tra house 1004 có tồn tại không
        const [houses] = await connection.execute(
            'SELECT HouseID, Title FROM houses WHERE HouseID = ?',
            [1004]
        );
        
        if (houses.length === 0) {
            console.log('❌ House ID 1004 not found!');
            return;
        }
        
        console.log(`🏠 Found house: ${houses[0].Title}`);

        // Xóa IoT devices cũ nếu có
        await connection.execute(
            'DELETE FROM iotdevices WHERE HouseID = ?',
            [1004]
        );
        console.log('🧹 Cleared existing IoT devices for house 1004');

        // Thêm IoT devices mới
        const iotDevices = [
            { name: 'Đèn thông minh', type: 'Light', status: 'Active' },
            { name: 'Khóa thông minh', type: 'Smart Lock', status: 'Active' },
            { name: 'Camera an ninh', type: 'Camera', status: 'Active' },
            { name: 'Cảm biến nhiệt độ', type: 'Temperature Sensor', status: 'Active' },
            { name: 'Quạt thông minh', type: 'Fan', status: 'Active' }
        ];

        for (const device of iotDevices) {
            await connection.execute(
                'INSERT INTO iotdevices (HouseID, DeviceName, DeviceType, Status) VALUES (?, ?, ?, ?)',
                [1004, device.name, device.type, device.status]
            );
            console.log(`✅ Added: ${device.name} (${device.type})`);
        }

        console.log(`🎉 Successfully added ${iotDevices.length} IoT devices to house 1004!`);

        // Verify
        const [newDevices] = await connection.execute(
            'SELECT DeviceID, DeviceName, DeviceType FROM iotdevices WHERE HouseID = ?',
            [1004]
        );
        
        console.log('\n🔍 Verification - IoT devices for house 1004:');
        newDevices.forEach(device => {
            console.log(`   - ${device.DeviceName} (${device.DeviceType}) - ID: ${device.DeviceID}`);
        });

        console.log('\n🌐 Now test the API:');
        console.log('   URL: http://localhost:3001/api/houses/1004');
        console.log('   Expected: iotDevices array with 5 devices');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Chạy script
addIoTToHouse1004();

