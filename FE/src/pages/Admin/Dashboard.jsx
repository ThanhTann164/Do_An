import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    potentialSellers: 0,
    // Package stats
    freeUsers: 0,
    proUsers: 0,
    premiumUsers: 0,
    packageRevenue: 0,
    aiUsage: 0,
    boostUsage: 0,
    highlightedPosts: 0,
    panoramaPosts: 0,
    bannerAds: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [chartData, setChartData] = useState({
    userStats: null,
    propertyStats: null,
    revenueStats: null
  });

  useEffect(() => {
    loadDashboardData();
    loadRecentActivities();
    loadChartData();
    const interval = setInterval(() => {
      loadDashboardData();
      loadRecentActivities();
      loadChartData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 [Dashboard] Token exists:', !!token);
      
      if (!token) {
        console.error('❌ [Dashboard] No token found');
        return;
      }

      console.log('📡 [Dashboard] Fetching data from API...');
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      console.log('📡 [Dashboard] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Dashboard] Data received:', data);
        setDashboardData(data.data || {});
        if (data.user) {
          setCurrentUser(data.user.fullName || data.user.display_name || 'Admin');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ [Dashboard] Error response:', errorData);
      }
    } catch (error) {
      console.error('❌ [Dashboard] Error loading dashboard data:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/admin/activity/recent', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.data.activities || []);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  const loadChartData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Load user stats
      const userStatsResponse = await fetch('http://localhost:3001/api/admin/stats/users', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      // Load property stats
      const propertyStatsResponse = await fetch('http://localhost:3001/api/admin/stats/properties', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      // Load revenue stats
      const revenueStatsResponse = await fetch('http://localhost:3001/api/admin/stats/revenue', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (userStatsResponse.ok && propertyStatsResponse.ok && revenueStatsResponse.ok) {
        const userStats = await userStatsResponse.json();
        const propertyStats = await propertyStatsResponse.json();
        const revenueStats = await revenueStatsResponse.json();

        setChartData({
          userStats: userStats.data,
          propertyStats: propertyStats.data,
          revenueStats: revenueStats.data
        });
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Chart configurations
  const getLineChartData = () => {
    if (!chartData.revenueStats) return null;
    
    const labels = chartData.revenueStats.revenuePerMonth.map(item => `T${item.month}/${item.year}`);
    const data = chartData.revenueStats.revenuePerMonth.map(item => item.revenue / 1000000); // Convert to millions
    
    return {
      labels,
      datasets: [
        {
          label: 'Doanh thu (Triệu VND)',
          data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
      ],
    };
  };

  const getBarChartData = () => {
    if (!chartData.userStats) return null;
    
    const labels = chartData.userStats.userPerMonth.map(item => `T${item.month}/${item.year}`);
    const data = chartData.userStats.userPerMonth.map(item => item.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Người dùng mới',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getPieChartData = () => {
    if (!chartData.userStats) return null;
    
    return {
      labels: ['Buyers', 'Sellers', 'Admins'],
      datasets: [
        {
          data: [
            chartData.userStats.totalBuyers,
            chartData.userStats.totalSellers,
            chartData.userStats.totalAdmins,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="user-actions">
          <div className="user-info">
            <span id="current-user">{currentUser}</span>
            <i className="fas fa-user-circle"></i>
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Enhanced Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-details">
              <h3 id="total-users">{formatNumber(dashboardData.totalUsers || 0)}</h3>
              <p>Tổng Users</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-success"></i>
                <span className="text-success">+12%</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-info">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.totalBuyers || 0)}</h3>
              <p>Buyers</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-success"></i>
                <span className="text-success">+8%</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-success">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.totalSellers || 0)}</h3>
              <p>Sellers</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-success"></i>
                <span className="text-success">+15%</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-secondary">
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.totalAdmins || 0)}</h3>
              <p>Admins</p>
              <div className="stat-trend">
                <i className="fas fa-minus text-muted"></i>
                <span className="text-muted">0%</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-warning">
              <i className="fas fa-home"></i>
            </div>
            <div className="stat-details">
              <h3 id="total-products">{formatNumber(dashboardData.totalProducts || 0)}</h3>
              <p>Tổng Properties</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-success"></i>
                <span className="text-success">+22%</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-danger">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="stat-details">
              <h3 id="total-orders">{formatNumber(dashboardData.totalOrders || 0)}</h3>
              <p>Tổng Orders</p>
              <div className="stat-trend">
                <i className="fas fa-minus text-muted"></i>
                <span className="text-muted">N/A</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-success">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-details">
              <h3 id="total-revenue">{formatCurrency(dashboardData.revenue || 0)}</h3>
              <p>Doanh thu</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-success"></i>
                <span className="text-success">+18%</span>
              </div>
            </div>
          </div>

          {/* Package Stats */}
          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-secondary">
              <i className="fas fa-gift"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.freeUsers || 0)}</h3>
              <p>FREE Users</p>
              <div className="stat-trend">
                <i className="fas fa-users text-muted"></i>
                <span className="text-muted">Miễn phí</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-primary">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.proUsers || 0)}</h3>
              <p>PRO Users</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-info"></i>
                <span className="text-info">⚡ PRO</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-warning">
              <i className="fas fa-crown"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.premiumUsers || 0)}</h3>
              <p>PREMIUM Users</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-warning"></i>
                <span className="text-warning">👑 PREMIUM</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-info">
              <i className="fas fa-robot"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.aiUsage || 0)}</h3>
              <p>AI Usage</p>
              <div className="stat-trend">
                <i className="fas fa-brain text-info"></i>
                <span className="text-info">Lượt dùng</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-success">
              <i className="fas fa-rocket"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.boostUsage || 0)}</h3>
              <p>Boost Usage</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-success"></i>
                <span className="text-success">Lượt boost</span>
              </div>
            </div>
          </div>

          <div className="stat-card enhanced-card">
            <div className="stat-icon bg-gradient-primary">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="stat-details">
              <h3>{formatNumber(dashboardData.potentialSellers || 0)}</h3>
              <p>Potential Sellers</p>
              <div className="stat-trend">
                <i className="fas fa-arrow-up text-success"></i>
                <span className="text-success">+8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts */}
        <div className="row mt-4">
          <div className="col-md-8">
            <div className="card enhanced-chart-card">
              <div className="card-header">
                <h5><i className="fas fa-chart-line me-2"></i>Biểu đồ doanh thu</h5>
              </div>
              <div className="card-body">
                {getLineChartData() ? (
                  <Line data={getLineChartData()} options={chartOptions} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card enhanced-chart-card">
              <div className="card-header">
                <h5><i className="fas fa-chart-pie me-2"></i>Phân bố User</h5>
              </div>
              <div className="card-body">
                {getPieChartData() ? (
                  <Pie data={getPieChartData()} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card enhanced-chart-card">
              <div className="card-header">
                <h5><i className="fas fa-chart-bar me-2"></i>Tăng trưởng người dùng</h5>
              </div>
              <div className="card-body">
                {getBarChartData() ? (
                  <Bar data={getBarChartData()} options={chartOptions} />
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activities */}
        <div className="card mt-4 enhanced-table-card">
          <div className="card-header">
            <h5><i className="fas fa-history me-2"></i>Hoạt động gần đây</h5>
            <small className="text-muted">20 hoạt động mới nhất từ hệ thống</small>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover enhanced-table">
                <thead>
                  <tr>
                    <th><i className="fas fa-clock me-1"></i>Thời gian</th>
                    <th><i className="fas fa-user me-1"></i>User</th>
                    <th><i className="fas fa-tasks me-1"></i>Hành động</th>
                    <th><i className="fas fa-check-circle me-1"></i>Trạng thái</th>
                  </tr>
                </thead>
                <tbody id="recent-activities">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <tr key={activity.id || index} className="activity-row">
                        <td>
                          <span className="timestamp">
                            {new Date(activity.timestamp).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </td>
                        <td>
                          <div className="user-info">
                            <i className="fas fa-user-circle me-2 text-primary"></i>
                            <span className="user-name">{activity.user_name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="action-text">{activity.action}</span>
                          {activity.type && (
                            <small className="d-block text-muted">
                              <i className="fas fa-tag me-1"></i>
                              {activity.type.replace('_', ' ')}
                            </small>
                          )}
                        </td>
                        <td>
                          <span className={`badge enhanced-badge ${
                            activity.status === 'Success' 
                              ? 'bg-success' 
                              : activity.status === 'Failed'
                              ? 'bg-danger'
                              : 'bg-warning'
                          }`}>
                            <i className={`fas ${
                              activity.status === 'Success' 
                                ? 'fa-check' 
                                : activity.status === 'Failed'
                                ? 'fa-times'
                                : 'fa-clock'
                            } me-1`}></i>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-5">
                        <i className="fas fa-inbox fa-3x mb-3 text-muted"></i>
                        <p className="mb-0">Không có hoạt động gần đây</p>
                        <small>Hệ thống sẽ tự động cập nhật khi có hoạt động mới</small>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

