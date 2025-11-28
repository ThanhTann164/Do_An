import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 [Posts] Loading posts with token:', !!token);
      
      const response = await fetch('/api/admin/posts', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 [Posts] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [Posts] Data received:', data);
        
        const postsPayload = data?.data?.posts;
        const fallback = data?.data;
        const postsArray = Array.isArray(postsPayload)
          ? postsPayload
          : Array.isArray(fallback)
          ? fallback
          : Array.isArray(data)
          ? data
          : [];

        setPosts(postsArray);
        setTotalPosts(data?.data?.total ?? postsArray.length);
      } else {
        const errorData = await response.json();
        console.error('❌ [Posts] Error response:', errorData);
        setPosts([]);
        setTotalPosts(0);
      }
    } catch (error) {
      console.error('❌ [Posts] Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      // Backend supports `keyword` and `status`
      if (searchQuery) params.append('keyword', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const url = `/api/admin/posts?${params.toString()}`;
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const postsPayload = data?.data?.posts;
        const fallback = data?.data;
        const postsArray = Array.isArray(postsPayload)
          ? postsPayload
          : Array.isArray(fallback)
          ? fallback
          : Array.isArray(data)
          ? data
          : [];

        setPosts(postsArray);
        setTotalPosts(data?.data?.total ?? postsArray.length);
      } else {
        setPosts([]);
        setTotalPosts(0);
      }
    } catch (error) {
      console.error('Error searching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Duyệt bài đăng thành công!');
        loadPosts();
      } else {
        alert('Có lỗi xảy ra khi duyệt bài đăng');
      }
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Có lỗi xảy ra khi duyệt bài đăng');
    }
  };

  const handleRejectPost = async (postId) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/posts/${postId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason }),
        credentials: 'include'
      });

      if (response.ok) {
        alert('Từ chối bài đăng thành công!');
        loadPosts();
      } else {
        alert('Có lỗi xảy ra khi từ chối bài đăng');
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert('Có lỗi xảy ra khi từ chối bài đăng');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Xóa bài đăng thành công!');
        loadPosts();
      } else {
        alert('Có lỗi xảy ra khi xóa bài đăng');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Có lỗi xảy ra khi xóa bài đăng');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Available': return 'badge bg-success';
      case 'Pending': return 'badge bg-warning';
      case 'Rejected': return 'badge bg-danger';
      case 'Sold': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1 className="page-title">Quản lý Post</h1>
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
            placeholder="Tìm theo tiêu đề, người đăng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchPosts()}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Available">Đã duyệt</option>
            <option value="Rejected">Từ chối</option>
          </select>
          <button className="search-btn" onClick={searchPosts}>
            <i className="fas fa-search"></i> Tìm kiếm
          </button>
          <button className="btn btn-secondary" onClick={loadPosts}>
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>

        {/* Posts Table */}
        <div className="admin-table-container">
          <div className="admin-table-header">
            <h3>Danh sách Post</h3>
            <div>
              <span className="badge bg-primary me-2">Tổng: {totalPosts}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={loadPosts}>
                <i className="fas fa-sync-alt"></i> Làm mới
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Người đăng</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="loading-spinner">
                        <div className="spinner"></div>
                      </div>
                      <p>Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      Không có bài đăng nào
                    </td>
                  </tr>
                ) : (
                  (Array.isArray(posts) ? posts : []).map((post) => (
                    <tr key={post.HouseID}>
                      <td>{post.HouseID}</td>
                      <td>{post.Title || 'N/A'}</td>
                      <td>{post.seller?.name || 'N/A'}</td>
                      <td>{formatPrice(post.Price)}</td>
                      <td>
                        <span className={getStatusBadgeClass(post.Status)}>
                          {post.Status}
                        </span>
                      </td>
                      <td>{new Date(post.CreatedAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button
                          className="btn-action btn-info"
                          onClick={() => window.location.href = `/property/${post.HouseID}`}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {post.Status === 'Pending' && (
                          <>
                            <button
                              className="btn-action btn-success"
                              onClick={() => handleApprovePost(post.HouseID)}
                              title="Duyệt"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn-action btn-warning"
                              onClick={() => handleRejectPost(post.HouseID)}
                              title="Từ chối"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        <button
                          className="btn-action btn-danger"
                          onClick={() => handleDeletePost(post.HouseID)}
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

