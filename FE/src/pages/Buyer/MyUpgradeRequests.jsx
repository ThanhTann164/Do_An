import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyUpgradeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    checkUserRole();
    fetchMyRequests();
  }, []);

  const checkUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.Role);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/seller-upgrade/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // The backend returns the buyer's requests (SellerUpgradeService.getMyRequests)
        // The model uses `BuyerID` and Sequelize timestamps use `createdAt`.
        // Use the array returned by the server directly and avoid filtering by a non-existent `UserID` property.
        const requestsArray = Array.isArray(data.data) ? data.data : [];
        setRequests(requestsArray);
      } else {
        setError(data.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning';
      case 'Approved':
        return 'bg-success';
      case 'Rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Đang chờ duyệt';
      case 'Approved':
        return 'Đã duyệt';
      case 'Rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const handleViewContract = (requestId) => {
    navigate(`/sign-contract/${requestId}`);
  };

  // Kiểm tra xem có yêu cầu đang Pending hoặc Approved không
  const hasActiveRequest = requests.some(req => 
    req.Status === 'Pending' || req.Status === 'Approved'
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (role && role !== 'Buyer') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger mt-4">Chỉ tài khoản Buyer mới có thể truy cập trang này</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0">Yêu cầu nâng cấp tài khoản của tôi</h3>
              {/* Chỉ hiện nút gửi yêu cầu mới nếu chưa có request đang active */}
              {!hasActiveRequest && (
                <button 
                  className="btn btn-light" 
                  onClick={() => navigate('/request-upgrade')}
                >
                  + Gửi yêu cầu mới
                </button>
              )}
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}

              <div className="alert alert-info">
                <h5>📋 Quy trình nâng cấp:</h5>
                <ol className="mb-0">
                  <li>Gửi yêu cầu nâng cấp kèm giấy tờ CCCD</li>
                  <li>Chờ Admin duyệt yêu cầu</li>
                  <li>Sau khi được duyệt, ký hợp đồng điện tử</li>
                  <li>Hoàn tất - Tài khoản được nâng cấp lên Seller</li>
                </ol>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mb-3">Bạn chưa có yêu cầu nâng cấp nào</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/request-upgrade')}
                  >
                    Gửi yêu cầu nâng cấp
                  </button>
                </div>
              ) : (
                <>
                  {/* Thông báo nếu đã có request đang active */}
                  {hasActiveRequest && (
                    <div className="alert alert-warning">
                      <strong>Lưu ý:</strong> Bạn đang có yêu cầu nâng cấp đang được xử lý. Bạn không thể gửi yêu cầu mới cho đến khi yêu cầu hiện tại được hoàn tất hoặc bị từ chối.
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Ngày gửi</th>
                          <th>Trạng thái</th>
                          <th>Ghi chú</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => (
                          <tr key={request.RequestID}>
                            <td>
                              {new Date(request.CreatedAt || request.createdAt || request.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(request.Status)}`}>
                                {getStatusText(request.Status)}
                              </span>
                            </td>
                            <td>{request.Message || '-'}</td>
                            <td>
                              {request.Status === 'Pending' && (
                                <span className="text-muted">⏳ Đang chờ xét duyệt...</span>
                              )}
                              {request.Status === 'Approved' && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleViewContract(request.RequestID)}
                                >
                                  ✍️ Ký hợp đồng
                                </button>
                              )}
                              {request.Status === 'Rejected' && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => navigate('/request-upgrade')}
                                >
                                  📝 Gửi lại yêu cầu
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}