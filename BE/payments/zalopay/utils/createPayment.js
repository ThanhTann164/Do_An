/**
 * Stub tạo URL thanh toán ZaloPay.
 * Ở môi trường thật cần gọi API ZaloPay, ở đây chỉ giả lập URL.
 *
 * @param {Object} payload
 * @param {number} payload.amount
 * @param {string} payload.orderInfo
 * @param {string} payload.transactionId
 * @returns {{ paymentUrl: string, transactionId: string, expiredAt: string, gateway: string }}
 */
function createZalopayPaymentUrl({ amount, orderInfo, transactionId }) {
  const expireDateObj = new Date(Date.now() + 15 * 60 * 1000);

  const paymentUrl = `https://sandbox.zalopay.vn/mockpay?txnRef=${encodeURIComponent(
    transactionId,
  )}&amount=${encodeURIComponent(amount)}&info=${encodeURIComponent(orderInfo)}`;

  return {
    paymentUrl,
    transactionId,
    expiredAt: expireDateObj.toISOString(),
    gateway: 'zalopay',
  };
}

module.exports = {
  createZalopayPaymentUrl,
};


