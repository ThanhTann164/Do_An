import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 [Users] Loading users with token:', !!token);
      
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 [Users] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Users] Data received:', data);
        
        const usersArray = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data)
          ? data
          : [];
        setUsers(usersArray);
        setTotalUsers(
          data?.total ?? data?.pagination?.total ?? usersArray.length
        );
      } else {
        const errorData = await response.json();
        console.error('❌ [Users] Error response:', errorData);
      }
    } catch (error) {
      console.error('❌ [Users] Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const url = `/api/admin/users?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const usersArray = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data)
          ? data
          : [];
        setUsers(usersArray);
        setTotalUsers(
          data?.total ?? data?.pagination?.total ?? usersArray.length
        );
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (user) => {
    if (user.Role === 'Seller') {
      alert('User này đã là Seller.');
      return;
    }

    const confirmed = window.confirm(`Duyệt ${user.Username || user.Email} trở thành Seller?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${user.UserID}/approve-seller`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Approved via admin panel' })
      });

      const result = await response.json();

      if (response.ok && result?.success) {
        alert(`Đã duyệt ${user.Username || user.Email} trở thành Seller!`);
        loadUsers();
      } else {
        alert(result?.message || 'Có lỗi xảy ra khi duyệt user');
      }
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Có lỗi xảy ra khi duyệt user trở thành Seller');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Xóa user thành công!');
        loadUsers();
      } else {
        alert('Có lỗi xảy ra khi xóa user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa user');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'bg-danger';
      case 'Seller': return 'bg-success';
      case 'Buyer': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Active' ? 'bg-success' : 'bg-secondary';
  };

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1 className="page-title">Quản lý Users</h1>
        <div className="user-actions">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span id="current-user">Admin</span>
          </div>
          <a href="/" className="btn btn-outline-primary btn-sm">
            <i className="fas fa-eye"></i> Xem trang chủ
          </a>
          <a href="/logout" className="logout-btn">
            <i className="fas fa-sign-out-alt"></i> Đăng xuất
          </a>
        </div>
      </header>

      <div className="admin-content">
        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm user theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
          />
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả Role</option>
            <option value="Admin">Admin</option>
            <option value="Seller">Seller</option>
            <option value="Buyer">Buyer</option>
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className="search-btn" onClick={searchUsers}>
            <i className="fas fa-search"></i> Tìm kiếm
          </button>
          <button className="btn btn-secondary" onClick={loadUsers}>
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Danh sách Users</h3>
            <div>
              <span className="badge bg-primary me-2">Tổng: {totalUsers}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={loadUsers}>
                <i className="fas fa-sync-alt"></i> Làm mới
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                      </div>
                      <p>Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      Không có user nào
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.UserID}>
                      <td>{user.UserID}</td>
                      <td>{user.Username}</td>
                      <td>{user.Email}</td>
                      <td>{user.PhoneNumber || user.Phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(user.Role)}`}>
                          {user.Role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(user.Status)}`}>
                          {user.Status}
                        </span>
                      </td>
                      <td>{new Date(user.CreatedAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button
                          className="btn-action btn-info"
                          onClick={() => window.location.href = `/admin/users/${user.UserID}`}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {user.Role === 'Buyer' && (
                          <button
                            className="btn-action btn-success"
                            onClick={() => handleApproveSeller(user)}
                            title="Duyệt thành Seller"
                          >
                            <i className="fas fa-user-check"></i>
                          </button>
                        )}
                        <button
                          className="btn-action btn-danger"
                          onClick={() => handleDeleteUser(user.UserID)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

