import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Receipt, ArrowRight, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePackage } from '../../hooks/usePackage';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { refreshProfile } = useAuth(); // Sử dụng refreshProfile từ AuthContext
  const { refreshPackageData } = usePackage();
  
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Lấy thông tin từ URL params hoặc location state
    const transactionId = searchParams.get('transaction_id');
    const stateData = location.state;
    
    if (stateData) {
      setPaymentInfo({
        transactionId: stateData.transaction?.transaction_id || transactionId || 'TXN' + Date.now(),
        amount: stateData.packageData?.price || 0,
        packageName: stateData.packageData?.displayName || 'Gói dịch vụ',
        packageType: stateData.packageData?.type || 'PRO',
        paymentMethod: stateData.transaction?.payment_method || 'manual',
        paymentTime: stateData.transaction?.purchased_at || new Date().toISOString(),
        expiresAt: stateData.transaction?.expires_at
      });
    } else {
      // Fallback nếu không có state
      setPaymentInfo({
        transactionId: transactionId || 'TXN' + Date.now(),
        amount: 0,
        packageName: 'Gói dịch vụ',
        packageType: 'PRO',
        paymentMethod: 'manual',
        paymentTime: new Date().toISOString()
      });
    }

    // Show animation
    setTimeout(() => setShowAnimation(true), 100);

    // Refresh user profile và package data sau khi thanh toán thành công
    const refreshData = async () => {
      try {
        console.log('🔄 [PaymentSuccess] Refreshing user profile and package data...');
        // Refresh user profile từ API (bao gồm currentPackage)
        await refreshProfile();
        // Cũng refresh package data từ hook
        await refreshPackageData();
        console.log('✅ [PaymentSuccess] Data refreshed successfully');
      } catch (error) {
        console.error('❌ [PaymentSuccess] Error refreshing data:', error);
      }
    };
    
    refreshData();

    // Auto redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/seller/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'momo': 'Ví MoMo',
      'vnpay': 'VNPay',
      'banking': 'Internet Banking',
      'manual': 'Thanh toán thủ công'
    };
    return methods[method] || method;
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Animation */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-12 text-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse"></div>
            </div>

            {/* Success Icon with Animation */}
            <div className={`relative z-10 transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Thanh toán thành công!
              </h1>
              <p className="text-green-100 text-lg">
                Gói dịch vụ đã được kích hoạt
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-8">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-medium text-gray-900 font-mono text-sm">{paymentInfo.transactionId}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Gói dịch vụ:</span>
                <div className="flex items-center gap-2">
                  {paymentInfo.packageType === 'PREMIUM' && <Crown className="w-4 h-4 text-yellow-500" />}
                  <span className="font-semibold text-gray-900">{paymentInfo.packageName}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-bold text-2xl text-green-600">
                  {formatPrice(paymentInfo.amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium text-gray-900">{formatPaymentMethod(paymentInfo.paymentMethod)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium text-gray-900 text-sm">
                  {formatDateTime(paymentInfo.paymentTime)}
                </span>
              </div>

              {paymentInfo.expiresAt && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Hết hạn:</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {formatDateTime(paymentInfo.expiresAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Success Message */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start">
                <Sparkles className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-green-800 mb-1">
                    Gói dịch vụ đã được kích hoạt thành công!
                  </h3>
                  <p className="text-sm text-green-700">
                    Bạn có thể bắt đầu sử dụng các tính năng premium ngay bây giờ.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Home className="w-5 h-5 mr-2" />
                Về Dashboard
              </button>
              
              <button
                onClick={() => navigate('/packages')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
              >
                <Receipt className="w-5 h-5 mr-2" />
                Xem lịch sử giao dịch
              </button>
            </div>

            {/* Auto Redirect Countdown */}
            <div className="text-center text-sm text-gray-500 mb-4">
              Tự động chuyển hướng về Dashboard sau <span className="font-bold text-blue-600">{countdown}</span> giây...
            </div>

            {/* Additional Info */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Bước tiếp theo:
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-center">
                  <ArrowRight className="w-3 h-3 mr-2 flex-shrink-0" />
                  Khám phá các tính năng AI mới
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-3 h-3 mr-2 flex-shrink-0" />
                  Đăng tin bất động sản premium
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-3 h-3 mr-2 flex-shrink-0" />
                  Sử dụng boost để tăng lượt xem
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Có thắc mắc?{' '}
            <button 
              onClick={() => navigate('/contact')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Liên hệ hỗ trợ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
