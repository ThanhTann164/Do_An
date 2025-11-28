import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import PackageBadge from './PackageBadge';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user: authUser, userPackage, isFreePlan, isProPlan, isPremiumPlan, logout: authLogout } = useAuth();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Scroll effect for navbar shrink
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const authMenu = document.getElementById('auth-menu');
      const notificationMenu = document.querySelector('.notification-dropdown');
      
      if (authMenu && !authMenu.contains(event.target)) {
        setShowDropdown(false);
      }
      
      if (notificationMenu && !notificationMenu.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showDropdown || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showNotifications]);

  // Toggle dropdown on click
  const toggleDropdown = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  // Log whenever user state changes
  useEffect(() => {
    console.log('🔄 [Navbar] User state changed:', user);
  }, [user]);

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    console.log('🔄 [Navbar] Component mounted, fetching user data');
    console.log('🔍 [Navbar] Token in localStorage:', localStorage.getItem('token') ? 'exists' : 'not found');
    console.log('👤 [Navbar] User in localStorage:', localStorage.getItem('user'));
    
    // Fetch ngay khi mount
    console.log('🔄 [Navbar] Calling fetchUserData on mount');
    fetchUserData();
    
    // Lắng nghe sự kiện user login/logout
    const handleUserChange = () => {
      console.log('📢 [Navbar] userChanged event received, fetching user data');
      setTimeout(() => fetchUserData(), 50);
    };
    
    // Lắng nghe sự kiện storage change (khi localStorage thay đổi từ tab khác)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('💾 [Navbar] localStorage changed, fetching user data');
        setTimeout(() => fetchUserData(), 50);
      }
    };
    
    window.addEventListener('userChanged', handleUserChange);
    window.addEventListener('storage', handleStorageChange);
    console.log('👂 [Navbar] Event listeners added');
    
    return () => {
      console.log('🧹 [Navbar] Cleaning up event listeners');
      window.removeEventListener('userChanged', handleUserChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 [Navbar] fetchUserData called');
      console.log('🔍 [Navbar] Checking token:', token ? 'exists' : 'not found');
      console.log('🔍 [Navbar] Token value:', token?.substring(0, 20) + '...');
      
      if (!token) {
        console.log('❌ [Navbar] No token, setting user to null');
        setUser(null);
        return;
      }

      console.log('📡 [Navbar] Calling API:', `${API_URL}/api/user`);
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 [Navbar] API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 [Navbar] API Response data:', JSON.stringify(data, null, 2));
        const userData = data.user || data.data;
        console.log('✅ [Navbar] User data fetched:', userData);
        console.log('👤 [Navbar] FullName:', userData?.fullName);
        console.log('👤 [Navbar] Display Name:', userData?.display_name);
        console.log('👤 [Navbar] Email:', userData?.email);
        console.log('👤 [Navbar] All user keys:', Object.keys(userData || {}));
        setUser(userData);
        console.log('✅ [Navbar] User state updated');
      } else {
        console.log('❌ [Navbar] Response not OK, status:', response.status);
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ [Navbar] Error response:', errorData);
        // Nếu token không hợp lệ, xóa nó
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ [Navbar] Error fetching user data:', error);
      console.error('❌ [Navbar] Error stack:', error.stack);
      setUser(null);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/logout`, { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error logging out:', error);
      } finally {
        // Luôn xóa token và user khi logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        // Dispatch event để các component khác biết user đã logout
        window.dispatchEvent(new Event('userChanged'));
        
        navigate('/login');
      }
    }
  };

  const handlePostClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/posts');
    } else {
      if (window.confirm('Bạn cần đăng nhập để xem bài đăng. Chuyển đến trang đăng nhập?')) {
        navigate('/profile');
      }
    }
  };

  const handleMyHomeClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/myhome');
    } else {
      if (window.confirm('Bạn cần đăng nhập để xem nhà của mình. Chuyển đến trang đăng nhập?')) {
        navigate('/profile');
      }
    }
  };

  // Monitor token changes - fetch user data if token exists but user is null
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔄 [Navbar] Token monitor: token exists =', !!token, ', user exists =', !!user);
    
    if (token && !user) {
      console.log('🔄 [Navbar] Token exists but user is null, fetching immediately...');
      fetchUserData();
    }
  }, [user]);

  // Also check on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      console.log('🔄 [Navbar] On mount: Token exists but user is null, fetching...');
      fetchUserData();
    }
  }, []);

  // Lấy tên hiển thị với package badge
  const getDisplayName = () => {
    const currentUser = authUser || user;
    const currentRole = (currentUser?.role || '').toLowerCase();
    const canShowPackage = currentRole === 'seller';
    if (!currentUser) {
      console.log('⚠️ [Navbar] getDisplayName: user is null');
      return null;
    }
    const displayName = currentUser.fullName || currentUser.display_name || currentUser.username || currentUser.email?.split('@')[0] || 'User';
    console.log('👤 [Navbar] getDisplayName:', displayName, 'from user:', currentUser);
    console.log('💰 [Navbar] Balance:', balance);
    return (
      <div className="flex items-center gap-2">
        <span>{displayName}</span>
        {/* Package Badge */}
        {canShowPackage && (
          <>
            {isFreePlan() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                FREE
              </span>
            )}
            {isProPlan() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                ⚡ PRO
              </span>
            )}
            {isPremiumPlan() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs font-medium rounded-full">
                👑 PREMIUM
              </span>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu */}
      <div className={`site-mobile-menu site-navbar-target ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="site-mobile-menu-header">
          <div className="site-mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="icofont-close js-menu-toggle"></span>
          </div>
        </div>
        <div className="site-mobile-menu-body">
          <div className="site-nav-wrap">
            <ul className="site-menu">
              <li><Link to="/">Home</Link></li>
              <li><a href="#" onClick={handleMyHomeClick}>MyHome</a></li>
              <li><a href="#" onClick={handlePostClick}>Book an appointment</a></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              {user && <li><Link to="/devices">Device</Link></li>}
              {user ? (
                <li className="has-children">
                  <a href="#">Hi, {getDisplayName()}</a>
                  <ul className="dropdown">
                    <li className="balance-item">
                      <span className="balance-text">Số dư: {balance.toLocaleString('vi-VN')} ₫</span>
                      <Link to="/payment" className="balance-add-btn" title="Nạp tiền">
                        <i className="fas fa-plus-circle"></i>
                      </Link>
                    </li>
                    <li><Link to="/profile">Trang cá nhân</Link></li>
                    <li><Link to="/change-password">Đổi mật khẩu</Link></li>
                    <li><Link to="/my-viewings">Lịch xem nhà của tôi</Link></li>
                    {user.role === 'Seller' && (
                      <li><Link to="/viewings">Quản lý lịch xem nhà</Link></li>
                    )}
                    <li><a href="#" onClick={handleLogout}>Logout</a></li>
                  </ul>
                </li>
              ) : (
                <li><Link to="/login">Login</Link></li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Navbar */}
      <nav className={`site-nav sticky top-0 w-full z-[60] transition-all duration-500 ease-out rounded-b-2xl border-b border-white/20 ${
        isScrolled 
          ? 'bg-gradient-to-r from-emerald-700/95 via-teal-700/95 to-emerald-800/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] py-3 scale-[0.9]' 
          : 'bg-gradient-to-r from-emerald-700/95 via-teal-700/90 to-emerald-800/95 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] py-5'
      }`}>
        <div className="container mx-auto px-10">
          <div className="menu-bg-wrap">
            <div className="site-navigation flex items-center justify-between h-full">
              <Link 
                to="/" 
                className="logo m-0 text-2xl font-bold text-white transition-all duration-300 hover:scale-105 hover:text-white/90"
                style={{ fontSize: '24px' }}
              >
                Property
              </Link>

              <ul className="js-clone-nav d-none d-lg-flex items-center space-x-10 site-menu">
                <li><Link 
                  to="/" 
                  className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 hover:underline hover:underline-offset-8 hover:decoration-2 py-3 px-2"
                  style={{ fontSize: '17px' }}
                >Home</Link></li>
                <li><a 
                  href="#" 
                  onClick={handleMyHomeClick}
                  className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 hover:underline hover:underline-offset-8 hover:decoration-2 py-3 px-2"
                  style={{ fontSize: '17px' }}
                >MyHome</a></li>
                <li><a 
                  href="#" 
                  onClick={handlePostClick}
                  className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 hover:underline hover:underline-offset-8 hover:decoration-2 py-3 px-2"
                  style={{ fontSize: '17px' }}
                >Book an appointment</a></li>
                <li><Link 
                  to="/services"
                  className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 hover:underline hover:underline-offset-8 hover:decoration-2 py-3 px-2"
                  style={{ fontSize: '17px' }}
                >Services</Link></li>
                <li><Link 
                  to="/about"
                  className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 hover:underline hover:underline-offset-8 hover:decoration-2 py-3 px-2"
                  style={{ fontSize: '17px' }}
                >About</Link></li>
                <li><Link 
                  to="/contact"
                  className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 hover:underline hover:underline-offset-8 hover:decoration-2 py-3 px-2"
                  style={{ fontSize: '17px' }}
                >Contact Us</Link></li>
                {user && <li id="device-menu"><Link 
                  to="/devices"
                  className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 hover:underline hover:underline-offset-8 hover:decoration-2 py-3 px-2"
                  style={{ fontSize: '17px' }}
                >Device</Link></li>}
              </ul>

              {/* Right Side Icons Container */}
              <div className="flex items-center gap-4">
                {/* Notification Bell - For all logged in users */}
                {user && <NotificationBell />}

                {/* User Dropdown */}
                {user ? (
                  <div 
                    id="auth-menu" 
                    className="relative has-children"
                  >
                    <a 
                      href="#" 
                      onClick={toggleDropdown}
                      className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 flex items-center space-x-3 px-6 py-3 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10"
                      style={{ fontSize: '17px' }}
                    >
                      <span>Hi, {getDisplayName()}</span>
                      {((authUser || user)?.role || '').toLowerCase() === 'seller' && (
                        <PackageBadge className="ml-2" />
                      )}
                      <svg className={`w-5 h-5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </a>
                    {showDropdown && (
                      <ul className="dropdown absolute top-full right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-3 transform scale-100 opacity-100 transition-all duration-300 z-[70]" style={{ display: 'block' }}>
                        <li className="balance-item px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-emerald-50/80 to-teal-50/80">
                          <div className="flex items-center justify-between">
                            <span className="balance-text text-sm font-semibold text-gray-700">Số dư: {balance.toLocaleString('vi-VN')} ₫</span>
                            <Link 
                              to="/payment" 
                              className="balance-add-btn w-9 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg" 
                              title="Nạp tiền"
                              onClick={() => setShowDropdown(false)}
                            >
                              <i className="fas fa-plus text-sm"></i>
                            </Link>
                          </div>
                        </li>
                        <li><Link 
                          to="/profile" 
                          className="block px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3 font-medium"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="fas fa-user w-5 text-emerald-600"></i><span>Trang cá nhân</span>
                        </Link></li>
                        <li><Link 
                          to="/change-password" 
                          className="block px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3 font-medium"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="fas fa-key w-5 text-emerald-600"></i><span>Đổi mật khẩu</span>
                        </Link></li>
                        <li><Link 
                          to="/my-viewings" 
                          className="block px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3 font-medium"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="fas fa-calendar w-5 text-emerald-600"></i><span>Lịch xem nhà của tôi</span>
                        </Link></li>
                        {user.role === 'Seller' && (
                          <>
                            <li><Link 
                              to="/viewings" 
                              className="block px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-200 flex items-center space-x-3 font-medium"
                              onClick={() => setShowDropdown(false)}
                            >
                              <i className="fas fa-clipboard-list w-5 text-emerald-600"></i><span>Quản lý lịch xem nhà</span>
                            </Link></li>
                            <li><Link 
                              to="/seller/dashboard" 
                              className="block px-6 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 flex items-center space-x-3 font-medium"
                              onClick={() => setShowDropdown(false)}
                            >
                              <i className="fas fa-table-columns w-5 text-purple-600"></i><span>Seller Dashboard</span>
                            </Link></li>
                          </>
                        )}
                        <li className="border-t border-gray-100/50 mt-2 pt-2">
                          <a 
                            href="#" 
                            onClick={(e) => {
                              setShowDropdown(false);
                              handleLogout(e);
                            }}
                            className="block px-6 py-3 text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 flex items-center space-x-3 font-medium"
                          >
                            <i className="fas fa-sign-out-alt w-5"></i><span>Logout</span>
                          </a>
                        </li>
                      </ul>
                    )}
                  </div>
                ) : (
                  <div id="auth-menu">
                    <Link 
                      to="/login"
                      className="nav-link-premium relative text-white/90 hover:text-white font-semibold transition-all duration-300 hover:scale-103 px-8 py-3 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10"
                      style={{ fontSize: '17px' }}
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>

              <a
                href="#"
                className="burger light me-auto float-end mt-1 site-menu-toggle js-menu-toggle d-inline-block d-lg-none"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
              >
                <span></span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}