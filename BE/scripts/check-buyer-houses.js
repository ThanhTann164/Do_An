/**
 * Script kiểm tra nhà của Buyer
 * Hiển thị danh sách transaction và nhà của tất cả Buyer
 * 
 * Cách chạy:
 * node scripts/check-buyer-houses.js
 */

const sequelize = require('../config/sequelize');
const initModels = require('../models/init-models');
const { users, houses, transactions, houseimages } = initModels(sequelize);
const { Op } = require('sequelize');

async function checkBuyerHouses() {
  try {
    console.log('🔍 Kiểm tra nhà của Buyer...\n');

    // 1. Lấy tất cả Buyer
    console.log('📋 Danh sách Buyer:');
    const buyers = await users.findAll({
      where: { Role: 'Buyer' },
      attributes: ['UserID', 'Email', 'FullName'],
      raw: true
    });

    if (buyers.length === 0) {
      console.log('❌ Không có Buyer nào trong hệ thống!\n');
      return;
    }

    console.log(`✅ Tìm thấy ${buyers.length} Buyer\n`);

    // 2. Kiểm tra từng Buyer
    for (const buyer of buyers) {
      console.log('━'.repeat(60));
      console.log(`👤 Buyer: ${buyer.FullName} (${buyer.Email})`);
      console.log(`   UserID: ${buyer.UserID}`);

      // Lấy transactions
      const buyerTransactions = await transactions.findAll({
        where: { 
          BuyerID: buyer.UserID,
          Status: { [Op.in]: ['Pending', 'Completed'] }
        },
        include: [
          {
            model: houses,
            as: 'House',
            attributes: ['HouseID', 'Title', 'Address', 'Price', 'Status'],
            include: [
              {
                model: houseimages,
                as: 'houseimages',
                attributes: ['ImageID', 'IsCover']
              }
            ]
          }
        ],
        order: [['CreatedAt', 'DESC']],
        raw: false
      });

      if (buyerTransactions.length === 0) {
        console.log('   ❌ Chưa có transaction nào');
        console.log('   💡 Buyer này sẽ không thấy nhà trong "My House"\n');
        continue;
      }

      console.log(`   ✅ Có ${buyerTransactions.length} transaction:\n`);

      buyerTransactions.forEach((trans, index) => {
        const house = trans.House;
        const imageCount = house?.houseimages?.length || 0;
        
        console.log(`   ${index + 1}. Transaction #${trans.TransactionID}`);
        console.log(`      Status: ${trans.Status}`);
        console.log(`      Amount: ${trans.Amount.toLocaleString('vi-VN')} VNĐ`);
        console.log(`      PaymentMethod: ${trans.PaymentMethod}`);
        
        if (house) {
          console.log(`      House: ${house.Title} (ID: ${house.HouseID})`);
          console.log(`      Address: ${house.Address}`);
          console.log(`      Price: ${house.Price.toLocaleString('vi-VN')} VNĐ`);
          console.log(`      Images: ${imageCount} ảnh`);
          console.log(`      Status: ${house.Status}`);
        } else {
          console.log(`      ⚠️  House không tồn tại hoặc đã bị xóa`);
        }
        console.log('');
      });
    }

    console.log('━'.repeat(60));
    console.log('\n📊 Tổng kết:');
    
    // Tổng hợp thống kê
    const totalTransactions = await transactions.count({
      where: { Status: { [Op.in]: ['Pending', 'Completed'] } }
    });
    
    const buyersWithHouses = await transactions.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('BuyerID')), 'BuyerID']],
      where: { Status: { [Op.in]: ['Pending', 'Completed'] } },
      raw: true
    });

    console.log(`   - Tổng số Buyer: ${buyers.length}`);
    console.log(`   - Buyer có nhà: ${buyersWithHouses.length}`);
    console.log(`   - Buyer chưa có nhà: ${buyers.length - buyersWithHouses.length}`);
    console.log(`   - Tổng transactions: ${totalTransactions}\n`);

    // 3. Hướng dẫn
    console.log('💡 Lưu ý:');
    console.log('   - Buyer chỉ thấy nhà khi có transaction với status Pending hoặc Completed');
    console.log('   - Nếu Buyer chưa có transaction, trang "My House" sẽ trống');
    console.log('   - Để tạo transaction test, chạy: node scripts/create-test-transaction.js\n');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Chạy script
checkBuyerHouses();

