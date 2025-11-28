const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

// Import database connection
const getSequelizeInstance = require('../utils/sequelize-instance');

// Set Vietnamese locale for faker (v8+ uses different API)
try {
    faker.setLocale('vi');
} catch (e) {
    // Fallback for newer versions
    console.log('Using default locale for faker');
}

async function seedDashboardDataSimple() {
    console.log('🌱 Starting Simple Dashboard Data Seeding...');
    
    try {
        const sequelize = getSequelizeInstance();
        
        console.log('✅ Database connection established');
        
        // 1. SEED USERS (5 tháng gần nhất)
        console.log('👥 Seeding users...');
        const currentDate = new Date();
        
        // Create users for last 5 months
        for (let monthOffset = 4; monthOffset >= 0; monthOffset--) {
            const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
            const usersThisMonth = faker.number.int({ min: 8, max: 15 });
            
            for (let i = 0; i < usersThisMonth; i++) {
                const randomDay = faker.number.int({ min: 1, max: 28 });
                const createdAt = new Date(targetDate.getFullYear(), targetDate.getMonth(), randomDay);
                
                // Role distribution: 60% Buyer, 30% Seller, 10% Admin
                let role = 'Buyer';
                const roleRandom = Math.random();
                if (roleRandom < 0.1) role = 'Admin';
                else if (roleRandom < 0.4) role = 'Seller';
                
                const fullName = faker.person.fullName();
                const email = faker.internet.email().toLowerCase();
                const phone = `09${faker.number.int({ min: 10000000, max: 99999999 })}`;
                const passwordHash = await bcrypt.hash('123456789', 10);
                const gender = faker.helpers.arrayElement(['Nam', 'Nữ']);
                const address = `${faker.location.streetAddress()}, ${faker.location.city()}`;
                const bio = faker.lorem.sentence();
                
                try {
                    await sequelize.query(`
                        INSERT IGNORE INTO users 
                        (FullName, Email, PhoneNumber, PasswordHash, Role, Status, Gender, Address, Bio, CreatedAt, UpdatedAt) 
                        VALUES (?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?)
                    `, {
                        replacements: [fullName, email, phone, passwordHash, role, gender, address, bio, createdAt, createdAt]
                    });
                } catch (err) {
                    // Ignore duplicate entries
                    if (!err.message.includes('Duplicate entry')) {
                        console.error('Error inserting user:', err.message);
                    }
                }
            }
        }
        
        // Get all users for relationships
        const [allUsers] = await sequelize.query('SELECT UserID, Role, FullName FROM users ORDER BY UserID DESC LIMIT 200');
        const sellers = allUsers.filter(u => u.Role === 'Seller');
        const buyers = allUsers.filter(u => u.Role === 'Buyer');
        const admins = allUsers.filter(u => u.Role === 'Admin');
        
        console.log(`✅ Users ready: ${buyers.length} Buyers, ${sellers.length} Sellers, ${admins.length} Admins`);
        
        // 2. SEED HOUSES (Properties)
        console.log('🏠 Seeding houses...');
        
        if (sellers.length > 0) {
            for (let i = 0; i < Math.min(25, sellers.length * 2); i++) {
                const seller = faker.helpers.arrayElement(sellers);
                const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, 1);
                const endDate = new Date(currentDate);
                const createdDate = faker.date.between({ from: startDate, to: endDate });
                
                const houseTypes = ['Apartment', 'Townhouse', 'Villa', 'Land'];
                const houseType = faker.helpers.arrayElement(houseTypes);
                
                const title = `${houseType} ${faker.location.street()} - ${faker.commerce.productAdjective()}`;
                const description = faker.lorem.paragraphs(2);
                const address = `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`;
                const price = faker.number.int({ min: 500000000, max: 15000000000 }); // 500M - 15B VND
                const bathrooms = faker.number.int({ min: 1, max: 4 });
                const bedrooms = faker.number.int({ min: 1, max: 5 });
                const area = faker.number.int({ min: 30, max: 500 });
                const orientation = faker.helpers.arrayElement(['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Tây Nam']);
                
                try {
                    await sequelize.query(`
                        INSERT IGNORE INTO houses 
                        (OwnerID, Title, Description, Address, HouseType, Price, Bathrooms, Bedrooms, Area, Status, Orientation, createdAt, updatedAt) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Available', ?, ?, ?)
                    `, {
                        replacements: [seller.UserID, title, description, address, houseType, price, bathrooms, bedrooms, area, orientation, createdDate, createdDate]
                    });
                } catch (err) {
                    console.error('Error inserting house:', err.message);
                }
            }
        }
        
        // Get all houses for transactions
        const [allHouses] = await sequelize.query('SELECT HouseID FROM houses ORDER BY HouseID DESC LIMIT 50');
        console.log(`✅ Houses ready: ${allHouses.length} properties`);
        
        // 3. SEED TRANSACTIONS (Revenue Data)
        console.log('💰 Seeding transactions...');
        
        if (buyers.length > 0 && allHouses.length > 0) {
            // Create revenue data for last 5 months with increasing trend
            const baseRevenues = [12500000, 15900000, 18200000, 20700000, 23800000]; // VND
            
            for (let monthOffset = 4; monthOffset >= 0; monthOffset--) {
                const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
                const transactionsThisMonth = faker.number.int({ min: 3, max: 8 });
                const baseRevenue = baseRevenues[4 - monthOffset];
                
                for (let i = 0; i < transactionsThisMonth; i++) {
                    const randomDay = faker.number.int({ min: 1, max: 28 });
                    const transactionDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), randomDay);
                    
                    const buyer = faker.helpers.arrayElement(buyers);
                    const house = faker.helpers.arrayElement(allHouses);
                    
                    // Distribute revenue across transactions with some variation
                    const amount = Math.floor(baseRevenue / transactionsThisMonth * (0.8 + Math.random() * 0.4));
                    const status = faker.helpers.arrayElement(['Completed', 'Completed', 'Completed', 'Pending']); // 75% completed
                    const paymentMethod = faker.helpers.arrayElement(['Bank', 'CreditCard', 'EWallet']);
                    const isReleased = faker.datatype.boolean();
                    const staffId = admins.length > 0 ? faker.helpers.arrayElement(admins).UserID : null;
                    
                    try {
                        await sequelize.query(`
                            INSERT IGNORE INTO transactions 
                            (BuyerID, HouseID, Amount, Status, PaymentMethod, coIsPaidToEscrow, IsReleasedToSeller, StaffID, CreatedAt) 
                            VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
                        `, {
                            replacements: [buyer.UserID, house.HouseID, amount, status, paymentMethod, isReleased, staffId, transactionDate]
                        });
                    } catch (err) {
                        console.error('Error inserting transaction:', err.message);
                    }
                }
            }
        }
        
        // 4. SEED AUDIT LOGS (Activity Logs)
        console.log('📝 Seeding audit logs...');
        
        // Create activity logs for last 7 days
        const activities = [
            'Đăng nhập hệ thống',
            'Đăng xuất khỏi hệ thống',
            'Cập nhật thông tin cá nhân',
            'Tạo bài đăng bán nhà mới',
            'Cập nhật thông tin nhà',
            'Tạo giao dịch mua nhà',
            'Thay đổi mật khẩu',
            'Xác thực email',
            'Xem chi tiết nhà',
            'Liên hệ người bán',
            'Thêm nhà yêu thích',
            'Tìm kiếm nhà',
            'Đăng nhập thất bại',
            'Tài khoản bị khóa',
            'Bảo trì hệ thống'
        ];
        
        for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - dayOffset);
            
            const logsThisDay = faker.number.int({ min: 5, max: 12 });
            
            for (let i = 0; i < logsThisDay; i++) {
                const randomHour = faker.number.int({ min: 6, max: 23 });
                const randomMinute = faker.number.int({ min: 0, max: 59 });
                const logDate = new Date(targetDate);
                logDate.setHours(randomHour, randomMinute, 0, 0);
                
                const user = faker.helpers.arrayElement(allUsers);
                const action = faker.helpers.arrayElement(activities);
                const details = `${user.FullName} - ${action} lúc ${logDate.toLocaleString('vi-VN')}`;
                const flag = faker.helpers.arrayElement(['Normal', 'Normal', 'Normal', 'SuspiciousChat']); // 75% normal
                
                try {
                    await sequelize.query(`
                        INSERT IGNORE INTO auditlogs 
                        (UserID, Action, Details, Flag, CreatedAt) 
                        VALUES (?, ?, ?, ?, ?)
                    `, {
                        replacements: [user.UserID, action, details, flag, logDate]
                    });
                } catch (err) {
                    console.error('Error inserting audit log:', err.message);
                }
            }
        }
        
        // 5. SUMMARY
        console.log('\n🎉 SEED DATA SUMMARY:');
        console.log('='.repeat(50));
        
        const [userStats] = await sequelize.query('SELECT COUNT(*) as total FROM users');
        const [buyerStats] = await sequelize.query('SELECT COUNT(*) as total FROM users WHERE Role = "Buyer"');
        const [sellerStats] = await sequelize.query('SELECT COUNT(*) as total FROM users WHERE Role = "Seller"');
        const [adminStats] = await sequelize.query('SELECT COUNT(*) as total FROM users WHERE Role = "Admin"');
        const [houseStats] = await sequelize.query('SELECT COUNT(*) as total FROM houses');
        const [transactionStats] = await sequelize.query('SELECT COUNT(*) as total FROM transactions');
        const [logStats] = await sequelize.query('SELECT COUNT(*) as total FROM auditlogs');
        const [revenueStats] = await sequelize.query('SELECT SUM(Amount) as total FROM transactions WHERE Status = "Completed"');
        
        console.log(`👥 Total Users: ${userStats[0].total}`);
        console.log(`   - Buyers: ${buyerStats[0].total}`);
        console.log(`   - Sellers: ${sellerStats[0].total}`);
        console.log(`   - Admins: ${adminStats[0].total}`);
        console.log(`🏠 Total Houses: ${houseStats[0].total}`);
        console.log(`💰 Total Transactions: ${transactionStats[0].total}`);
        console.log(`📝 Total Activity Logs: ${logStats[0].total}`);
        console.log(`💵 Total Revenue: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueStats[0].total || 0)}`);
        
        console.log('\n✅ Dashboard seed data created successfully!');
        console.log('🚀 You can now access Admin Dashboard with real data!');
        
        await sequelize.close();
        
    } catch (error) {
        console.error('❌ Error seeding dashboard data:', error);
        process.exit(1);
    }
}

// Run the seed function
if (require.main === module) {
    seedDashboardDataSimple()
        .then(() => {
            console.log('🎯 Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedDashboardDataSimple;
