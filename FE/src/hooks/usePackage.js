import { useState, useEffect, useCallback } from 'react';
import { packageService } from '../services/packageService';
import { getPackageRules, hasFeature, hasAITool, getPackageColor, getPackageBadge } from '../constants/packages';

export const usePackage = () => {
  const [userPackage, setUserPackage] = useState(null);
  const [packageRules, setPackageRules] = useState(null);
  const [packageLimits, setPackageLimits] = useState(null);
  const [packageFeatures, setPackageFeatures] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's current package
  const fetchUserPackage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await packageService.getMyPackage();
      
      if (response?.raw) {
        const data = response.raw;
        setUserPackage(data.userPackage);
        setPackageRules(data.rules);
        setPackageLimits(data.limits);
        setPackageFeatures(data.features);
      } else if (response?.packageName === 'FREE' && response?.isFree) {
        const freeFallback = {
          name: 'FREE',
          display_name: 'Gói Miễn Phí',
          is_free: true,
          expires_at: null
        };
        setUserPackage(freeFallback);
        setPackageRules(getPackageRules('FREE'));
        setPackageLimits(null);
        setPackageFeatures(null);
      } else {
        setUserPackage(null);
        setPackageRules(getPackageRules('FREE'));
        setPackageLimits(null);
        setPackageFeatures(null);
      }
    } catch (err) {
      console.error('Error fetching user package:', err);
      setError(err.message);
      setUserPackage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all available packages
  const fetchPackages = useCallback(async () => {
    try {
      const response = await packageService.getAllPackages();
      
      if (response.success) {
        setPackages(response.data.packages || []);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.message);
    }
  }, []);

  // Check if user has access to a specific feature
  const hasFeatureAccess = useCallback((feature) => {
    if (!packageFeatures) return false;
    return packageFeatures[feature] || false;
  }, [packageFeatures]);

  // Check if user has AI tool access
  const hasAIAccess = useCallback((toolName) => {
    if (!packageFeatures || !packageFeatures.ai_tools) return false;
    return packageFeatures.ai_tools.includes(toolName);
  }, [packageFeatures]);

  // Get post limits for current package
  const getPostLimits = useCallback(() => {
    return packageLimits?.posts || {
      daily: 1,
      monthly: 3,
      daily_used: 0,
      monthly_used: 0,
      daily_remaining: 1,
      monthly_remaining: 3
    };
  }, [packageLimits]);

  // Get boost limits for current package
  const getBoostLimits = useCallback(() => {
    return packageLimits?.boost || {
      per_day: 0,
      used_today: 0,
      remaining_today: 0
    };
  }, [packageLimits]);

  // Get formatted package info for display
  const getPackageInfo = useCallback(() => {
    if (!userPackage) {
      return {
        name: 'FREE',
        displayName: 'Gói Miễn Phí',
        color: 'gray',
        badge: '🆓',
        isExpired: false,
        daysLeft: null
      };
    }

    const packageName = userPackage.name;
    const rules = getPackageRules(packageName);
    const isExpired = userPackage.expires_at && new Date(userPackage.expires_at) < new Date();
    const daysLeft = userPackage.expires_at ? 
      Math.max(0, Math.ceil((new Date(userPackage.expires_at) - new Date()) / (1000 * 60 * 60 * 24))) : null;

    return {
      name: packageName,
      displayName: userPackage.display_name,
      color: rules.color,
      badge: rules.badge,
      isExpired,
      daysLeft,
      expiryDate: userPackage.expires_at
    };
  }, [userPackage]);

  // Purchase a package
  const purchasePackage = useCallback(async (packageId, paymentMethod, transactionId) => {
    try {
      setLoading(true);
      const response = await packageService.purchasePackage(packageId, paymentMethod, transactionId);
      
      if (response.success) {
        // Refresh user package after purchase
        await fetchUserPackage();
        return response;
      } else {
        throw new Error(response.message || 'Purchase failed');
      }
    } catch (err) {
      console.error('Error purchasing package:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserPackage]);

  // Refresh package data
  const refreshPackageData = useCallback(async () => {
    await Promise.all([
      fetchUserPackage(),
      fetchPackages()
    ]);
  }, [fetchUserPackage, fetchPackages]);

  // Initialize data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshPackageData();
    } else {
      setLoading(false);
    }
  }, [refreshPackageData]);

  return {
    // State
    userPackage,
    packageRules,
    packageLimits,
    packageFeatures,
    packages,
    loading,
    error,

    // Actions
    fetchUserPackage,
    fetchPackages,
    purchasePackage,
    refreshPackageData,

    // Computed values
    hasFeatureAccess,
    hasAIAccess,
    getPostLimits,
    getBoostLimits,
    getPackageInfo,

    // Helper functions
    isFreePlan: !userPackage || userPackage.is_free,
    isProPlan: userPackage?.name === 'PRO',
    isPremiumPlan: userPackage?.name === 'PREMIUM',
    
    // Feature checks (commonly used)
    canUseAI: hasAIAccess('title_optimization') || hasAIAccess('description_generation'),
    canBoost: hasFeatureAccess('highlight') && (packageLimits?.boost?.per_day > 0 || packageLimits?.boost?.per_day === -1),
    canAccessPremiumAnalytics: hasFeatureAccess('premium_analytics'),
    hasVerifiedBadge: hasFeatureAccess('verified_badge'),
    canUploadVideo: hasFeatureAccess('video_upload'),
    hasUnlimitedPosts: packageLimits?.posts?.monthly === -1,
    hasUnlimitedBoost: packageLimits?.boost?.per_day === -1
  };
};
