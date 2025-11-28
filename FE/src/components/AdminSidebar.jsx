import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdminSidebar() {
  const location = useLocation();
  const [adminName, setAdminName] = useState('Đang tải...');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:3001/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.data || data.user;
        setAdminName(user.fullName || user.display_name || user.username || 'Admin');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h3><i className="fas fa-cogs"></i> Admin Panel</h3>
        <div className="admin-info">
          <div id="admin-name">{adminName}</div>
          <small>Quản trị viên</small>
        </div>
      </div>
      <nav className="sidebar-menu">
        <Link 
          to="/admin/dashboard" 
          className={`menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
        >
          <i className="fas fa-tachometer-alt"></i> Dashboard
        </Link>
        
        <Link 
          to="/admin/users" 
          className={`menu-item ${isActive('/admin/users') ? 'active' : ''}`}
        >
          <i className="fas fa-users"></i> Quản lý Users
        </Link>
        
        <Link 
          to="/admin/posts" 
          className={`menu-item ${isActive('/admin/posts') ? 'active' : ''}`}
        >
          <i className="fas fa-newspaper"></i> Quản lý Posts
        </Link>
        
        <Link 
          to="/admin/seller-requests" 
          className={`menu-item ${isActive('/admin/seller-requests') ? 'active' : ''}`}
        >
          <i className="fas fa-user-tie"></i> Yêu cầu Seller
        </Link>
        
        <Link 
          to="/admin/analytics" 
          className={`menu-item ${isActive('/admin/analytics') ? 'active' : ''}`}
        >
          <i className="fas fa-chart-line"></i> Phân tích
        </Link>
        
        <Link 
          to="/admin/activities" 
          className={`menu-item ${isActive('/admin/activities') ? 'active' : ''}`}
        >
          <i className="fas fa-history"></i> Hoạt động
        </Link>
        
        <Link 
          to="/admin/notifications" 
          className={`menu-item ${isActive('/admin/notifications') ? 'active' : ''}`}
        >
          <i className="fas fa-bell"></i> Quản lý thông báo
        </Link>
        
        <Link 
          to="/admin/notifications/send" 
          className={`menu-item ${isActive('/admin/notifications/send') ? 'active' : ''}`}
        >
          <i className="fas fa-paper-plane"></i> Gửi thông báo
        </Link>
        
        <Link 
          to="/" 
          className="menu-item"
        >
          <i className="fas fa-home"></i> Về trang chủ
        </Link>
        
        <a 
          href="#" 
          className="menu-item text-danger"
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              
              // Dispatch event để Navbar cập nhật
              window.dispatchEvent(new Event('userChanged'));
              
              window.location.href = '/login';
            }
          }}
        >
          <i className="fas fa-sign-out-alt"></i> Đăng xuất
        </a>
      </nav>
    </aside>
  );
}

