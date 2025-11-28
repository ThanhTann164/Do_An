const crypto = require('crypto');
const querystring = require('querystring');
const { VNPAY_CONFIG } = require('../config');

/**
 * Tạo URL thanh toán VNPay.
 * Hàm này chỉ lo phần build URL + ký, không truy cập database.
 *
 * @param {Object} payload
 * @param {number} payload.amount - số tiền VNĐ
 * @param {string} payload.orderInfo - mô tả đơn hàng
 * @param {string} payload.ipAddr - IP client
 * @param {string} payload.transactionId - mã giao dịch nội bộ (vnp_TxnRef)
 * @returns {{ paymentUrl: string, transactionId: string, expiredAt: string, gateway: string }}
 */
function createVnpayPaymentUrl({ amount, orderInfo, ipAddr, transactionId }) {
  const date = new Date();
  const createDate = formatDateVNPay(date);

  const expireDateObj = new Date(date.getTime() + 15 * 60 * 1000); // +15 phút
  const expireDate = formatDateVNPay(expireDateObj);

  const vnpParams = {
    vnp_Version: VNPAY_CONFIG.version,
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_CONFIG.tmnCode,
    vnp_Locale: VNPAY_CONFIG.locale,
    vnp_CurrCode: VNPAY_CONFIG.currCode,
    vnp_TxnRef: transactionId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'billpayment',
    vnp_Amount: Math.round(amount) * 100, // VNPay dùng đơn vị nhỏ nhất
    vnp_ReturnUrl: VNPAY_CONFIG.returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const signedUrl = signVnpayUrl(vnpParams);

  return {
    paymentUrl: signedUrl,
    transactionId,
    expiredAt: expireDateObj.toISOString(),
    gateway: 'vnpay',
  };
}

function formatDateVNPay(date) {
  const YYYY = date.getFullYear().toString();
  const MM = (date.getMonth() + 1).toString().padStart(2, '0');
  const DD = date.getDate().toString().padStart(2, '0');
  const HH = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${YYYY}${MM}${DD}${HH}${mm}${ss}`;
}

function signVnpayUrl(params) {
  const sortedKeys = Object.keys(params).sort();
  const sortedParams = {};
  sortedKeys.forEach((key) => {
    sortedParams[key] = params[key];
  });

  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  sortedParams['vnp_SecureHash'] = signed;
  const query = querystring.stringify(sortedParams, { encode: false });
  return `${VNPAY_CONFIG.paymentUrl}?${query}`;
}

module.exports = {
  createVnpayPaymentUrl,
};


