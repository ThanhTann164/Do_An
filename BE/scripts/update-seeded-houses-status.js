/**
 * Script để update status của các nhà đã seed thành "Available"
 */

const { initModels } = require('../models/init-models');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { houses } = initModels(sequelize);
const { Op } = require('sequelize');

async function updateStatus() {
  try {
    console.log('🔄 Đang cập nhật status các nhà đã seed...\n');

    // Tìm các nhà có ID từ 1100-1107 (các nhà đã seed)
    const seededHouses = await houses.findAll({
      where: {
        HouseID: { [Op.between]: [1100, 1107] }
      }
    });

    console.log(`📋 Tìm thấy ${seededHouses.length} nhà đã seed\n`);

    if (seededHouses.length === 0) {
      console.log('⚠️ Không tìm thấy nhà nào trong khoảng ID 1100-1107');
      console.log('💡 Có thể các nhà đã seed có ID khác. Hãy kiểm tra database.\n');
      return;
    }

    // Update status thành "Available"
    let updated = 0;
    for (const house of seededHouses) {
      if (house.Status !== 'Available') {
        await house.update({ Status: 'Available' });
        updated++;
        console.log(`✅ Đã cập nhật nhà #${house.HouseID}: ${house.Title.substring(0, 50)}... (${house.Status} → Available)`);
      } else {
        console.log(`ℹ️  Nhà #${house.HouseID} đã có status Available`);
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updated}/${seededHouses.length} nhà thành Available\n`);

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật status:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Chạy script
updateStatus();

