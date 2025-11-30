import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Eye, 
  Calendar, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Components
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import SellerInfoCard from '../../components/Dashboard/SellerInfoCard';
import StatsCard from '../../components/Dashboard/StatsCard';
import PropertyListCard from '../../components/Dashboard/PropertyListCard';
import NotificationCard from '../../components/Dashboard/NotificationCard';
import PackageCard from '../../components/Dashboard/PackageCard';

// Services
import { dashboardAPI } from '../../services/apiDashboard';

// Styles
import '../../styles/dashboard.css';

const ModernDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    approvedPosts: 0,
    pendingPosts: 0,
    totalViews: 0,
    totalViewings: 0,
    pendingViewings: 0
  });
  const [properties, setProperties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user info
      try {
        const userResponse = await dashboardAPI.getSellerInfo();
        if (userResponse.success) {
          setUser(userResponse.data?.user || userResponse.user);
        }
      } catch (userError) {
        console.error('Error fetching user info:', userError.message);
      }

      // Fetch real stats - NO MOCK DATA
      try {
        const statsResponse = await dashboardAPI.getSellerStats();
        if (statsResponse.success) {
          setStats(statsResponse.data || statsResponse);
        }
      } catch (statsError) {
        console.error('Stats API not available:', statsError.message);
        // Keep empty stats instead of mock data
        setStats({
          totalPosts: 0,
          approvedPosts: 0,
          pendingPosts: 0,
          totalViews: 0,
          totalViewings: 0,
          pendingViewings: 0
        });
      }

      // Fetch real properties - NO MOCK DATA
      try {
        const propertiesResponse = await dashboardAPI.getSellerProperties(5);
        if (propertiesResponse.success) {
          setProperties(propertiesResponse.data || propertiesResponse.properties || []);
        }
      } catch (propertiesError) {
        console.error('Properties API not available:', propertiesError.message);
        // Keep empty array instead of mock data
        setProperties([]);
      }

      // Fetch real notifications - NO MOCK DATA
      try {
        const notificationsResponse = await dashboardAPI.getNotifications(5);
        if (notificationsResponse.success) {
          setNotifications(notificationsResponse.data || notificationsResponse.notifications || []);
        }
      } catch (notificationsError) {
        console.error('Notifications API not available:', notificationsError.message);
        // Keep empty array instead of mock data
        setNotifications([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (error && !stats.totalPosts) {
    return (
      <DashboardLayout user={user} notifications={notifications}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-[#00A884] text-white rounded-lg hover:bg-[#007a65] transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} notifications={notifications}>
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Chào mừng trở lại, {user?.fullName || user?.FullName || 'Seller'}! 👋
              </h1>
              <p className="text-gray-600">
                Quản lý bất động sản của bạn một cách hiệu quả
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/post/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00A884] to-[#00b894] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Đăng tin mới
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid - NO FAKE TRENDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 stats-grid">
          <StatsCard
            icon={Home}
            title="Tổng bài đăng"
            value={loading ? 0 : stats.totalPosts}
            color="teal"
            onClick={() => navigate('/posts')}
          />
          <StatsCard
            icon={CheckCircle}
            title="Bài đăng đã duyệt"
            value={loading ? 0 : stats.approvedPosts}
            color="green"
            onClick={() => navigate('/posts?status=approved')}
          />
          <StatsCard
            icon={Clock}
            title="Chờ duyệt"
            value={loading ? 0 : stats.pendingPosts}
            color="orange"
            onClick={() => navigate('/posts?status=pending')}
          />
          <StatsCard
            icon={Eye}
            title="Tổng lượt xem"
            value={loading ? 0 : stats.totalViews}
            color="blue"
          />
          <StatsCard
            icon={Calendar}
            title="Lịch xem nhà"
            value={loading ? 0 : stats.totalViewings}
            color="purple"
            onClick={() => navigate('/viewings')}
          />
          <StatsCard
            icon={TrendingUp}
            title="Hiệu suất (%)"
            value={loading ? 0 : Math.round((stats.approvedPosts / Math.max(stats.totalPosts, 1)) * 100)}
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 main-grid">
          {/* Left Column - Properties & Info */}
          <div className="lg:col-span-2 space-y-6">
            <PropertyListCard 
              properties={properties} 
              loading={loading}
            />
            
            {/* Quick Actions */}
            <div className="dashboard-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/post/create"
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
                >
                  <Plus className="w-8 h-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-medium text-gray-900">Đăng tin mới</h4>
                    <p className="text-sm text-gray-600">Tạo bài đăng bán nhà</p>
                  </div>
                </Link>
                
                <Link
                  to="/viewings"
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 group"
                >
                  <Calendar className="w-8 h-8 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-medium text-gray-900">Quản lý lịch hẹn</h4>
                    <p className="text-sm text-gray-600">Xem lịch xem nhà</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <SellerInfoCard user={user} />
            
            {/* Package Card - Shows current package */}
            <PackageCard />
            
            <NotificationCard 
              notifications={notifications} 
              loading={loading}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModernDashboard;
