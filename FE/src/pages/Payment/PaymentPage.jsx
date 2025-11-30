import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Shield,
  CheckCircle,
  ArrowLeft,
  Crown,
  Zap,
  Clock,
  AlertCircle,
  Loader2,
  Home
} from 'lucide-react';
import { packageService } from '../../services/packageService';
import { paymentService } from '../../services/paymentService';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Load package info ---
  useEffect(() => {
    loadPackageData();
  }, []);

  const loadPackageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const packageId = searchParams.get('package_id');
      if (!packageId) {
        setError('Không tìm thấy thông tin gói dịch vụ');
        setLoading(false);
        return;
      }

      const response = await packageService.getAllPackages();
      if (response?.success && response.data?.packages) {
        const pkg = response.data.packages.find((p) => p.id === parseInt(packageId, 10));
        if (!pkg) {
          setError('Gói dịch vụ không tồn tại');
          setLoading(false);
          return;
        }

        const mappedData = {
          id: pkg.id,
          name: pkg.name || 'UNKNOWN',
          displayName: pkg.display_name || pkg.displayName || 'Gói dịch vụ',
          type: (pkg.name || 'FREE').toUpperCase(),
          price: parseFloat(pkg.price) || 0,
          duration: `${pkg.duration_days || 30} ngày`,
          features: getPackageFeatures((pkg.name || 'FREE').toUpperCase())
        };

        setPackageData(mappedData);
      } else {
        throw new Error('Dữ liệu gói không hợp lệ');
      }
    } catch (err) {
      console.error('Error loading package:', err);
      setError(err.message || 'Không thể tải thông tin gói dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getPackageFeatures = (type) => {
    switch (type) {
      case 'PRO':
        return [
          'Tin nổi bật (Highlight)',
          'Boost 1 lần/ngày',
          'AI tối ưu (title + mô tả)',
          'Video panorama',
          'Badge "Verified Seller"',
          'Auto-refresh 24h',
          'Ưu tiên hiển thị Level 2'
        ];
      case 'PREMIUM':
        return [
          'Tất cả tính năng PRO',
          'Tin nổi bật (Gold Highlight)',
          'Boost 3 lần/ngày',
          'AI đầy đủ (5 công cụ)',
          'Video 360° panorama',
          'Banner quảng cáo',
          'Badge "Verified Seller"',
          'Auto-refresh 24h',
          'Ưu tiên SEO tối đa',
          'Priority Chat',
          'Analytics nâng cao'
        ];
      default:
        return [];
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);

  // --- Handle payment ---
  const handlePayment = async () => {
    console.log('[DEBUG] Button clickable:', { isProcessing, paymentMethod });
    console.log('[DEBUG] handlePayment fired', {
      hasPackageData: !!packageData,
      paymentMethod,
      isProcessing
    });

    if (!packageData) {
      setError('Không tìm thấy thông tin gói dịch vụ để thanh toán.');
      return;
    }

    if (!paymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán.');
      return;
    }

    const gateway = paymentMethod.toLowerCase();
    const supportedGateways = ['momo', 'vnpay', 'zalopay'];
    if (!supportedGateways.includes(gateway)) {
      setError('Phương thức thanh toán chưa được hỗ trợ.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('[PaymentPage] Creating payment...', {
        gateway,
        packageType: packageData.type,
        packageId: packageData.id
      });

      const res = await paymentService.createPayment(gateway, packageData.type);
      const data = res?.data || res;
      const paymentUrl = data?.paymentUrl;

      if (!paymentUrl) {
        console.error('[PaymentPage] Missing paymentUrl in response', data);
        throw new Error('Không nhận được đường dẫn thanh toán.');
      }

      console.log('[PaymentPage] Gateway URL', paymentUrl);
      window.location.href = paymentUrl;
    } catch (err) {
      console.error('[PaymentPage] Payment error:', err);
      setError(err.message || 'Lỗi thanh toán, vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => navigate('/packages');

  // --- Render states ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin gói...</p>
        </div>
      </div>
    );
  }

  if (error && !packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông tin gói</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại chọn gói
          </button>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại chọn gói
          </button>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
            Thanh Toán Gói Dịch Vụ
          </h1>
          <p className="text-gray-600 mt-2">Hoàn tất thanh toán để kích hoạt gói dịch vụ của bạn</p>
        </div>

        {/* Error in-page */}
        {error && packageData && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Lỗi thanh toán</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Package summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              {packageData.type === 'PREMIUM' ? (
                <Crown className="w-8 h-8 text-yellow-600" />
              ) : packageData.type === 'PRO' ? (
                <Zap className="w-8 h-8 text-blue-600" />
              ) : (
                <Home className="w-8 h-8 text-gray-600" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">{packageData.displayName}</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Loại gói:</span>
                <span className="font-semibold text-gray-900">{packageData.type}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Thời hạn:</span>
                <span className="font-semibold text-gray-900">{packageData.duration}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Giá gói:</span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatPrice(packageData.price)}đ
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Tính năng bao gồm:</h3>
              <div className="space-y-2">
                {packageData.features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {packageData.features.length > 5 && (
                  <div className="text-sm text-gray-500 italic">
                    +{packageData.features.length - 5} tính năng khác...
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Thanh toán được bảo mật bởi SSL 256-bit</span>
            </div>
          </div>

          {/* Payment form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>

            {/* Radio buttons */}
            <div className="space-y-4 mb-8">
              {/* MoMo */}
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                  paymentMethod === 'momo'
                    ? 'border-pink-500 bg-pink-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="gateway"
                  className="hidden"
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={() => {
                    console.log('Selected gateway:', 'momo');
                    setPaymentMethod('momo');
                  }}
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'momo' ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'momo' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ví MoMo</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua ví MoMo, QR Code, ATM</p>
                  </div>
                </div>
              </label>

              {/* VNPay */}
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                  paymentMethod === 'vnpay'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="gateway"
                  className="hidden"
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => {
                    console.log('Selected gateway:', 'vnpay');
                    setPaymentMethod('vnpay');
                  }}
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'vnpay' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">VN</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">VNPay</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua ví điện tử, thẻ ATM</p>
                  </div>
                </div>
              </label>

              {/* ZaloPay */}
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                  paymentMethod === 'zalopay'
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="gateway"
                  className="hidden"
                  value="zalopay"
                  checked={paymentMethod === 'zalopay'}
                  onChange={() => {
                    console.log('Selected gateway:', 'zalopay');
                    setPaymentMethod('zalopay');
                  }}
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'zalopay' ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMethod === 'zalopay' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">ZP</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ZaloPay</h3>
                    <p className="text-sm text-gray-600">Thanh toán qua ví ZaloPay</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Tổng thanh toán */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
                <span className="text-3xl font-bold text-purple-600">
                  {formatPrice(packageData.price)}đ
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Có hiệu lực trong {packageData.duration}</span>
              </div>
            </div>

            {/* Nút thanh toán */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || !paymentMethod}
              className={
                'w-full py-4 rounded-2xl text-white font-semibold shadow-md transition-all ' +
                (isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700')
              }
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                </div>
              ) : (
                'Thanh toán ngay'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Bằng cách thanh toán, bạn đồng ý với{' '}
              <a href="#" className="text-purple-600 hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="text-purple-600 hover:underline">
                Chính sách bảo mật
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;




