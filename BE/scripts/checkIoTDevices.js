const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function checkIoTDevices() {
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

        // Kiểm tra houses có ID 1004
        console.log('\n🏠 Checking house ID 1004:');
        const [houses] = await connection.execute(
            'SELECT HouseID, Title, OwnerID FROM houses WHERE HouseID = ?',
            [1004]
        );
        
        if (houses.length === 0) {
            console.log('❌ House ID 1004 not found!');
            
            // Tìm houses gần đây nhất
            console.log('\n🔍 Recent houses:');
            const [recentHouses] = await connection.execute(
                'SELECT HouseID, Title, OwnerID, CreatedAt FROM houses ORDER BY CreatedAt DESC LIMIT 5'
            );
            
            recentHouses.forEach(house => {
                console.log(`   ID: ${house.HouseID} | Title: ${house.Title} | Owner: ${house.OwnerID} | Created: ${house.CreatedAt}`);
            });
            
            return;
        }
        
        const house = houses[0];
        console.log(`   Found: ${house.Title} (Owner: ${house.OwnerID})`);

        // Kiểm tra IoT devices cho house này
        console.log('\n🔌 Checking IoT devices for house 1004:');
        const [devices] = await connection.execute(
            'SELECT DeviceID, DeviceName, DeviceType, Status, HouseID FROM iotdevices WHERE HouseID = ?',
            [1004]
        );
        
        if (devices.length === 0) {
            console.log('❌ No IoT devices found for house 1004!');
            
            // Kiểm tra tất cả IoT devices
            console.log('\n🔍 All IoT devices in database:');
            const [allDevices] = await connection.execute(
                'SELECT DeviceID, DeviceName, DeviceType, HouseID FROM iotdevices ORDER BY DeviceID DESC LIMIT 10'
            );
            
            if (allDevices.length === 0) {
                console.log('   No IoT devices in database at all!');
            } else {
                allDevices.forEach(device => {
                    console.log(`   ID: ${device.DeviceID} | Name: ${device.DeviceName} | Type: ${device.DeviceType} | House: ${device.HouseID}`);
                });
            }
        } else {
            console.log(`✅ Found ${devices.length} IoT devices:`);
            devices.forEach(device => {
                console.log(`   - ${device.DeviceName} (${device.DeviceType}) - Status: ${device.Status}`);
            });
        }

        // Test API call
        console.log('\n🌐 Testing API call:');
        console.log(`   URL: http://localhost:3001/api/houses/1004`);
        console.log('   Expected: iotDevices array in response');

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
checkIoTDevices();



