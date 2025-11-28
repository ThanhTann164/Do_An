const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../../config.env') });

async function seedIoTDevices() {
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

        // Kiểm tra xem có house nào chưa, nếu chưa thì tạo house mẫu
        const [houses] = await connection.execute('SELECT * FROM houses LIMIT 1');
        
        let houseId = 1;
        if (houses.length === 0) {
            // Tạo house mẫu
            await connection.execute(`
                INSERT INTO houses (HouseID, OwnerID, Title, Description, Address, HouseType, Price, Status) 
                VALUES (1, 1, 'Nhà mẫu cho IoT', 'Căn nhà được trang bị các thiết bị IoT thông minh', '123 Đường ABC, Quận 1, TP.HCM', 'Apartment', 5000000000, 'Available')
            `);
            console.log('✅ Created sample house');
        } else {
            houseId = houses[0].HouseID;
        }

        // Xóa dữ liệu cũ nếu có
        await connection.execute('DELETE FROM iotdevices');
        console.log('✅ Cleared existing IoT devices');

        // Thêm dữ liệu thiết bị IoT dựa trên bảng của bạn
        const devices = [
            {
                DeviceID: 1,
                HouseID: houseId,
                DeviceName: 'Cảnh báo cháy',
                DeviceType: 'Actuator',
                Status: 'Active'
            },
            {
                DeviceID: 2,
                HouseID: houseId,
                DeviceName: 'Cảm biến nhiệt độ',
                DeviceType: 'Sensor',
                Status: 'Active'
            },
            {
                DeviceID: 3,
                HouseID: houseId,
                DeviceName: 'Cảm biến độ ẩm',
                DeviceType: 'Sensor',
                Status: 'Active'
            },
            {
                DeviceID: 4,
                HouseID: houseId,
                DeviceName: 'Đèn thông minh',
                DeviceType: 'Actuator',
                Status: 'Active'
            },
            {
                DeviceID: 5,
                HouseID: houseId,
                DeviceName: 'Phát đồ thông minh',
                DeviceType: 'Actuator',
                Status: 'Active'
            }
        ];

        for (const device of devices) {
            await connection.execute(`
                INSERT INTO iotdevices (DeviceID, HouseID, DeviceName, DeviceType, Status) 
                VALUES (?, ?, ?, ?, ?)
            `, [device.DeviceID, device.HouseID, device.DeviceName, device.DeviceType, device.Status]);
        }

        console.log('✅ Successfully seeded IoT devices:');
        devices.forEach(device => {
            console.log(`   - ${device.DeviceName} (${device.DeviceType}) - ${device.Status}`);
        });

    } catch (error) {
        console.error('❌ Error seeding IoT devices:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    seedIoTDevices();
}

module.exports = { seedIoTDevices };
