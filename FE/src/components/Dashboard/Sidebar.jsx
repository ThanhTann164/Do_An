import React from 'react';
import { 
  Home, 
  BarChart3, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  Wifi
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  
  // Debug: Log user data structure
  React.useEffect(() => {
    console.log('🔍 [Sidebar] User Data in FE:', user);
    console.log('🔍 [Sidebar] User structure keys:', user ? Object.keys(user) : 'null');
    console.log('🔍 [Sidebar] User.currentPackage:', user?.currentPackage);
    console.log('🔍 [Sidebar] User.UserPackages:', user?.UserPackages);
    console.log('🔍 [Sidebar] User.userpackages:', user?.userpackages);
    console.log('🔍 [Sidebar] User.package:', user?.package);
  }, [user]);

  const menuItems = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: Home,
      path: '/seller/dashboard?tab=overview'
    },
    {
      id: 'market-analysis',
      label: 'Phân tích thị trường',
      icon: BarChart3,
      path: '/seller/market-analysis'
    },
    {
      id: 'iot',
      label: 'Thiết bị IoT',
      icon: Wifi,
      path: '/seller/dashboard?tab=iot'
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      icon: Bell,
      path: '/seller/dashboard?tab=notifications'
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      path: '/seller/dashboard?tab=settings'
    }
  ];

  const isActiveTab = (tabId) => {
    if (tabId === 'market-analysis') {
      return location.pathname === '/seller/market-analysis';
    }
    const urlParams = new URLSearchParams(location.search);
    const currentTab = urlParams.get('tab') || 'overview';
    return currentTab === tabId;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-soft-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-100
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-navy-900 to-navy-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-500 rounded-soft flex items-center justify-center shadow-soft">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-white text-lg">Dashboard</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-soft hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-soft-lg flex items-center justify-center shadow-soft">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full rounded-soft-lg object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900 truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-500 truncate font-medium">
                  {user.role || 'Seller'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveTab(item.id);
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-soft transition-all duration-200 font-medium
                      ${isActive 
                        ? 'bg-accent-50 text-accent-700 shadow-soft border-l-4 border-accent-500' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-navy-900'
                      }
                    `}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-accent-600' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-soft transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
