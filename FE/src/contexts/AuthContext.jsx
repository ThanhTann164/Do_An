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

  /**
   * Normalize user object structure để đảm bảo consistency
   * Xử lý nhiều cấu trúc response từ backend:
   * 1. Flat currentPackage (từ API response mới)
   * 2. Nested UserPackages array (nếu eager load từ Sequelize)
   * 3. Nested userpackages array (alias)
   * 
   * @param {Object} incomingUser - User object từ API
   * @returns {Object} Normalized user object với flat currentPackage structure
   */
  const normalizeUser = useCallback((incomingUser) => {
    if (!incomingUser) {
      return null;
    }

    const normalizedRole = getUserRole(incomingUser);
    const now = new Date();

    // Base normalized user
    const normalizedUser = {
      ...incomingUser,
      role: incomingUser.role || incomingUser.Role || (normalizedRole ? normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1) : '')
    };

    // 1. Nếu đã có currentPackage từ API (flat structure) - ưu tiên cao nhất
    if (incomingUser.currentPackage) {
      // Ensure package name is uppercase
      const packageName = incomingUser.currentPackage.name 
        ? incomingUser.currentPackage.name.toUpperCase() 
        : (incomingUser.currentPackage.packageName 
          ? incomingUser.currentPackage.packageName.toUpperCase() 
          : 'FREE');
      
      normalizedUser.currentPackage = {
        ...incomingUser.currentPackage,
        name: packageName,
        packageName: packageName, // Ensure both fields are uppercase
        isFree: packageName === 'FREE'
      };
      console.log('✅ [normalizeUser] Using flat currentPackage from API:', normalizedUser.currentPackage);
    } 
    // 2. Nếu có UserPackages array (nested structure từ Sequelize eager load)
    else {
      const userPackages = incomingUser.UserPackages || incomingUser.userpackages || incomingUser.UserPackage || [];
      
      if (Array.isArray(userPackages) && userPackages.length > 0) {
        console.log('🔍 [normalizeUser] Found UserPackages array, extracting active package...');
        
        // Tìm active package: status = 'active' và end_at > now
        const activePackage = userPackages.find(pkg => {
          const status = pkg.status || pkg.Status;
          const endAt = pkg.end_at || pkg.endAt || pkg.endAtDate;
          
          if (status?.toLowerCase() !== 'active') {
            return false;
          }
          
          if (endAt) {
            const endDate = new Date(endAt);
            return endDate > now;
          }
          
          // Nếu không có end_at, coi như không hết hạn
          return true;
        });

        if (activePackage) {
          // Extract package name từ Package relation hoặc trực tiếp
          let packageName = activePackage.Package?.name || 
                             activePackage.package?.name ||
                             activePackage.package_name ||
                             activePackage.PackageName ||
                             activePackage.name ||
                             'FREE';

          // Ensure uppercase
          packageName = packageName.toUpperCase();

          const displayName = activePackage.Package?.display_name ||
                             activePackage.package?.display_name ||
                             activePackage.display_name ||
                             (packageName === 'PREMIUM' ? 'Gói Premium' : 
                              packageName === 'PRO' ? 'Gói Pro' : 'Gói Miễn Phí');

          // Tạo flat currentPackage structure
          normalizedUser.currentPackage = {
            name: packageName, // PREMIUM, PRO, or FREE (uppercase)
            displayName: displayName,
            isFree: packageName === 'FREE',
            expiresAt: activePackage.end_at || activePackage.endAt || activePackage.endAtDate || null,
            packageName: packageName, // Alias for compatibility (uppercase)
            packageId: activePackage.package_id || activePackage.packageId || null
          };

          console.log('✅ [normalizeUser] Extracted currentPackage from UserPackages:', normalizedUser.currentPackage);
        } else {
          // Không tìm thấy active package, set FREE
          normalizedUser.currentPackage = {
            name: 'FREE',
            displayName: 'Gói Miễn Phí',
            isFree: true,
            expiresAt: null,
            packageName: 'FREE',
            packageId: null
          };
          console.log('⚠️ [normalizeUser] No active package found, defaulting to FREE');
        }
      }
      // 3. Nếu không có UserPackages và không có currentPackage, set FREE
      else {
        normalizedUser.currentPackage = {
          name: 'FREE',
          displayName: 'Gói Miễn Phí',
          isFree: true,
          expiresAt: null,
          packageName: 'FREE',
          packageId: null
        };
        console.log('⚠️ [normalizeUser] No package data found, defaulting to FREE');
      }
    }

    // Remove nested UserPackages để tránh confusion (giữ lại currentPackage flat)
    if (normalizedUser.UserPackages) {
      delete normalizedUser.UserPackages;
    }
    if (normalizedUser.userpackages) {
      delete normalizedUser.userpackages;
    }
    if (normalizedUser.UserPackage) {
      delete normalizedUser.UserPackage;
    }

    return normalizedUser;
  }, []);

  const applyUserState = (incomingUser) => {
    if (!incomingUser) {
      setUser(null);
      clearPackageState();
      return null;
    }

    // Normalize user object trước khi apply state
    const normalizedUser = normalizeUser(incomingUser);

    if (!normalizedUser) {
      setUser(null);
      clearPackageState();
      return null;
    }

    const normalizedRole = getUserRole(normalizedUser);

    if (!isSellerRole(normalizedRole)) {
      normalizedUser.package = null;
      clearPackageState();
    } else if (incomingUser.package) {
      updatePackageState(incomingUser.package);
    }

    console.log('✅ [applyUserState] Final normalized user structure:', {
      userId: normalizedUser.userId,
      role: normalizedUser.role,
      currentPackage: normalizedUser.currentPackage,
      hasUserPackages: !!(incomingUser.UserPackages || incomingUser.userpackages)
    });

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

  // Fetch user info - Luôn fetch từ API để đảm bảo dữ liệu mới nhất
  const fetchUserInfo = useCallback(async (options = {}) => {
    const { force = false } = options;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        clearPackageState();
        if (!options.silent) {
          setLoading(false);
        }
        return null;
      }

      console.log('🔄 [AuthContext] Fetching user info from API...');
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: force ? 'no-cache' : 'default' // Force refresh nếu cần
      });

      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data.data || data;
        
        console.log('✅ [AuthContext] User data received:', {
          userId: userData?.userId,
          role: userData?.role,
          currentPackage: userData?.currentPackage || data?.currentPackage
        });

        // Xử lý currentPackage từ root level hoặc user object
        if (data.currentPackage && !userData.currentPackage) {
          userData.currentPackage = data.currentPackage;
        }

        const updatedUser = applyUserState(userData);
        
        // Nếu là Seller và có currentPackage, trigger fetch package details
        if (isSellerRole(getUserRole(updatedUser)) && updatedUser?.currentPackage) {
          // Fetch package details ngay sau khi có user info
          setTimeout(() => {
            fetchMyPackage({ targetUser: updatedUser, silentOnMissingToken: true });
          }, 100);
        }
        
        return updatedUser;
      }

      // Token invalid
      console.warn('⚠️ [AuthContext] Token invalid, clearing auth state');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      applyUserState(null);
      return null;
    } catch (error) {
      console.error('❌ [AuthContext] Error fetching user info:', error);
      applyUserState(null);
      return null;
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [clearPackageState, fetchMyPackage]);

  // Refresh profile - Function để gọi từ bất kỳ đâu (như PaymentSuccess)
  const refreshProfile = useCallback(async () => {
    console.log('🔄 [AuthContext] Refreshing user profile...');
    setLoading(true);
    try {
      const updatedUser = await fetchUserInfo({ force: true, silent: true });
      
      // Nếu là Seller, cũng refresh package
      if (updatedUser && isSellerRole(getUserRole(updatedUser))) {
        await fetchMyPackage({ targetUser: updatedUser, silentOnMissingToken: true });
      }
      
      // Trigger refresh event cho các components khác
      window.dispatchEvent(new Event("package:refresh"));
      window.dispatchEvent(new Event("user:refresh"));
      
      console.log('✅ [AuthContext] Profile refreshed successfully');
      return updatedUser;
    } catch (error) {
      console.error('❌ [AuthContext] Error refreshing profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchUserInfo, fetchMyPackage]);

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
      console.log('📦 [AuthContext] Package name from response:', data?.packageName);
      console.log('📦 [AuthContext] Raw data exists:', !!data?.raw);
      console.log('📦 [AuthContext] Raw data:', data?.raw);

      if (response.ok && data) {
        setPackageSummary(data);

        let detail = data?.raw || null;
        console.log('📦 [AuthContext] Detail before check:', detail);
        console.log('📦 [AuthContext] Package name check:', data?.packageName, '=== FREE?', data?.packageName === 'FREE');
        
        if (!detail && data?.packageName === 'FREE') {
          console.log('📦 [AuthContext] Creating FREE package detail fallback');
          detail = cloneFreePackageDetail();
        }

        console.log('📦 [AuthContext] Final detail:', detail);
        console.log('📦 [AuthContext] Detail userPackage name:', detail?.userPackage?.name);
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

  // Khởi tạo: Luôn fetch latest user profile từ API khi app khởi động
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Luôn fetch từ API, không tin vào localStorage
      console.log('🚀 [AuthContext] App initialized, fetching latest user profile from API...');
      fetchUserInfo({ force: true });
    } else {
      setLoading(false);
    }
  }, []); // Chỉ chạy một lần khi mount

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
    refreshProfile, // Export function để có thể gọi từ PaymentSuccess
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
