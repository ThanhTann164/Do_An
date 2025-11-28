import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, Home, RefreshCw, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Lấy thông tin từ location state
    const stateData = location.state;
    
    if (stateData) {
      setPaymentInfo({
        packageName: stateData.packageData?.displayName || 'Gói dịch vụ',
        packageType: stateData.packageData?.type || 'PRO',
        error: stateData.error || 'Giao dịch không thành công',
        errorCode: stateData.errorCode || 'PAYMENT_FAILED'
      });
    } else {
      // Fallback
      setPaymentInfo({
        packageName: 'Gói dịch vụ',
        packageType: 'PRO',
        error: 'Giao dịch không thành công',
        errorCode: 'PAYMENT_FAILED'
      });
    }

    setTimeout(() => setShowAnimation(true), 100);
  }, []);

  const getErrorMessage = (errorCode, error) => {
    if (error && error !== 'Giao dịch không thành công') {
      return error;
    }

    const errorMessages = {
      'PAYMENT_CANCELLED': 'Giao dịch bị hủy bởi người dùng',
      'INSUFFICIENT_FUNDS': 'Tài khoản không đủ số dư',
      'CARD_DECLINED': 'Thẻ bị từ chối',
      'NETWORK_ERROR': 'Lỗi kết nối mạng',
      'TIMEOUT': 'Giao dịch hết thời gian chờ',
      'INVALID_CARD': 'Thông tin thẻ không hợp lệ',
      'BANK_ERROR': 'Lỗi từ phía ngân hàng',
      'SYSTEM_ERROR': 'Lỗi hệ thống',
      'PAYMENT_FAILED': 'Giao dịch không thành công'
    };
    return errorMessages[errorCode] || 'Giao dịch không thành công';
  };

  const getSolution = (errorCode) => {
    const solutions = {
      'PAYMENT_CANCELLED': 'Vui lòng thử lại và hoàn tất giao dịch',
      'INSUFFICIENT_FUNDS': 'Vui lòng nạp thêm tiền vào tài khoản và thử lại',
      'CARD_DECLINED': 'Vui lòng kiểm tra thông tin thẻ hoặc liên hệ ngân hàng',
      'NETWORK_ERROR': 'Vui lòng kiểm tra kết nối mạng và thử lại',
      'TIMEOUT': 'Vui lòng thử lại giao dịch',
      'INVALID_CARD': 'Vui lòng kiểm tra lại thông tin thẻ',
      'BANK_ERROR': 'Vui lòng liên hệ ngân hàng hoặc thử lại sau',
      'SYSTEM_ERROR': 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ',
      'PAYMENT_FAILED': 'Vui lòng thử lại hoặc chọn phương thức thanh toán khác'
    };
    return solutions[errorCode] || 'Vui lòng thử lại hoặc liên hệ hỗ trợ';
  };

  const handleRetryPayment = () => {
    navigate('/packages');
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Animation */}
          <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 px-6 py-12 text-center relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 -translate-y-1/2 animate-ping"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-1/2 translate-y-1/2 animate-pulse"></div>
            </div>

            {/* Error Icon with Animation */}
            <div className={`relative z-10 transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-red-100 text-lg">
                Giao dịch của bạn không thể hoàn tất
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-8">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Gói dịch vụ:</span>
                <span className="font-semibold text-gray-900">{paymentInfo.packageName}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-medium text-red-600">Thất bại</span>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Lý do thất bại:
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    {getErrorMessage(paymentInfo.errorCode, paymentInfo.error)}
                  </p>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">
                      <strong>Giải pháp:</strong> {getSolution(paymentInfo.errorCode)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleRetryPayment}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Thử lại thanh toán
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                Về trang chủ
              </button>
            </div>

            {/* Help Section */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Cần hỗ trợ?
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với chúng tôi:
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>Hotline: 1900-xxxx</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>Email: support@realestate.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <span>Chat: Góc phải màn hình</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Mã lỗi: <span className="font-mono">{paymentInfo.errorCode}</span> |{' '}
            <button 
              onClick={() => navigate('/contact')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Báo cáo vấn đề
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
