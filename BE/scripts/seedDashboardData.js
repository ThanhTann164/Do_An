const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

// Import database connection
const getSequelizeInstance = require('../utils/sequelize-instance');
const initModels = require('../models/init-models');

// Set Vietnamese locale for faker
// Set Vietnamese locale for faker (v8+ uses different API)
try {
    faker.setLocale('vi');
} catch (e) {
    // Fallback for newer versions
    console.log('Using default locale for faker');
}

async function seedDashboardData() {
    console.log('🌱 Starting Dashboard Data Seeding...');
    
    try {
        const sequelize = getSequelizeInstance();
        const { users, houses, transactions, auditlogs } = initModels(sequelize);
        
        console.log('✅ Database connection established');
        
        // 1. SEED USERS (5 tháng gần nhất)
        console.log('👥 Seeding users...');
        const userSeedData = [];
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
                
                const userData = {
                    FullName: faker.person.fullName(),
                    Email: faker.internet.email().toLowerCase(),
                    PhoneNumber: `09${faker.number.int({ min: 10000000, max: 99999999 })}`,
                    PasswordHash: await bcrypt.hash('123456789', 10),
                    Role: role,
                    Status: 'Active',
                    Gender: faker.helpers.arrayElement(['Nam', 'Nữ']),
                    Address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
                    Bio: faker.lorem.sentence(),
                    createdAt: createdAt,
                    updatedAt: createdAt
                };
                
                userSeedData.push(userData);
            }
        }
        
        // Insert users in batches
        const createdUsers = await users.bulkCreate(userSeedData, { 
            ignoreDuplicates: true,
            returning: true 
        });
        console.log(`✅ Created ${createdUsers.length} users`);
        
        // Get all users for relationships
        const allUsers = await users.findAll();
        const sellers = allUsers.filter(u => u.Role === 'Seller');
        const buyers = allUsers.filter(u => u.Role === 'Buyer');
        const admins = allUsers.filter(u => u.Role === 'Admin');
        
        console.log(`📊 Users distribution: ${buyers.length} Buyers, ${sellers.length} Sellers, ${admins.length} Admins`);
        
        // 2. SEED HOUSES (Properties)
        console.log('🏠 Seeding houses...');
        const houseSeedData = [];
        
        if (sellers.length > 0) {
            for (let i = 0; i < Math.min(20, sellers.length * 2); i++) {
                const seller = faker.helpers.arrayElement(sellers);
                const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, 1);
                const endDate = new Date(currentDate);
                const createdDate = faker.date.between({ from: startDate, to: endDate });
                
                const houseTypes = ['Apartment', 'Townhouse', 'Villa', 'Land'];
                const houseType = faker.helpers.arrayElement(houseTypes);
                
                const houseData = {
                    OwnerID: seller.UserID,
                    Title: `${houseType} ${faker.location.street()} - ${faker.commerce.productAdjective()}`,
                    Description: faker.lorem.paragraphs(2),
                    Address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
                    HouseType: houseType,
                    Price: faker.number.int({ min: 500000000, max: 15000000000 }), // 500M - 15B VND
                    Bathrooms: faker.number.int({ min: 1, max: 4 }),
                    Bedrooms: faker.number.int({ min: 1, max: 5 }),
                    Area: faker.number.int({ min: 30, max: 500 }),
                    Status: 'Available',
                    Orientation: faker.helpers.arrayElement(['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Tây Nam']),
                    createdAt: createdDate,
                    updatedAt: createdDate
                };
                
                houseSeedData.push(houseData);
            }
            
            const createdHouses = await houses.bulkCreate(houseSeedData, { 
                ignoreDuplicates: true,
                returning: true 
            });
            console.log(`✅ Created ${createdHouses.length} houses`);
        }
        
        // 3. SEED TRANSACTIONS (Revenue Data)
        console.log('💰 Seeding transactions...');
        const transactionSeedData = [];
        const allHouses = await houses.findAll();
        
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
                    
                    const                     transactionData = {
                        BuyerID: buyer.UserID,
                        HouseID: house.HouseID,
                        Amount: amount,
                        Status: faker.helpers.arrayElement(['Completed', 'Completed', 'Completed', 'Pending']), // 75% completed
                        PaymentMethod: faker.helpers.arrayElement(['Bank', 'CreditCard', 'EWallet']),
                        coIsPaidToEscrow: true,
                        IsReleasedToSeller: faker.datatype.boolean(),
                        StaffID: admins.length > 0 ? faker.helpers.arrayElement(admins).UserID : null
                    };
                    
                    transactionSeedData.push(transactionData);
                }
            }
            
            const createdTransactions = await transactions.bulkCreate(transactionSeedData, { 
                ignoreDuplicates: true,
                returning: true,
                timestamps: false
            });
            console.log(`✅ Created ${createdTransactions.length} transactions`);
        }
        
        // 4. SEED AUDIT LOGS (Activity Logs)
        console.log('📝 Seeding audit logs...');
        const auditLogSeedData = [];
        
        // Create activity logs for last 7 days
        const activities = [
            'user_login',
            'user_logout', 
            'profile_update',
            'house_created',
            'house_updated',
            'transaction_created',
            'password_changed',
            'email_verified',
            'house_viewed',
            'contact_seller',
            'favorite_added',
            'search_performed',
            'failed_login',
            'account_locked',
            'system_maintenance'
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
                
                // Create Vietnamese action descriptions
                const actionDescriptions = {
                    'user_login': 'Đăng nhập hệ thống',
                    'user_logout': 'Đăng xuất khỏi hệ thống',
                    'profile_update': 'Cập nhật thông tin cá nhân',
                    'house_created': 'Tạo bài đăng bán nhà mới',
                    'house_updated': 'Cập nhật thông tin nhà',
                    'transaction_created': 'Tạo giao dịch mua nhà',
                    'password_changed': 'Thay đổi mật khẩu',
                    'email_verified': 'Xác thực email',
                    'house_viewed': 'Xem chi tiết nhà',
                    'contact_seller': 'Liên hệ người bán',
                    'favorite_added': 'Thêm nhà yêu thích',
                    'search_performed': 'Tìm kiếm nhà',
                    'failed_login': 'Đăng nhập thất bại',
                    'account_locked': 'Tài khoản bị khóa',
                    'system_maintenance': 'Bảo trì hệ thống'
                };
                
                const logData = {
                    UserID: user.UserID,
                    Action: actionDescriptions[action] || action,
                    Details: `${user.FullName} - ${actionDescriptions[action]} lúc ${logDate.toLocaleString('vi-VN')}`,
                    Flag: faker.helpers.arrayElement(['Normal', 'Normal', 'Normal', 'SuspiciousChat']) // 75% normal
                };
                
                auditLogSeedData.push(logData);
            }
        }
        
            const createdLogs = await auditlogs.bulkCreate(auditLogSeedData, { 
                ignoreDuplicates: true,
                returning: true,
                timestamps: false
            });
        console.log(`✅ Created ${createdLogs.length} audit logs`);
        
        // 5. SUMMARY
        console.log('\n🎉 SEED DATA SUMMARY:');
        console.log('='.repeat(50));
        
        const finalStats = {
            totalUsers: await users.count(),
            totalBuyers: await users.count({ where: { Role: 'Buyer' } }),
            totalSellers: await users.count({ where: { Role: 'Seller' } }),
            totalAdmins: await users.count({ where: { Role: 'Admin' } }),
            totalHouses: await houses.count(),
            totalTransactions: await transactions.count(),
            totalLogs: await auditlogs.count(),
            totalRevenue: await transactions.sum('Amount', { where: { Status: 'Completed' } }) || 0
        };
        
        console.log(`👥 Total Users: ${finalStats.totalUsers}`);
        console.log(`   - Buyers: ${finalStats.totalBuyers}`);
        console.log(`   - Sellers: ${finalStats.totalSellers}`);
        console.log(`   - Admins: ${finalStats.totalAdmins}`);
        console.log(`🏠 Total Houses: ${finalStats.totalHouses}`);
        console.log(`💰 Total Transactions: ${finalStats.totalTransactions}`);
        console.log(`📝 Total Activity Logs: ${finalStats.totalLogs}`);
        console.log(`💵 Total Revenue: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalStats.totalRevenue)}`);
        
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
    seedDashboardData()
        .then(() => {
            console.log('🎯 Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedDashboardData;
