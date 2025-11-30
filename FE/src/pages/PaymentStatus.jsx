import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertTriangle, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePackage } from '../hooks/usePackage';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMyPackage } = useAuth();
  const { refreshPackageData } = usePackage();

  const status = (searchParams.get('status') || '').toLowerCase();
  const gateway = (searchParams.get('gateway') || '').toLowerCase();

  useEffect(() => {
    // Sau khi quay lại từ cổng thanh toán, luôn refresh gói của user
    (async () => {
      try {
        await fetchMyPackage({ silentOnMissingToken: true });
        await refreshPackageData();
      } catch (err) {
        console.error('Error refreshing package after payment:', err);
      }
    })();
  }, [fetchMyPackage, refreshPackageData]);

  const getContent = () => {
    if (status === 'success') {
      return {
        icon: <CheckCircle className="w-16 h-16 text-green-500 mb-4" />,
        title: 'Thanh toán thành công',
        message: 'Gói dịch vụ của bạn đã được kích hoạt. Bạn có thể sử dụng ngay các tính năng mới.',
        colorClass: 'text-green-600',
      };
    }

    if (status === 'cancel') {
      return {
        icon: <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />,
        title: 'Bạn đã hủy giao dịch',
        message: 'Giao dịch thanh toán đã bị hủy. Nếu đây là nhầm lẫn, bạn có thể thử thanh toán lại.',
        colorClass: 'text-yellow-600',
      };
    }

    return {
      icon: <XCircle className="w-16 h-16 text-red-500 mb-4" />,
      title: 'Thanh toán thất bại',
      message: 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức khác.',
      colorClass: 'text-red-600',
    };
  };

  const content = getContent();

  const formatGateway = () => {
    switch (gateway) {
      case 'momo':
        return 'MoMo';
      case 'vnpay':
        return 'VNPay';
      case 'zalopay':
        return 'ZaloPay';
      default:
        return 'cổng thanh toán';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          {content.icon}
          <h1 className={`text-2xl font-bold mb-2 ${content.colorClass}`}>{content.title}</h1>
          <p className="text-gray-600 text-sm">{content.message}</p>
          {gateway && (
            <p className="text-gray-500 text-xs mt-1">
              Cổng thanh toán: <span className="font-semibold">{formatGateway()}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Về Dashboard
          </button>
          <button
            onClick={() => navigate('/packages')}
            className="w-full py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Xem lại gói dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;




