const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../config.env') });

// Cấu hình đơn giản cho ZaloPay (stub) – có thể mở rộng sau này
const ZALOPAY_CONFIG = {
  appId: process.env.ZALOPAY_APP_ID || 'ZALO_DEMO_APP',
  key1: process.env.ZALOPAY_KEY1 || 'ZALO_DEMO_KEY1',
  key2: process.env.ZALOPAY_KEY2 || 'ZALO_DEMO_KEY2',
  endpoint:
    process.env.ZALOPAY_ENDPOINT || 'https://sandbox.zalopay.vn/v001/tpe/createorder',
  returnUrl:
    process.env.ZALOPAY_RETURN_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-status`,
};

module.exports = {
  ZALOPAY_CONFIG,
};




