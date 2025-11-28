import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    topSellers: [],
    popularProducts: [],
    userGrowth: ''
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data || {});
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1 className="page-title">Phân tích & Thống kê</h1>
      </header>

      <div className="admin-content">
        <div className="row">
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <h6 className="text-muted">Tổng doanh thu</h6>
                <h3 className="text-success">{formatCurrency(analytics.totalRevenue)}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <h6 className="text-muted">Tăng trưởng User</h6>
                <h3 className="text-primary">{analytics.userGrowth}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <h6 className="text-muted">Top Sellers</h6>
                <h3 className="text-info">{analytics.topSellers?.length || 0}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <h6 className="text-muted">Sản phẩm phổ biến</h6>
                <h3 className="text-warning">{analytics.popularProducts?.length || 0}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Top Sellers</h5>
              </div>
              <div className="card-body">
                <ul className="list-group">
                  {analytics.topSellers && analytics.topSellers.length > 0 ? (
                    analytics.topSellers.map((seller, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {seller}
                        <span className="badge bg-primary rounded-pill">{index + 1}</span>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted">Chưa có dữ liệu</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Sản phẩm phổ biến</h5>
              </div>
              <div className="card-body">
                <ul className="list-group">
                  {analytics.popularProducts && analytics.popularProducts.length > 0 ? (
                    analytics.popularProducts.map((product, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {product}
                        <span className="badge bg-success rounded-pill">{index + 1}</span>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted">Chưa có dữ liệu</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

