const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { packages, payment_transactions } = require('../models/init-models')(sequelize);
const AppError = require('../Utils/AppError');
const { createVnpayPaymentUrl } = require('../payments/vnpay/utils/createPayment');
const { createZalopayPaymentUrl } = require('../payments/zalopay/utils/createPayment');

const SUPPORTED_GATEWAYS = ['momo', 'vnpay', 'zalopay'];

async function ensurePaymentTransactionsTable() {
  const qi = sequelize.getQueryInterface();
  try {
    await qi.describeTable('payment_transactions');
    return;
  } catch (err) {
    console.warn('⚠️  [PaymentGateway] payment_transactions table not found, creating...', err.message);
  }

  try {
    await qi.createTable('payment_transactions', {
      id: {
        type: sequelize.Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: sequelize.Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      gateway: {
        type: sequelize.Sequelize.ENUM('momo', 'vnpay', 'zalopay'),
        allowNull: false,
      },
      amount: {
        type: sequelize.Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      package_name: {
        type: sequelize.Sequelize.STRING(50),
        allowNull: false,
      },
      transaction_id: {
        type: sequelize.Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      raw_response: {
        type: sequelize.Sequelize.JSON,
        allowNull: true,
      },
      status: {
        type: sequelize.Sequelize.ENUM('pending', 'success', 'fail'),
        allowNull: false,
        defaultValue: 'pending',
      },
      created_at: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    console.log('✅ [PaymentGateway] payment_transactions table created');
  } catch (err) {
    console.error('❌ [PaymentGateway] Failed to create payment_transactions table:', err);
    throw err;
  }
}

/**
 * Tạo thanh toán cho gói dịch vụ qua cổng bất kỳ.
 *
 * @param {Object} params
 * @param {'momo'|'vnpay'|'zalopay'} params.gateway
 * @param {'PRO'|'PREMIUM'} params.packageName
 * @param {number} params.userId
 * @param {string} params.ipAddr
 */
async function createPackagePayment({ gateway, packageName, userId, ipAddr }) {
  const normalizedGateway = (gateway || '').toLowerCase();
  const normalizedPackage = (packageName || '').toUpperCase();

  if (!SUPPORTED_GATEWAYS.includes(normalizedGateway)) {
    throw new AppError('Cổng thanh toán không được hỗ trợ', 400);
  }

  if (!['PRO', 'PREMIUM'].includes(normalizedPackage)) {
    throw new AppError('Chỉ hỗ trợ thanh toán cho gói PRO hoặc PREMIUM', 400);
  }

  if (!userId) {
    throw new AppError('Thiếu thông tin người dùng', 400);
  }

  await ensurePaymentTransactionsTable();

  const selectedPackage = await packages.findOne({
    where: {
      name: normalizedPackage,
      is_active: true,
    },
  });

  if (!selectedPackage) {
    throw new AppError(`Gói ${normalizedPackage} không tồn tại hoặc đã bị vô hiệu hóa`, 404);
  }

  const amount = parseFloat(selectedPackage.price) || 0;
  const baseTransactionId = `${normalizedGateway.toUpperCase()}_${Date.now()}_${userId}`;

  console.log('💳 [PaymentGateway] Creating payment', {
    gateway: normalizedGateway,
    packageName: normalizedPackage,
    userId,
    amount,
  });

  const paymentRecord = await payment_transactions.create({
    user_id: userId,
    gateway: normalizedGateway,
    amount,
    package_name: normalizedPackage,
    transaction_id: baseTransactionId,
    status: 'pending',
    raw_response: null,
  });

  let gatewayResult;

  if (normalizedGateway === 'vnpay') {
    gatewayResult = createVnpayPaymentUrl({
      amount,
      orderInfo: `Thanh toán gói ${normalizedPackage} cho user ${userId}`,
      ipAddr,
      transactionId: baseTransactionId,
    });
  } else if (normalizedGateway === 'zalopay') {
    gatewayResult = createZalopayPaymentUrl({
      amount,
      orderInfo: `Thanh toán gói ${normalizedPackage} cho user ${userId}`,
      transactionId: baseTransactionId,
    });
  } else if (normalizedGateway === 'momo') {
    // Tạm thời trả về mock URL – vẫn ghi nhận payment_transactions
    const expireDateObj = new Date(Date.now() + 15 * 60 * 1000);
    gatewayResult = {
      paymentUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/package/payment/result?status=demo`,
      transactionId: baseTransactionId,
      expiredAt: expireDateObj.toISOString(),
      gateway: 'momo',
    };
  }

  // Cập nhật raw_response (để debug)
  await paymentRecord.update({
    raw_response: {
      gateway: gatewayResult.gateway,
      generatedAt: new Date().toISOString(),
    },
  });

  return gatewayResult;
}

module.exports = {
  createPackagePayment,
};


