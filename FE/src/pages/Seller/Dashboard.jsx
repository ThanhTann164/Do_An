import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User, 
  Menu
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useDashboard from '../../hooks/useDashboard';
import { useNotifications } from '../../hooks/useNotifications';
import OverviewCard from '../../components/Dashboard/OverviewCard';
import IoTStatus from '../../components/Dashboard/IoTStatus';
import PostList from '../../components/Dashboard/PostList';
import PostChart from '../../components/Dashboard/PostChart';
import PackageCard from '../../components/Dashboard/PackageCard';
import Sidebar from '../../components/Dashboard/Sidebar';
import LoadingSkeleton from '../../components/Dashboard/LoadingSkeleton';
import NotificationBell from '../../components/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();
  
  const {
    stats,
    iotData,
    posts,
    loading,
    error,
    lastUpdated,
    autoRefresh,
    setAutoRefresh,
    refresh,
    updatePosts,
    fetchPostStats
  } = useDashboard();

  const { notifications, unreadCount } = useNotifications();
  const { user: authUser } = useAuth();
  const isSeller = (authUser?.role || '').toLowerCase() === 'seller';

  // Handle tab change from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['overview', 'iot', 'notifications'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('overview');
    }
  }, [location.search]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (loading) {
      switch (activeTab) {
        case 'overview':
          return <LoadingSkeleton type="overview" />;
        case 'iot':
          return <LoadingSkeleton type="iot" />;
        case 'notifications':
          return <LoadingSkeleton type="notifications" />;
        default:
          return <LoadingSkeleton />;
      }
    }

    if (error) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-soft-lg p-8 text-center shadow-soft">
          <div className="text-red-600 mb-3 text-lg font-semibold">⚠️ Lỗi tải dữ liệu</div>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={refresh}
            className="bg-red-600 text-white px-6 py-3 rounded-soft-lg hover:bg-red-700 transition-all duration-200 shadow-soft hover:shadow-soft-lg font-medium"
          >
            Thử lại
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 lg:space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <OverviewCard stats={stats} />
              </div>
              {isSeller && (
                <div>
                  <PackageCard />
                </div>
              )}
            </div>

            {/* IoT Status */}
            <IoTStatus iotData={iotData} />

            {/* Recent Posts */}
            <div className="bg-white rounded-soft-lg shadow-soft border border-gray-100 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-navy-900">Bài đăng gần đây</h3>
                <Link 
                  to="/seller/posts"
                  className="text-accent-600 hover:text-accent-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  Xem tất cả <span>→</span>
                </Link>
              </div>
              <PostList posts={posts?.slice(0, 5) || []} compact={true} />
            </div>
          </div>
        );

      case 'iot':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">IoT Monitoring</h2>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Tự động cập nhật</span>
                </label>
                <span className="text-xs text-gray-500">
                  Cập nhật lần cuối: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <IoTStatus iotData={iotData} detailed={true} />
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Thông báo</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <span className="text-xs text-gray-500 mt-2 block">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          notification.type === 'success' ? 'bg-green-100 text-green-800' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          notification.type === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Tab không tồn tại</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={null}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-soft text-gray-500 hover:text-navy-900 hover:bg-gray-100 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 lg:hidden">
              <h1 className="text-lg font-semibold text-navy-900">
                {activeTab === 'overview' ? 'Tổng quan' :
                 activeTab === 'iot' ? 'IoT Monitoring' :
                 activeTab === 'notifications' ? 'Thông báo' : 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-3 px-3 py-2 rounded-soft bg-gray-50">
                <div className="h-9 w-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-soft-lg flex items-center justify-center shadow-soft">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-navy-900 hidden sm:block">
                  Seller
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;