const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/authMiddleware');
const { createPackagePayment } = require('../Services/paymentGateway.service');
const { activateUserPackage } = require('../Services/paymentPackage.service');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { payment_transactions } = require('../models/init-models')(sequelize);
const { verifyVnpaySignature } = require('../payments/vnpay/utils/verifySignature');
const { verifyZalopaySignature } = require('../payments/zalopay/utils/verifySignature');

// POST /payments/create
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { gateway, package: packageName } = req.body;
    const userId = req.user.userId;

    console.log('💳 [/payments/create] Incoming request', {
      gateway,
      packageName,
      userId,
    });

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1');

    const result = await createPackagePayment({
      gateway,
      packageName,
      userId,
      ipAddr,
    });

    return res.status(201).json({
      success: true,
      data: {
        paymentUrl: result.paymentUrl,
        transactionId: result.transactionId,
        expiredAt: result.expiredAt,
        gateway: result.gateway,
      },
    });
  } catch (error) {
    console.error('❌ [/payments/create] Error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Lỗi khi tạo thanh toán',
    });
  }
});

// GET /payments/callback/vnpay
router.get('/callback/vnpay', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    console.log('📞 [/payments/callback/vnpay] Query:', req.query);

    const verify = verifyVnpaySignature(req.query);
    if (!verify.isValid) {
      console.error('❌ [VNPay] Invalid signature:', verify.reason);
      return res.redirect(`${frontendUrl}/payment-status?status=fail&gateway=vnpay`);
    }

    const txnRef = req.query.vnp_TxnRef;
    const responseCode = req.query.vnp_ResponseCode;

    const payment = await payment_transactions.findOne({
      where: { transaction_id: txnRef, gateway: 'vnpay' },
    });

    if (!payment) {
      console.error('❌ [VNPay] Payment transaction not found for', txnRef);
      return res.redirect(`${frontendUrl}/payment-status?status=fail&gateway=vnpay`);
    }

    const raw = { ...payment.raw_response, callback: req.query };

    if (responseCode === '00') {
      await payment.update({
        status: 'success',
        raw_response: raw,
      });

      try {
        await activateUserPackage({
          userId: payment.user_id,
          packageName: payment.package_name,
          transactionId: payment.transaction_id,
          gateway: 'vnpay',
        });
      } catch (e) {
        console.error('❌ [VNPay] Failed to activate package after success:', e);
      }

      return res.redirect(
        `${frontendUrl}/payment-status?status=success&gateway=vnpay&transactionId=${encodeURIComponent(
          payment.transaction_id,
        )}`,
      );
    }

    const isCancel = responseCode === '24';

    await payment.update({
      status: 'fail',
      raw_response: raw,
    });

    return res.redirect(
      `${frontendUrl}/payment-status?status=${isCancel ? 'cancel' : 'fail'}&gateway=vnpay&transactionId=${encodeURIComponent(
        payment.transaction_id,
      )}`,
    );
  } catch (error) {
    console.error('❌ [/payments/callback/vnpay] Error:', error);
    return res.redirect(`${frontendUrl}/payment-status?status=fail&gateway=vnpay`);
  }
});

// GET /payments/callback/zalopay
router.get('/callback/zalopay', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    console.log('📞 [/payments/callback/zalopay] Query:', req.query);

    const verify = verifyZalopaySignature(req.query);
    if (!verify.isValid) {
      console.error('❌ [ZaloPay] Invalid signature:', verify.reason);
      return res.redirect(`${frontendUrl}/payment-status?status=fail&gateway=zalopay`);
    }

    const txnRef = req.query.app_trans_id || req.query.transactionId;
    const statusParam = (req.query.status || '').toLowerCase();

    const payment = await payment_transactions.findOne({
      where: { transaction_id: txnRef, gateway: 'zalopay' },
    });

    if (!payment) {
      console.error('❌ [ZaloPay] Payment transaction not found for', txnRef);
      return res.redirect(`${frontendUrl}/payment-status?status=fail&gateway=zalopay`);
    }

    const raw = { ...payment.raw_response, callback: req.query };

    const isSuccess = statusParam === 'success' || statusParam === '1';
    const isCancel = statusParam === 'cancel';

    if (isSuccess) {
      await payment.update({
        status: 'success',
        raw_response: raw,
      });

      try {
        await activateUserPackage({
          userId: payment.user_id,
          packageName: payment.package_name,
          transactionId: payment.transaction_id,
          gateway: 'zalopay',
        });
      } catch (e) {
        console.error('❌ [ZaloPay] Failed to activate package after success:', e);
      }

      return res.redirect(
        `${frontendUrl}/payment-status?status=success&gateway=zalopay&transactionId=${encodeURIComponent(
          payment.transaction_id,
        )}`,
      );
    }

    await payment.update({
      status: 'fail',
      raw_response: raw,
    });

    return res.redirect(
      `${frontendUrl}/payment-status?status=${isCancel ? 'cancel' : 'fail'}&gateway=zalopay&transactionId=${encodeURIComponent(
        payment.transaction_id,
      )}`,
    );
  } catch (error) {
    console.error('❌ [/payments/callback/zalopay] Error:', error);
    return res.redirect(`${frontendUrl}/payment-status?status=fail&gateway=zalopay`);
  }
});

// GET /payments/callback/momo
// Không sửa mô-đun MoMo cũ, chỉ thêm callback tổng hợp để thống nhất luồng redirect.
router.get('/callback/momo', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    console.log('📞 [/payments/callback/momo] Query:', req.query);

    const transactionId = req.query.orderId || req.query.requestId || req.query.transactionId;
    const resultCode = String(req.query.resultCode || '');

    let status = 'fail';
    if (resultCode === '0') {
      status = 'success';
    } else if (resultCode === '1006') {
      status = 'cancel';
    }

    // Với MoMo demo hiện tại chưa build đầy đủ, chỉ redirect FE theo status
    return res.redirect(
      `${frontendUrl}/payment-status?status=${status}&gateway=momo${
        transactionId ? `&transactionId=${encodeURIComponent(transactionId)}` : ''
      }`,
    );
  } catch (error) {
    console.error('❌ [/payments/callback/momo] Error:', error);
    return res.redirect(`${frontendUrl}/payment-status?status=fail&gateway=momo`);
  }
});

module.exports = router;
