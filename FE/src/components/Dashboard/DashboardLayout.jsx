import React from 'react';
import { Bell, User, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, user, notifications = [] }) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Title */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00A884] to-[#00b894] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RE</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Seller Dashboard</span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-[#00A884] hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#00A884] to-[#00b894] rounded-full flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.FullName || 'Seller'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Dropdown Menu */}
                  <div className="relative group">
                  <button className="p-2 text-gray-500 hover:text-[#00A884] hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00A884]"
                      >
                        Thông tin cá nhân
                      </Link>
                      <Link 
                        to="/change-password" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00A884]"
                      >
                        Đổi mật khẩu
                      </Link>
                      <Link 
                        to="/posts" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00A884]"
                      >
                        Quản lý bài đăng
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
