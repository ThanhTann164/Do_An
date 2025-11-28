import React from 'react';
import { Lock, Crown, Zap, AlertCircle, Home } from 'lucide-react';
import { usePackage } from '../hooks/usePackage';
import { Link } from 'react-router-dom';
import PackageBadge from './PackageBadge';

/**
 * Component để wrap các tính năng cần kiểm tra gói
 * Hiển thị nội dung nếu có quyền, hoặc hiển thị thông báo nâng cấp
 */
const PackageFeature = ({ 
  feature, 
  aiTool = null,
  children, 
  fallback = null,
  showUpgrade = true,
  className = "",
  requiredPackages = []
}) => {
  const { hasFeatureAccess, hasAIAccess, isFreePlan, isProPlan, isPremiumPlan, userPackage } = usePackage();

  const hasAccess = aiTool ? hasAIAccess(aiTool) : hasFeatureAccess(feature);

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  // If no access and fallback provided, show fallback
  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // If no access and showUpgrade is false, don't render anything
  if (!showUpgrade) {
    return null;
  }

  // Show upgrade message
  const getUpgradeMessage = () => {
    switch (feature) {
      case 'ai_title_optimization':
      case 'ai_description_generation':
        return {
          title: 'Tính năng AI',
          message: 'Tối ưu tiêu đề và mô tả bằng AI',
          packages: ['PRO', 'PREMIUM']
        };
      case 'ai_market_analysis':
      case 'ai_price_suggestion':
        return {
          title: 'AI Nâng cao',
          message: 'Phân tích thị trường và gợi ý giá',
          packages: ['PREMIUM']
        };
      case 'boost':
        return {
          title: 'Boost tin đăng',
          message: 'Đẩy tin lên đầu danh sách',
          packages: ['PRO', 'PREMIUM']
        };
      case 'unlimited_boost':
        return {
          title: 'Boost không giới hạn',
          message: 'Boost tin đăng không giới hạn',
          packages: ['PREMIUM']
        };
      case 'premium_analytics':
        return {
          title: 'Thống kê nâng cao',
          message: 'Báo cáo chi tiết và phân tích xu hướng',
          packages: ['PREMIUM']
        };
      case 'video_upload':
        return {
          title: 'Upload video',
          message: 'Đăng video và ảnh panorama',
          packages: ['PRO', 'PREMIUM']
        };
      default:
        return {
          title: 'Tính năng Premium',
          message: 'Nâng cấp để sử dụng tính năng này',
          packages: requiredPackages.length > 0 ? requiredPackages : ['PRO', 'PREMIUM']
        };
    }
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <div className={`${className} relative`}>
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {upgradeInfo.title}
        </h3>
        
        <p className="text-gray-600 mb-4">
          {upgradeInfo.message}
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          {upgradeInfo.packages.map((pkg, index) => (
            <React.Fragment key={pkg}>
              {index > 0 && <span className="text-gray-400">hoặc</span>}
              <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border">
                {pkg === 'PREMIUM' ? (
                  <Crown className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Zap className="w-4 h-4 text-purple-500" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {pkg}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <Link
          to="/packages"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>Nâng cấp ngay</span>
          <Crown className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

/**
 * Component để hiển thị badge gói hiện tại (moved to separate file)
 */
export { default as PackageBadge } from './PackageBadge';

/**
 * Component để hiển thị cảnh báo giới hạn
 */
export const PackageLimit = ({ type = 'posts', className = "" }) => {
  const { getPostLimits, getBoostLimits, isFreePlan } = usePackage();

  if (type === 'posts') {
    const limits = getPostLimits();
    
    if (limits.unlimited) {
      return null; // Không hiển thị gì nếu không giới hạn
    }

    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Giới hạn đăng bài
            </p>
            <p className="text-sm text-amber-700">
              Bạn có thể đăng tối đa {limits.maxPosts} bài viết mỗi tháng với gói hiện tại.
            </p>
            {isFreePlan && (
              <Link 
                to="/packages" 
                className="text-sm text-amber-800 underline hover:text-amber-900"
              >
                Nâng cấp để đăng nhiều hơn
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'boost') {
    const limits = getBoostLimits();
    
    if (limits.unlimited || limits.boostPerDay === 0) {
      return null;
    }

    if (limits.remainingBoosts === 0) {
      return (
        <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Hết lượt boost
              </p>
              <p className="text-sm text-red-700">
                Bạn đã sử dụng hết {limits.boostPerDay} lượt boost hôm nay.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Lượt boost còn lại
            </p>
            <p className="text-sm text-blue-700">
              Còn {limits.remainingBoosts}/{limits.boostPerDay} lượt boost hôm nay.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PackageFeature;
