/**
 * Script để seed một số nhà với Premium và Pro packages để test chức năng
 * Chạy: node scripts/seed-premium-pro-houses.js
 */

const { initModels } = require('../models/init-models');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { Op } = require('sequelize');

const { houses, users, userpackages, packages } = initModels(sequelize);

async function seedHouses() {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu nhà Premium và Pro...\n');

    // 1. Tìm hoặc tạo users với Premium và Pro packages
    console.log('📋 Bước 1: Tìm users có Premium và Pro packages...');
    
    // Tìm package IDs (chỉ lấy các field cần thiết)
    const premiumPackage = await packages.findOne({ 
      where: { name: 'PREMIUM' },
      attributes: ['id', 'name']
    });
    const proPackage = await packages.findOne({ 
      where: { name: 'PRO' },
      attributes: ['id', 'name']
    });
    
    if (!premiumPackage || !proPackage) {
      console.error('❌ Không tìm thấy packages PREMIUM hoặc PRO trong database!');
      console.log('💡 Hãy đảm bảo đã chạy migration packages trước.');
      process.exit(1);
    }

    // Tìm users có Premium package (active)
    const premiumUsers = await users.findAll({
      include: [{
        model: userpackages,
        as: 'userpackages',
        where: {
          package_id: premiumPackage.id,
          end_at: { [Op.gt]: new Date() },
          status: 'active'
        },
        required: true
      }],
      limit: 2
    });

    // Tìm users có Pro package (active)
    const proUsers = await users.findAll({
      include: [{
        model: userpackages,
        as: 'userpackages',
        where: {
          package_id: proPackage.id,
          end_at: { [Op.gt]: new Date() },
          status: 'active'
        },
        required: true
      }],
      limit: 2
    });

    // Tìm users Free (không có package hoặc package hết hạn)
    const freeUsers = await users.findAll({
      include: [{
        model: userpackages,
        as: 'userpackages',
        required: false
      }],
      limit: 2
    });

    console.log(`✅ Tìm thấy ${premiumUsers.length} user Premium, ${proUsers.length} user Pro, ${freeUsers.length} user Free\n`);

    if (premiumUsers.length === 0 && proUsers.length === 0) {
      console.log('⚠️ Không tìm thấy user nào có Premium hoặc Pro package!');
      console.log('💡 Hãy tạo user và assign package trước khi chạy script này.');
      console.log('💡 Hoặc script sẽ tạo nhà cho user đầu tiên (giả định là Premium/Pro).\n');
    }

    // 2. Tạo dữ liệu nhà mẫu
    const sampleHouses = [
      // PREMIUM HOUSES
      {
        title: '🏆 Biệt thự cao cấp Premium - Quận 1, TP.HCM',
        description: 'Biệt thự sang trọng, đầy đủ tiện ích, vị trí đắc địa tại trung tâm thành phố. Thiết kế hiện đại, không gian rộng rãi, phù hợp cho gia đình đa thế hệ.',
        price: 15000000000, // 15 tỷ
        propertyType: 'Villa',
        address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        area: 350,
        bedrooms: 5,
        bathrooms: 4,
        tierLevel: 3, // PREMIUM
        priorityScore: 3,
        isBoosted: true, // BOOSTED
        boostExpiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 giờ
        status: 'Available'
      },
      {
        title: '👑 Căn hộ Penthouse Premium - Quận 2, TP.HCM',
        description: 'Căn hộ penthouse view sông, thiết kế sang trọng, nội thất cao cấp. Tầng thượng có hồ bơi riêng và sân vườn.',
        price: 8500000000, // 8.5 tỷ
        propertyType: 'Apartment',
        address: '456 Đường Mai Chí Thọ, Phường An Phú, Quận 2, TP.HCM',
        area: 280,
        bedrooms: 4,
        bathrooms: 3,
        tierLevel: 3, // PREMIUM
        priorityScore: 3,
        isBoosted: false,
        boostExpiresAt: null,
        status: 'Available'
      },
      {
        title: '💎 Nhà phố Premium - Quận 7, TP.HCM',
        description: 'Nhà phố mặt tiền, thiết kế hiện đại, gần trung tâm thương mại và trường học quốc tế.',
        price: 12000000000, // 12 tỷ
        propertyType: 'Townhouse',
        address: '789 Đường Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM',
        area: 200,
        bedrooms: 4,
        bathrooms: 3,
        tierLevel: 3, // PREMIUM
        priorityScore: 3,
        isBoosted: true, // BOOSTED
        boostExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 giờ
        status: 'Available'
      },
      // PRO HOUSES
      {
        title: '⭐ Căn hộ Pro - Quận 3, TP.HCM',
        description: 'Căn hộ chung cư cao cấp, vị trí thuận lợi, gần trung tâm. Nội thất đầy đủ, sẵn sàng vào ở.',
        price: 4500000000, // 4.5 tỷ
        propertyType: 'Apartment',
        address: '321 Đường Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
        area: 120,
        bedrooms: 3,
        bathrooms: 2,
        tierLevel: 2, // PRO
        priorityScore: 2,
        isBoosted: false,
        boostExpiresAt: null,
        status: 'Available'
      },
      {
        title: '⭐ Nhà phố Pro - Quận Bình Thạnh, TP.HCM',
        description: 'Nhà phố 3 tầng, thiết kế đẹp, phù hợp cho gia đình trẻ. Gần trường học và bệnh viện.',
        price: 6800000000, // 6.8 tỷ
        propertyType: 'Townhouse',
        address: '654 Đường Xô Viết Nghệ Tĩnh, Phường 25, Quận Bình Thạnh, TP.HCM',
        area: 150,
        bedrooms: 4,
        bathrooms: 2,
        tierLevel: 2, // PRO
        priorityScore: 2,
        isBoosted: true, // BOOSTED
        boostExpiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 giờ
        status: 'Available'
      },
      {
        title: '⭐ Đất nền Pro - Quận 9, TP.HCM',
        description: 'Đất nền mặt tiền đường lớn, pháp lý rõ ràng, tiềm năng đầu tư cao. Gần khu công nghiệp và trung tâm thương mại.',
        price: 2500000000, // 2.5 tỷ
        propertyType: 'Land',
        address: '987 Đường Đỗ Xuân Hợp, Phường Phước Long B, Quận 9, TP.HCM',
        area: 100,
        bedrooms: 0,
        bathrooms: 0,
        tierLevel: 2, // PRO
        priorityScore: 2,
        isBoosted: false,
        boostExpiresAt: null,
        status: 'Available'
      },
      // FREE HOUSES (để so sánh)
      {
        title: 'Nhà phố - Quận 12, TP.HCM',
        description: 'Nhà phố 2 tầng, giá rẻ, phù hợp cho người có thu nhập trung bình.',
        price: 3200000000, // 3.2 tỷ
        propertyType: 'Townhouse',
        address: '111 Đường Tân Thới Hiệp, Phường Tân Thới Hiệp, Quận 12, TP.HCM',
        area: 80,
        bedrooms: 3,
        bathrooms: 1,
        tierLevel: 1, // FREE
        priorityScore: 1,
        isBoosted: false,
        boostExpiresAt: null,
        status: 'Available'
      },
      {
        title: 'Căn hộ - Quận Tân Bình, TP.HCM',
        description: 'Căn hộ giá rẻ, vị trí ổn định, phù hợp cho người độc thân hoặc cặp đôi trẻ.',
        price: 1800000000, // 1.8 tỷ
        propertyType: 'Apartment',
        address: '222 Đường Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM',
        area: 60,
        bedrooms: 2,
        bathrooms: 1,
        tierLevel: 1, // FREE
        priorityScore: 1,
        isBoosted: false,
        boostExpiresAt: null,
        status: 'Available'
      }
    ];

    // 3. Assign owners cho từng nhà
    console.log('📋 Bước 2: Tạo nhà với owners tương ứng...\n');
    
    let premiumIndex = 0;
    let proIndex = 0;
    let freeIndex = 0;
    const createdHouses = [];

    for (const houseData of sampleHouses) {
      let ownerId;
      
      if (houseData.tierLevel === 3) {
        // Premium house
        if (premiumUsers.length > 0) {
          ownerId = premiumUsers[premiumIndex % premiumUsers.length].UserID;
          premiumIndex++;
        } else {
          // Fallback: dùng user đầu tiên
          const firstUser = await users.findOne({ limit: 1 });
          if (!firstUser) {
            console.error('❌ Không tìm thấy user nào trong database!');
            process.exit(1);
          }
          ownerId = firstUser.UserID;
          console.log(`⚠️ Dùng user ${ownerId} cho Premium house (không có Premium user)`);
        }
      } else if (houseData.tierLevel === 2) {
        // Pro house
        if (proUsers.length > 0) {
          ownerId = proUsers[proIndex % proUsers.length].UserID;
          proIndex++;
        } else {
          // Fallback: dùng user đầu tiên
          const firstUser = await users.findOne({ limit: 1 });
          if (!firstUser) {
            console.error('❌ Không tìm thấy user nào trong database!');
            process.exit(1);
          }
          ownerId = firstUser.UserID;
          console.log(`⚠️ Dùng user ${ownerId} cho Pro house (không có Pro user)`);
        }
      } else {
        // Free house
        if (freeUsers.length > 0) {
          ownerId = freeUsers[freeIndex % freeUsers.length].UserID;
          freeIndex++;
        } else {
          // Fallback: dùng user đầu tiên
          const firstUser = await users.findOne({ limit: 1 });
          if (!firstUser) {
            console.error('❌ Không tìm thấy user nào trong database!');
            process.exit(1);
          }
          ownerId = firstUser.UserID;
        }
      }

      // Tạo nhà
      const house = await houses.create({
        OwnerID: ownerId,
        Title: houseData.title,
        Description: houseData.description,
        Price: houseData.price,
        HouseType: houseData.propertyType,
        Address: houseData.address,
        Area: houseData.area,
        Bedrooms: houseData.bedrooms,
        Bathrooms: houseData.bathrooms,
        Status: houseData.status,
        TierLevel: houseData.tierLevel,
        PriorityScore: houseData.priorityScore,
        IsBoosted: houseData.isBoosted,
        BoostExpiresAt: houseData.boostExpiresAt
      });

      createdHouses.push(house);
      
      const tierName = houseData.tierLevel === 3 ? 'PREMIUM' : houseData.tierLevel === 2 ? 'PRO' : 'FREE';
      const boostStatus = houseData.isBoosted ? '🚀 BOOSTED' : '';
      console.log(`✅ Đã tạo nhà #${house.HouseID}: ${houseData.title.substring(0, 50)}... [${tierName}] ${boostStatus}`);
    }

    console.log(`\n🎉 Hoàn thành! Đã tạo ${createdHouses.length} nhà:`);
    console.log(`   - ${createdHouses.filter(h => h.TierLevel === 3).length} nhà PREMIUM`);
    console.log(`   - ${createdHouses.filter(h => h.TierLevel === 2).length} nhà PRO`);
    console.log(`   - ${createdHouses.filter(h => h.TierLevel === 1).length} nhà FREE`);
    console.log(`   - ${createdHouses.filter(h => h.IsBoosted).length} nhà đang BOOSTED\n`);

    console.log('💡 Bây giờ bạn có thể:');
    console.log('   1. Vào Homepage để xem thứ tự hiển thị (Boost > Premium > Pro > Free)');
    console.log('   2. Kiểm tra badges và styling khác nhau giữa các tier');
    console.log('   3. Test sorting algorithm hoạt động đúng\n');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Chạy script
seedHouses();

