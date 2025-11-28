import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowRight, Star } from 'lucide-react';

const UpgradeButton = ({ 
  variant = 'primary', 
  size = 'medium',
  showIcon = true,
  className = '',
  children 
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/packages');
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl';
      case 'secondary':
        return 'bg-white border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50';
      case 'outline':
        return 'border border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-white';
      case 'ghost':
        return 'text-yellow-600 hover:bg-yellow-100';
      default:
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm';
      case 'medium':
        return 'px-4 py-2 text-base';
      case 'large':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-lg
        transition-all duration-200
        transform hover:scale-105
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      {showIcon && (
        <Crown className="w-4 h-4 mr-2" />
      )}
      
      {children || (
        <>
          <span>Nâng cấp Premium</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      )}
    </button>
  );
};

// Preset variants for common use cases
export const UpgradeBanner = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Nâng cấp lên Premium để mở khóa tất cả tính năng
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              AI tối ưu tin đăng, boost lượt xem, và nhiều tính năng khác
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <UpgradeButton variant="primary" size="small">
            Nâng cấp ngay
          </UpgradeButton>
          {onClose && (
            <button
              onClick={onClose}
              className="text-yellow-500 hover:text-yellow-700"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const UpgradeCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nâng cấp lên Premium
        </h3>
        <p className="text-gray-600 mb-4">
          Mở khóa tất cả tính năng cao cấp và tăng hiệu quả bán hàng
        </p>
        <UpgradeButton variant="primary" size="large" className="w-full">
          Xem các gói Premium
        </UpgradeButton>
      </div>
    </div>
  );
};

export default UpgradeButton;
