const crypto = require('crypto');
const querystring = require('querystring');
const { VNPAY_CONFIG } = require('../config');

/**
 * Xác thực chữ ký VNPay từ query string.
 *
 * @param {Object} query
 * @returns {{ isValid: boolean, reason?: string }}
 */
function verifyVnpaySignature(query) {
  if (!query || !query.vnp_SecureHash) {
    return { isValid: false, reason: 'Missing vnp_SecureHash' };
  }

  const receivedHash = query.vnp_SecureHash;

  // Loại bỏ các field hash khỏi params
  const params = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedKeys = Object.keys(params).sort();
  const sortedParams = {};
  sortedKeys.forEach((key) => {
    sortedParams[key] = params[key];
  });

  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  if (signed === receivedHash) {
    return { isValid: true };
  }

  return { isValid: false, reason: 'Invalid signature' };
}

module.exports = {
  verifyVnpaySignature,
};


