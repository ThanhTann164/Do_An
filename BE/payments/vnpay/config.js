const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../config.env') });

const VNPAY_CONFIG = {
  tmnCode: process.env.VNPAY_TMN_CODE || 'DEMO',
  hashSecret: process.env.VNPAY_HASH_SECRET || 'VNPAY_DEMO_SECRET',
  paymentUrl:
    process.env.VNPAY_PAYMENT_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl:
    process.env.VNPAY_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-status`,
  locale: process.env.VNPAY_LOCALE || 'vn',
  version: process.env.VNPAY_VERSION || '2.1.0',
  currCode: process.env.VNPAY_CURR_CODE || 'VND',
};

module.exports = {
  VNPAY_CONFIG,
};


