import React from 'react';
import { Home, Eye, ArrowRight, Clock, CheckCircle, XCircle, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PackageFeatureGuard from '../PackageFeatureGuard';

const PropertyListCard = ({ properties = [], loading = false }) => {
  const { isFreePlan, isProPlan, isPremiumPlan, hasFeature } = useAuth();

  const handleBoost = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/houses/${propertyId}/boost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration_hours: 6 })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Boost thành công! Bài viết sẽ được ưu tiên hiển thị trong 6 giờ.`);
      } else {
        alert(`❌ ${data.message || 'Không thể boost bài viết'}`);
      }
    } catch (error) {
      console.error('Error boosting property:', error);
      alert('❌ Có lỗi xảy ra khi boost bài viết');
    }
  };
  const formatPrice = (price) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`;
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} triệu`;
    }
    return price.toLocaleString();
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bài đăng gần đây</h3>
          <p className="text-sm text-gray-500">Quản lý bài đăng của bạn</p>
        </div>
        <Link 
          to="/posts" 
          className="flex items-center text-[#00A884] hover:text-[#007a65] text-sm font-medium transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {properties.length > 0 ? (
          properties.map((property, index) => (
            <div 
              key={property.id || property.HouseID || index} 
              className={`flex items-center space-x-4 p-4 rounded-xl hover:shadow-sm transition-all duration-300 ${
                isPremiumPlan() 
                  ? 'border-2 border-gradient-to-r from-yellow-300 to-orange-300 bg-gradient-to-r from-yellow-50 to-orange-50' 
                  : isProPlan() 
                    ? 'border-2 border-blue-300 bg-blue-50' 
                    : 'border border-gray-100 hover:border-[#00A884]'
              }`}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {property.image ? (
                  <img 
                    src={property.image} 
                    alt={property.title || property.Title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Home className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {property.title || property.Title}
                  </h4>
                  {/* Package Priority Badges */}
                  {isPremiumPlan() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      <Crown className="w-3 h-3" />
                      PREMIUM
                    </span>
                  )}
                  {isProPlan() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      <Zap className="w-3 h-3" />
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-[#00A884] mt-1">
                  {formatPrice(property.price || property.Price)} VNĐ
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="w-3 h-3 mr-1" />
                    {property.views || property.Views || 0} lượt xem
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(property.status || property.Status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(property.status || property.Status)}`}>
                      {getStatusText(property.status || property.Status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Boost Button */}
                <PackageFeatureGuard feature="highlight" requiredPackages={['PRO', 'PREMIUM']}>
                  <button
                    onClick={() => handleBoost(property.id || property.HouseID)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                      isPremiumPlan()
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    🚀 Boost
                  </button>
                </PackageFeatureGuard>

                <Link 
                  to={`/property/${property.id || property.HouseID}`}
                  className="text-[#00A884] hover:text-[#007a65] p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài đăng</h4>
            <p className="text-gray-500 mb-4">Tạo bài đăng đầu tiên để bắt đầu bán nhà</p>
            <Link 
              to="/post/create"
              className="inline-flex items-center px-4 py-2 bg-[#00A884] text-white rounded-lg hover:bg-[#007a65] transition-colors"
            >
              Tạo bài đăng
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListCard;
