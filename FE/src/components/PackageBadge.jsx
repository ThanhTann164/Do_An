import React, { useContext } from 'react';
import { Crown, Zap, Home } from 'lucide-react';
import { PackageContext } from '../context/PackageContext';
import { useAuth } from '../contexts/AuthContext';

const PackageBadge = ({ className = "", size = "sm", showName = true }) => {
  const { packageInfo, loading } = useContext(PackageContext);
  const { user } = useAuth();
  const isSeller = (user?.role || '').toLowerCase() === 'seller';

  if (!isSeller) {
    return null;
  }

  if (loading && !packageInfo) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-400 text-xs font-medium rounded-full animate-pulse ${className}`}>
        <span>Đang tải...</span>
      </span>
    );
  }

  if (!packageInfo) {
    return null;
  }

  const packageName = (packageInfo.packageName || 'FREE').toUpperCase();
  const displayName = packageInfo?.raw?.userPackage?.display_name || packageInfo?.packageName || packageName;
  const isExpired = resolvedPackage?.expires_at ? new Date(resolvedPackage.expires_at) < new Date() : false;

  const iconMap = {
    PREMIUM: Crown,
    PRO: Zap,
    FREE: Home
  };

  const Icon = iconMap[packageName] || Home;

  const baseStyles = "inline-flex items-center gap-1 font-medium rounded-full";
  const sizeStyles = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-1 text-xs", 
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const colorStyles = {
    FREE: "bg-gray-100 text-gray-700 border border-gray-200",
    PRO: "bg-blue-100 text-blue-700 border border-blue-200",
    PREMIUM: "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-300"
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size] || sizeStyles.sm} ${colorStyles[packageName] || colorStyles.FREE} ${className}`}>
      <Icon className="w-3 h-3" />
      {showName && <span>{displayName}</span>}
      {isExpired && (
        <span className="text-red-500 text-xs ml-1">(Hết hạn)</span>
      )}
    </span>
  );
};

export default PackageBadge;

