import React, { useContext } from 'react';
import { Crown, Star, Zap, ArrowRight, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PackageContext } from '../../context/PackageContext';
import { Link } from 'react-router-dom';

const PackageCard = ({ loading: propLoading = false }) => {
  const { 
    userPackage: packageState, 
    loading: authLoading,
    user
  } = useAuth();
  const { packageInfo, detail } = useContext(PackageContext);
  const isSeller = (user?.role || '').toLowerCase() === 'seller';
  
  if (!isSeller) {
    return null;
  }
  
  const detailSource = packageState || detail || null;
  const currentPackage = detailSource?.userPackage || { name: 'FREE', display_name: 'Gói Miễn Phí' };
  const limits = detailSource?.limits || {};
  const postsLimits = limits.posts || { 
    daily: 1, 
    monthly: 3, 
    daily_used: 0, 
    monthly_used: 0, 
    daily_remaining: 1, 
    monthly_remaining: 3, 
    maxPosts: 3, 
    maxImages: 3,
    unlimited: false
  };
  const boostLimits = limits.boost || { 
    per_day: 0, 
    used_today: 0, 
    remaining_today: 0, 
    boostPerDay: 0, 
    boostUsedToday: 0, 
    remainingBoosts: 0,
    unlimited: false
  };
  const isFreePlan = (packageInfo?.packageName || currentPackage.name || '').toUpperCase() === 'FREE';
  const loading = propLoading || authLoading;

  const packageDisplay = {
    name: currentPackage.name?.toUpperCase() || 'FREE',
    displayName: currentPackage.display_name || 'Gói Miễn Phí',
    isExpired: currentPackage.expires_at ? new Date(currentPackage.expires_at) < new Date() : false,
    daysLeft: currentPackage.expires_at ? Math.max(0, Math.ceil((new Date(currentPackage.expires_at) - new Date()) / (1000 * 60 * 60 * 24))) : null,
    start_at: currentPackage.start_at,
    end_at: currentPackage.expires_at
  };
  const getPackageIcon = (packageName) => {
    switch (packageName?.toUpperCase()) {
      case 'PREMIUM': return Crown;
      case 'PRO': return Zap;
      case 'FREE': return Home;
      default: return Star;
    }
  };

  const getPackageColor = (packageName) => {
    switch (packageName?.toUpperCase()) {
      case 'PREMIUM': return 'yellow';
      case 'PRO': return 'purple';
      case 'FREE': return 'gray';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
          <div className="w-24 h-4 bg-gray-200 rounded mb-4"></div>
          <div className="w-full h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isFreePlan) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gói Miễn Phí
          </h3>
          <p className="text-gray-600 mb-4">
            Nâng cấp gói để có thêm nhiều tính năng hấp dẫn
          </p>
          <div className="text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Bài đăng tối đa:</span>
              <span>{postsLimits.maxPosts || postsLimits.monthly || 3}/tháng</span>
            </div>
            <div className="flex justify-between">
              <span>Hình ảnh tối đa:</span>
              <span>{postsLimits.maxImages || 3}/bài</span>
            </div>
          </div>
          <Link 
            to="/packages" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span>Xem gói dịch vụ</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getPackageIcon(packageDisplay.name);
  const color = getPackageColor(packageDisplay.name);
  const isExpired = packageDisplay.isExpired;
  const daysLeft = packageDisplay.daysLeft || 0;

  const colorClasses = {
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700'
    },
    yellow: {
      bg: 'bg-yellow-100',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    gray: {
      bg: 'bg-gray-100',
      icon: 'text-gray-600',
      button: 'bg-gray-600 hover:bg-gray-700'
    }
  };

  const currentColorClasses = colorClasses[color];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${currentColorClasses.bg}`}>
          <Icon className={`w-6 h-6 ${currentColorClasses.icon}`} />
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isExpired ? 'bg-red-100 text-red-800' : 
          daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-green-100 text-green-800'
        }`}>
          {isExpired ? 'Hết hạn' : daysLeft <= 7 ? `${daysLeft} ngày` : 'Hoạt động'}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {packageDisplay.displayName}
        </h3>
        <p className="text-sm text-gray-600">
          {currentPackage?.purchase_price ? formatPrice(currentPackage.purchase_price) : 'Miễn phí'} / tháng
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {packageDisplay.start_at && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ngày kích hoạt:</span>
            <span className="text-gray-900">{formatDate(packageDisplay.start_at)}</span>
          </div>
        )}
        {packageDisplay.end_at && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ngày hết hạn:</span>
            <span className="text-gray-900">{formatDate(packageDisplay.end_at)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Bài đăng tối đa:</span>
          <span className="text-gray-900">
            {postsLimits.unlimited || postsLimits.daily === -1 || postsLimits.monthly === -1 ? 'Không giới hạn' : `${postsLimits.maxPosts || postsLimits.monthly || postsLimits.daily}/tháng`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Boost mỗi ngày:</span>
          <span className="text-gray-900">
            {boostLimits.unlimited || boostLimits.per_day === -1 ? 'Không giới hạn' : 
             boostLimits.per_day === 0 ? 'Không có' : 
             `${boostLimits.remaining_today ?? boostLimits.remainingBoosts ?? 0}/${boostLimits.per_day}`}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {isExpired ? (
          <Link 
            to="/packages" 
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-center block"
          >
            Gia hạn gói
          </Link>
        ) : (
          <Link 
            to="/packages" 
            className={`w-full text-white py-2 px-4 rounded-lg transition-colors text-center block ${currentColorClasses.button}`}
          >
            Nâng cấp gói
          </Link>
        )}
        <Link 
          to="/packages/history" 
          className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center block"
        >
          Xem lịch sử
        </Link>
      </div>
    </div>
  );
};

export default PackageCard;
