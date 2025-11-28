import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Eye, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Bell,
  ArrowRight,
  Plus,
  Star,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SmartLayout from '../../components/SmartLayout';
import MiniChart from '../../components/Dashboard/MiniChart';
import NotificationPanel from '../../components/Dashboard/NotificationPanel';

const NewDashboard = () => {
  const [stats, setStats] = useState({
    activePosts: 0,
    totalViews: 0,
    totalViewings: 0,
    pendingViewings: 0,
    approvedViewings: 0,
    cancelledViewings: 0
  });
  
  const [recentViewings, setRecentViewings] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    activePosts: 0,
    totalViews: 0,
    totalViewings: 0,
    pendingViewings: 0
  });

  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Animate numbers
  useEffect(() => {
    const animateNumber = (key, target) => {
      const duration = 2000;
      const steps = 60;
      const stepValue = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += stepValue;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, duration / steps);
    };

    if (!loading) {
      animateNumber('activePosts', stats.activePosts);
      animateNumber('totalViews', stats.totalViews);
      animateNumber('totalViewings', stats.totalViewings);
      animateNumber('pendingViewings', stats.pendingViewings);
    }
  }, [stats, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats from new API
      const dashboardRes = await fetch('/api/viewings/seller/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        const { stats, recentViewings, recentPosts } = dashboardData.data;

        setStats({
          activePosts: stats.activePosts,
          totalViews: stats.totalViews,
          totalViewings: stats.totalViewings,
          pendingViewings: stats.pendingViewings,
          approvedViewings: stats.confirmedViewings,
          cancelledViewings: stats.cancelledViewings
        });

        setRecentViewings(recentViewings || []);
        setRecentPosts(recentPosts || []);
      }

      // Fetch notifications separately
      const notificationsRes = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.data?.slice(0, 5) || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend, onClick }) => (
    <div 
      className={`stat-card ${color} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${
          color === 'blue' ? '#1e40af, #3b82f6' :
          color === 'green' ? '#059669, #10b981' :
          color === 'purple' ? '#7c3aed, #8b5cf6' :
          '#dc2626, #ef4444'
        })`,
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-8px) scale(1.02)';
        e.target.style.boxShadow = '0 16px 48px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0) scale(1)';
        e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <Icon size={128} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Icon size={24} />
          </div>
          {trend && (
            <div className="flex items-center text-sm font-medium">
              <TrendingUp size={16} className="mr-1" />
              {trend}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold mb-2 font-mono">
          {loading ? '...' : value.toLocaleString()}
        </div>
        <div className="text-sm opacity-90 font-medium">{title}</div>
      </div>
    </div>
  );

  const ViewingCard = ({ viewing }) => (
    <div className="viewing-timeline-item">
      <div className="flex items-start space-x-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
        <div className={`w-3 h-3 rounded-full mt-2 ${
          viewing.Status?.toLowerCase() === 'pending' ? 'bg-yellow-400' :
          viewing.Status?.toLowerCase() === 'confirmed' ? 'bg-green-400' :
          'bg-red-400'
        }`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{viewing.HouseTitle}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              viewing.Status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              viewing.Status?.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              {viewing.Status?.toLowerCase() === 'pending' ? 'Chờ duyệt' :
               viewing.Status?.toLowerCase() === 'confirmed' ? 'Đã duyệt' : 'Đã hủy'}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center">
              <Users size={14} className="mr-2" />
              {viewing.BuyerName} - {viewing.BuyerPhone}
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-2" />
              {new Date(viewing.ViewingDate).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PostCard = ({ post }) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Home size={32} className="text-gray-400" />
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.Title}</h4>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Eye size={14} className="mr-1" />
            {post.Views || 0} lượt xem
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            post.Status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {post.Status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SmartLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Seller Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Chào mừng trở lại! Quản lý bất động sản của bạn một cách thông minh</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/post/create')}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <Plus size={20} className="mr-2" />
                  Đăng tin mới
                </button>
              </div>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Home}
            title="Bài đăng hoạt động"
            value={animatedStats.activePosts}
            color="blue"
            trend="+12%"
            onClick={() => navigate('/seller/posts')}
          />
          <StatCard
            icon={Eye}
            title="Tổng lượt xem"
            value={animatedStats.totalViews}
            color="green"
            trend="+8%"
          />
          <StatCard
            icon={Calendar}
            title="Lịch xem nhà"
            value={animatedStats.totalViewings}
            color="purple"
            onClick={() => navigate('/viewings')}
          />
          <StatCard
            icon={Clock}
            title="Chờ duyệt"
            value={animatedStats.pendingViewings}
            color="red"
            onClick={() => navigate('/viewings?filter=pending')}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Recent Viewings */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Lịch xem nhà gần đây</h2>
                  <p className="text-gray-600 text-sm">Theo dõi các cuộc hẹn xem nhà</p>
                </div>
                <Link 
                  to="/viewings"
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Xem tất cả
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentViewings.length > 0 ? (
                  recentViewings.map((viewing, index) => (
                    <ViewingCard key={viewing.ViewingID || index} viewing={viewing} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch xem nhà</h3>
                    <p className="text-gray-600">Các cuộc hẹn xem nhà sẽ xuất hiện tại đây</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Bài đăng gần đây</h3>
                  <p className="text-gray-600 text-sm">3 bài đăng mới nhất của bạn</p>
                </div>
                <Link 
                  to="/posts"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Xem tất cả
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post, index) => (
                    <PostCard key={post.HouseID || index} post={post} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <Home size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 text-sm">Chưa có bài đăng nào</p>
                    <button 
                      onClick={() => navigate('/post/create')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
                    >
                      Tạo bài đăng đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            <NotificationPanel />

            {/* Analytics Mini */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Xu hướng 7 ngày</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lượt xem</span>
                  <span className="text-sm font-medium text-green-600">+12%</span>
                </div>
                <MiniChart 
                  data={[
                    { value: 45, label: 'T2' },
                    { value: 52, label: 'T3' },
                    { value: 48, label: 'T4' },
                    { value: 61, label: 'T5' },
                    { value: 55, label: 'T6' },
                    { value: 67, label: 'T7' },
                    { value: 73, label: 'CN' }
                  ]}
                  color="#3b82f6"
                />
              </div>
            </div>

            {/* Upgrade Package */}
            <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                <Star size={96} />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Nâng cấp Premium</h3>
                <p className="text-sm opacity-90 mb-4">
                  Tăng hiệu quả bán hàng với các tính năng cao cấp
                </p>
                <button 
                  onClick={() => navigate('/packages')}
                  className="bg-white text-orange-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Nâng cấp ngay
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => navigate('/post/create')}
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left"
                >
                  <Plus size={20} className="text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Đăng tin mới</span>
                </button>
                <button 
                  onClick={() => navigate('/viewings')}
                  className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left"
                >
                  <Calendar size={20} className="text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">Quản lý lịch hẹn</span>
                </button>
                <button 
                  onClick={() => navigate('/posts')}
                  className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left"
                >
                  <BarChart3 size={20} className="text-purple-600 mr-3" />
                  <span className="font-medium text-gray-900">Quản lý bài đăng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SmartLayout>
  );
};

export default NewDashboard;
