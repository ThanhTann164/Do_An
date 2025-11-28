/**
 * Script tạo transaction test cho Buyer
 * Để test tính năng "My House" cho role Buyer
 * 
 * Cách chạy:
 * node scripts/create-test-transaction.js
 */

const sequelize = require('../config/sequelize');
const initModels = require('../models/init-models');
const { users, houses, transactions } = initModels(sequelize);

async function createTestTransaction() {
  try {
    console.log('🚀 Bắt đầu tạo transaction test...\n');

    // 1. Tìm Buyer
    console.log('🔍 Tìm tài khoản Buyer...');
    const buyer = await users.findOne({
      where: { Role: 'Buyer' },
      attributes: ['UserID', 'Email', 'FullName', 'Role']
    });

    if (!buyer) {
      console.error('❌ Không tìm thấy tài khoản Buyer nào!');
      console.log('💡 Hãy đăng ký tài khoản Buyer hoặc tạo trong database:');
      console.log('   INSERT INTO users (FullName, Email, PhoneNumber, PasswordHash, Role, Status)');
      console.log('   VALUES ("Test Buyer", "buyer@test.com", "0123456789", "$2a$12$...", "Buyer", "Active");');
      return;
    }

    console.log(`✅ Tìm thấy Buyer: ${buyer.FullName} (${buyer.Email})`);
    console.log(`   UserID: ${buyer.UserID}\n`);

    // 2. Tìm House
    console.log('🔍 Tìm nhà có sẵn...');
    const house = await houses.findOne({
      where: { Status: 'Available' },
      attributes: ['HouseID', 'Title', 'Address', 'Price', 'OwnerID']
    });

    if (!house) {
      console.error('❌ Không tìm thấy nhà nào có sẵn!');
      console.log('💡 Hãy tạo nhà bằng tài khoản Seller trước.');
      return;
    }

    console.log(`✅ Tìm thấy nhà: ${house.Title}`);
    console.log(`   HouseID: ${house.HouseID}`);
    console.log(`   Địa chỉ: ${house.Address}`);
    console.log(`   Giá: ${house.Price.toLocaleString('vi-VN')} VNĐ\n`);

    // 3. Kiểm tra transaction đã tồn tại chưa
    console.log('🔍 Kiểm tra transaction đã tồn tại...');
    const existingTransaction = await transactions.findOne({
      where: {
        BuyerID: buyer.UserID,
        HouseID: house.HouseID
      }
    });

    if (existingTransaction) {
      console.log(`⚠️  Transaction đã tồn tại!`);
      console.log(`   TransactionID: ${existingTransaction.TransactionID}`);
      console.log(`   Status: ${existingTransaction.Status}`);
      console.log(`   Amount: ${existingTransaction.Amount.toLocaleString('vi-VN')} VNĐ`);
      
      // Hỏi có muốn tạo transaction khác không
      console.log('\n💡 Bạn có thể:');
      console.log('   1. Dùng transaction này để test');
      console.log('   2. Sửa script để tạo transaction với nhà khác');
      return;
    }

    // 4. Tạo transaction mới
    console.log('📝 Tạo transaction mới...');
    const newTransaction = await transactions.create({
      BuyerID: buyer.UserID,
      HouseID: house.HouseID,
      Amount: house.Price,
      Status: 'Completed', // Hoặc 'Pending'
      PaymentMethod: 'Bank',
      coIsPaidToEscrow: true,
      IsReleasedToSeller: false
    });

    console.log('✅ Tạo transaction thành công!');
    console.log(`   TransactionID: ${newTransaction.TransactionID}`);
    console.log(`   BuyerID: ${newTransaction.BuyerID}`);
    console.log(`   HouseID: ${newTransaction.HouseID}`);
    console.log(`   Amount: ${newTransaction.Amount.toLocaleString('vi-VN')} VNĐ`);
    console.log(`   Status: ${newTransaction.Status}`);
    console.log(`   PaymentMethod: ${newTransaction.PaymentMethod}\n`);

    // 5. Kiểm tra kết quả
    console.log('🔍 Kiểm tra lại transaction...');
    const verifyTransaction = await transactions.findOne({
      where: { TransactionID: newTransaction.TransactionID },
      include: [
        {
          model: houses,
          as: 'House',
          attributes: ['HouseID', 'Title', 'Address']
        }
      ]
    });

    console.log('✅ Xác nhận transaction:');
    console.log(`   Buyer: ${buyer.FullName} (ID: ${buyer.UserID})`);
    console.log(`   House: ${verifyTransaction.House.Title} (ID: ${verifyTransaction.House.HouseID})`);
    console.log(`   Status: ${verifyTransaction.Status}\n`);

    // 6. Hướng dẫn test
    console.log('🎯 Cách test:');
    console.log(`   1. Đăng nhập bằng email: ${buyer.Email}`);
    console.log(`   2. Vào trang "My House" (/myhome)`);
    console.log(`   3. Bạn sẽ thấy nhà: ${house.Title}\n`);

    console.log('✅ Hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi khi tạo transaction:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Chạy script
createTestTransaction();

