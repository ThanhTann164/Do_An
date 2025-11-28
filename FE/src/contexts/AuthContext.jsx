import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const normalizeRoleValue = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
};

const isSellerRole = (role) => normalizeRoleValue(role) === 'seller';

const getUserRole = (user) => user?.role || user?.Role || '';

const FREE_PACKAGE_FALLBACK = {
  userPackage: {
    name: 'FREE',
    display_name: 'Gói Miễn Phí',
    is_free: true,
    expires_at: null
  },
  rules: {
    boost_per_day: 0,
    max_posts_per_day: 1,
    ai_tools: [],
    highlight: false,
    priority: 0,
    video_panorama: false,
    banner_ads: false
  },
  limits: {
    posts: {
      daily: 1,
      daily_used: 0,
      daily_remaining: 1
    },
    boost: {
      per_day: 0,
      used_today: 0,
      remaining_today: 0
    }
  },
  features: {
    ai_tools: [],
    highlight: false,
    priority: 0,
    video_panorama: false,
    banner_ads: false
  }
};

const cloneFreePackageDetail = () => JSON.parse(JSON.stringify(FREE_PACKAGE_FALLBACK));

const getInitialPackageState = () => {
  if (typeof window === 'undefined') {
    return { payload: null };
  }

  try {
    const cached = localStorage.getItem('packagePayload');
    if (!cached) {
      return { payload: null };
    }

    const parsed = JSON.parse(cached);
    return {
      payload: parsed
    };
  } catch (error) {
    console.warn('⚠️ [AuthContext] Failed to parse cached package payload:', error);
    localStorage.removeItem('packagePayload');
    return { payload: null };
  }
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const initialPackageState = useMemo(() => getInitialPackageState(), []);
  const [user, setUser] = useState(null);
  const [userPackage, setUserPackage] = useState(initialPackageState.payload);
  const [packageSummary, setPackageSummary] = useState(null);
  const [packageLoading, setPackageLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3001';

  const isSellerUser = (targetUser) => isSellerRole(getUserRole(targetUser));

  const applyUserState = (incomingUser) => {
    if (!incomingUser) {
      setUser(null);
      clearPackageState();
      return null;
    }

    const normalizedRole = getUserRole(incomingUser);
    const normalizedUser = {
      ...incomingUser,
      role: incomingUser.role || incomingUser.Role || (normalizedRole ? normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1) : '')
    };

    if (!isSellerRole(normalizedRole)) {
      normalizedUser.package = null;
      clearPackageState();
    } else if (incomingUser.package) {
      updatePackageState(incomingUser.package);
    }

    setUser(normalizedUser);
    return normalizedUser;
  };

  const updatePackageState = useCallback((payload, { persist = true } = {}) => {
    setUserPackage(payload);

    if (!persist || typeof window === 'undefined') {
      return;
    }

    if (!payload) {
      localStorage.removeItem('packagePayload');
    } else {
      localStorage.setItem('packagePayload', JSON.stringify(payload));
    }
  }, []);

  const clearPackageState = useCallback(() => {
    updatePackageState(null);
    setPackageSummary(null);
  }, [updatePackageState]);

  // Fetch user info
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        clearPackageState();
        setLoading(false);
        return null;
      }

      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data.data;
        return applyUserState(userData);
      }

      // Token invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      applyUserState(null);
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      applyUserState(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch package info
  const fetchMyPackage = useCallback(async ({ silentOnMissingToken = false, targetUser = null } = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (!silentOnMissingToken) {
        clearPackageState();
      }
      return null;
    }

    const activeUser = targetUser || user;
    if (!activeUser) {
      if (!silentOnMissingToken) {
        clearPackageState();
      }
      return null;
    }

    if (!isSellerUser(activeUser)) {
      console.log('[PACKAGE] Skip fetch, role =', activeUser?.role || 'unknown');
      clearPackageState();
      return null;
    }

    try {
      setPackageLoading(true);
      console.log('[PACKAGE] Fetching /api/packages/my-package for user', activeUser?.userId || activeUser?.id || 'unknown');

      const response = await fetch(`${API_URL}/api/packages/my-package`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📦 [AuthContext] Package API response status:', response.status);
      const data = await response.json().catch(() => ({}));
      console.log('📦 [AuthContext] Package API response data:', JSON.stringify(data, null, 2));

      if (response.ok && data) {
        setPackageSummary(data);

        let detail = data?.raw || null;
        if (!detail && data?.packageName === 'FREE') {
          detail = cloneFreePackageDetail();
        }

        updatePackageState(detail);
        console.log('📦 [AuthContext] Package loaded:', detail?.userPackage?.name || data?.packageName || 'NONE');
        return data;
      }

      console.error('❌ [AuthContext] Package API error:', response.status, data);

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearPackageState();
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error fetching package info:', error);
      setPackageSummary(null);
      clearPackageState();
    } finally {
      setPackageLoading(false);
    }

    return null;
  }, [user, clearPackageState]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('🔐 [AuthContext] Login response:', data);

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);

        const fetchedUser = await fetchUserInfo();
        await fetchMyPackage({ targetUser: fetchedUser });

        // Đợi một chút để state được cập nhật
        await new Promise(resolve => setTimeout(resolve, 100));
        window.dispatchEvent(new Event("package:refresh"));
        
        console.log('✅ [AuthContext] Login successful');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      return { success: false, message: 'Lỗi kết nối' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    clearPackageState();
    window.dispatchEvent(new Event("package:refresh"));
  };

  // Check if user has specific package
  const hasPackage = (packageName) => {
    return userPackage?.userPackage?.name === packageName;
  };

  // Check if user has feature access
  const hasFeature = (featureName) => {
    if (!userPackage || !userPackage.features) {
      return false;
    }

    const features = userPackage.features;
    
    // Handle different feature types
    switch (featureName) {
      case 'ai_tools':
        // Check if user has any AI tools
        return Array.isArray(features.ai_tools) && features.ai_tools.length > 0;
      
      case 'video_panorama':
        return features.video_panorama === true;
      
      case 'highlight':
        return features.highlight === true;
      
      case 'banner_ads':
        return features.banner_ads === true;
      
      case 'premium_analytics':
        return features.premium_analytics === true || userPackage?.userPackage?.name === 'PREMIUM';
      
      default:
        return features[featureName] === true;
    }
  };

  // Get package rules
  const getPackageRules = () => {
    return userPackage?.rules || {
      boost_per_day: 0,
      max_posts_per_day: 1,
      ai_tools: [],
      highlight: false,
      priority: 0,
      video_panorama: false,
      banner_ads: false
    };
  };

  // Check if user is FREE/PRO/PREMIUM
  const getCurrentPackageName = () => {
    const packageName = packageSummary?.packageName || packageSummary?.name || userPackage?.userPackage?.name;
    return packageName ? packageName.toUpperCase() : '';
  };

  const isFreePlan = () => {
    const packageName = getCurrentPackageName();
    const isFree = !packageName || packageName === 'FREE' || packageSummary?.isFree === true || userPackage?.userPackage?.is_free === true;
    
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
      console.log('🔍 [AuthContext] isFreePlan:', { packageName, isFree });
    }
    return isFree;
  };
  
  const isProPlan = () => {
    const packageName = getCurrentPackageName();
    const isPro = packageName === 'PRO';
    
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
      console.log('🔍 [AuthContext] isProPlan:', { packageName, isPro });
    }
    return isPro;
  };
  
  const isPremiumPlan = () => {
    const packageName = getCurrentPackageName();
    const isPremium = packageName === 'PREMIUM';
    
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
      console.log('🔍 [AuthContext] isPremiumPlan:', { packageName, isPremium });
    }
    return isPremium;
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      clearPackageState();
      return;
    }

    fetchMyPackage({ silentOnMissingToken: true, targetUser: user });
  }, [user, loading, fetchMyPackage, clearPackageState]);

  const value = {
    user,
    userPackage,
    packageInfo: packageSummary,
    loading,
    packageLoading,
    login,
    logout,
    fetchUserInfo,
    fetchMyPackage,
    hasPackage,
    hasFeature,
    getPackageRules,
    isFreePlan,
    isProPlan,
    isPremiumPlan
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
