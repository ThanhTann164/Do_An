const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { packages, userpackages, houses } = require('../models/init-models')(sequelize);
const AppError = require('../Utils/AppError');

/**
 * Kích hoạt gói cho user sau khi thanh toán thành công.
 * Được dùng bởi callback của các cổng thanh toán.
 *
 * @param {Object} params
 * @param {number} params.userId
 * @param {string} params.packageName - 'PRO' | 'PREMIUM'
 * @param {string} params.transactionId
 * @param {string} params.gateway - 'momo' | 'vnpay' | 'zalopay'
 */
async function activateUserPackage({ userId, packageName, transactionId, gateway }) {
  const normalized = (packageName || '').toUpperCase();

  if (!userId || !normalized) {
    throw new AppError('Thiếu thông tin user hoặc gói dịch vụ để kích hoạt', 400);
  }

  if (!['PRO', 'PREMIUM'].includes(normalized)) {
    throw new AppError('Chỉ hỗ trợ kích hoạt gói PRO hoặc PREMIUM thông qua thanh toán', 400);
  }

  console.log('💳 [PaymentPackage] Activating package for user', {
    userId,
    packageName: normalized,
    transactionId,
    gateway,
  });

  const selectedPackage = await packages.findOne({
    where: {
      name: normalized,
      is_active: true,
    },
  });

  if (!selectedPackage) {
    throw new AppError(`Không tìm thấy cấu hình gói ${normalized}`, 404);
  }

  // Hủy gói đang active (nếu có)
  const existingPackage = await userpackages.findOne({
    where: {
      user_id: userId,
      status: 'active',
    },
  });

  if (existingPackage) {
    const endAt = new Date(existingPackage.end_at);
    const now = new Date();

    if (endAt > now) {
      await existingPackage.update({ status: 'cancelled' });
      console.log(`🔄 [PaymentPackage] Cancelled existing package ${existingPackage.id} for user ${userId}`);
    } else {
      await existingPackage.update({ status: 'expired' });
      console.log(`⏰ [PaymentPackage] Marked package ${existingPackage.id} as expired`);
    }
  }

  // Tính toán thời gian bắt đầu / kết thúc
  const startAt = new Date();
  const endAt = new Date();
  endAt.setDate(startAt.getDate() + (selectedPackage.duration_days || 30));

  const finalTransactionId =
    transactionId || `${(gateway || 'PAY').toUpperCase()}_${Date.now()}_${userId}`;

  const newUserPackage = await userpackages.create({
    user_id: userId,
    package_id: selectedPackage.id,
    start_at: startAt,
    end_at: endAt,
    purchase_price: selectedPackage.price,
    payment_method: gateway || 'manual',
    transaction_id: finalTransactionId,
    status: 'active',
    boost_used_today: 0,
    last_boost_reset: new Date().toISOString().split('T')[0],
  });

  // Cập nhật tất cả houses của user theo quyền của gói
  await houses.update(
    {
      priority_level: selectedPackage.priority_level,
      highlight: selectedPackage.highlight,
      top_priority: selectedPackage.top_priority,
      banner_enabled: selectedPackage.banner_enabled,
      verified_seller_badge: selectedPackage.verified_seller_badge,
      max_cover_media: selectedPackage.max_cover_media,
    },
    {
      where: {
        OwnerID: userId,
        Status: 'available',
      },
    },
  );

  console.log('✅ [PaymentPackage] Package activated successfully', {
    userId,
    packageId: selectedPackage.id,
    packageName: selectedPackage.name,
  });

  return {
    userPackage: newUserPackage,
    package: selectedPackage,
    startAt,
    endAt,
    transactionId: finalTransactionId,
  };
}

module.exports = {
  activateUserPackage,
};




