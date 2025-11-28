import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Crown, Zap, AlertCircle } from 'lucide-react';

const PackageFeatureGuard = ({ 
  feature, 
  requiredPackages = [],
  children, 
  fallback = null,
  showUpgrade = true,
  className = ""
}) => {
  const { hasFeature, isFreePlan, isProPlan, isPremiumPlan, userPackage, loading, packageLoading, user } = useAuth();
  const isSeller = (user?.role || '').toLowerCase() === 'seller';

  if (!isSeller) {
    return <div className={className}>{children}</div>;
  }

  if (loading || packageLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-60 animate-pulse">
          {children}
        </div>
      </div>
    );
  }

  // Check if user has the required feature
  const hasAccess = (() => {
    // If no userPackage loaded yet, assume no access
    if (!userPackage || !userPackage.userPackage) {
      console.log('PackageFeatureGuard: No userPackage loaded');
      return false;
    }

    const currentPackage = userPackage.userPackage.name;
    console.log('PackageFeatureGuard: Current package:', currentPackage, 'Feature:', feature, 'Required:', requiredPackages);

    // If requiredPackages specified, check package name first
    if (requiredPackages.length > 0) {
      // Direct match
      if (requiredPackages.includes(currentPackage)) {
        console.log('PackageFeatureGuard: Package match!');
        return true;
      }
      
      // Check package hierarchy (PREMIUM > PRO > FREE)
      const packageHierarchy = { 'FREE': 0, 'PRO': 1, 'PREMIUM': 2 };
      const currentLevel = packageHierarchy[currentPackage] || 0;
      const requiredLevel = Math.min(...requiredPackages.map(p => packageHierarchy[p] || 0));
      
      if (currentLevel >= requiredLevel) {
        console.log('PackageFeatureGuard: Package level sufficient!', currentLevel, '>=', requiredLevel);
        return true;
      }
    }

    // Check feature access
    const featureAccess = hasFeature(feature);
    console.log('PackageFeatureGuard: Feature access:', featureAccess);
    return featureAccess;
  })();

  // If user has access, render children
  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // If no access and no upgrade UI wanted, render fallback
  if (!showUpgrade) {
    return fallback;
  }

  // Determine upgrade message
  const getUpgradeInfo = () => {
    if (isFreePlan()) {
      return {
        title: 'Tính năng Premium',
        message: 'Nâng cấp lên PRO hoặc PREMIUM để sử dụng tính năng này',
        packages: requiredPackages.length > 0 ? requiredPackages : ['PRO', 'PREMIUM']
      };
    } else if (isProPlan()) {
      return {
        title: 'Tính năng PREMIUM',
        message: 'Nâng cấp lên PREMIUM để sử dụng tính năng này',
        packages: ['PREMIUM']
      };
    } else {
      return {
        title: 'Tính năng Premium',
        message: 'Nâng cấp để sử dụng tính năng này',
        packages: requiredPackages.length > 0 ? requiredPackages : ['PRO', 'PREMIUM']
      };
    }
  };

  const upgradeInfo = getUpgradeInfo();

  return (
    <div className={`relative ${className}`}>
      {/* Disabled overlay */}
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        
        {/* Upgrade overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/90 to-purple-50/90 backdrop-blur-sm rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="flex justify-center mb-2">
              {upgradeInfo.packages.includes('PREMIUM') ? (
                <Crown className="w-8 h-8 text-yellow-600" />
              ) : (
                <Zap className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{upgradeInfo.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{upgradeInfo.message}</p>
            <button 
              onClick={() => window.location.href = '/packages'}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Nâng cấp ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component để hiển thị popup upgrade khi user không đủ quyền
 */
export const PackageUpgradeModal = ({ isOpen, onClose, feature, requiredPackages }) => {
  const { isFreePlan, isProPlan } = useAuth();

  if (!isOpen) return null;

  const getUpgradeInfo = () => {
    if (isFreePlan()) {
      return {
        title: 'Nâng cấp lên PRO/PREMIUM',
        message: 'Tính năng này chỉ dành cho gói PRO và PREMIUM',
        packages: requiredPackages || ['PRO', 'PREMIUM']
      };
    } else if (isProPlan()) {
      return {
        title: 'Nâng cấp lên PREMIUM',
        message: 'Tính năng này chỉ dành cho gói PREMIUM',
        packages: ['PREMIUM']
      };
    }
    return {
      title: 'Nâng cấp gói',
      message: 'Bạn cần nâng cấp để sử dụng tính năng này',
      packages: requiredPackages || ['PRO', 'PREMIUM']
    };
  };

  const upgradeInfo = getUpgradeInfo();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">{upgradeInfo.title}</h2>
          <p className="text-gray-600 mb-6">{upgradeInfo.message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
            <button 
              onClick={() => window.location.href = '/packages'}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Nâng cấp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageFeatureGuard;

