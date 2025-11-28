import React, { useState, useEffect } from 'react';
import { Send, Users, User, Bell, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const SendNotification = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
    sendTo: 'all',
    userId: null
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/api/notifications/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || data.users || []);
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'userId') {
      // Khi chọn user, tự động cập nhật sendTo
      const newUserId = value === 'null' ? null : value;
      const newSendTo = value === 'null' ? 'all' : 'specific';
      
      console.log('👤 User selection changed:', {
        value,
        newUserId,
        newSendTo
      });
      
      setFormData(prev => ({
        ...prev,
        userId: newUserId,
        sendTo: newSendTo
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value === 'null' ? null : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form data:', formData);
    console.log('📝 Form validation check:');
    console.log('  - Title:', formData.title);
    console.log('  - Message:', formData.message);
    console.log('  - SendTo:', formData.sendTo);
    console.log('  - UserId:', formData.userId);
    
    if (!formData.title || !formData.title.trim()) {
      console.error('❌ Validation failed: Empty title');
      toast.error('Vui lòng nhập tiêu đề thông báo');
      return;
    }
    
    if (!formData.message || !formData.message.trim()) {
      console.error('❌ Validation failed: Empty message');
      toast.error('Vui lòng nhập nội dung thông báo');
      return;
    }
    
    if (formData.sendTo === 'specific' && (!formData.userId || formData.userId === 'null')) {
      console.error('❌ Validation failed: No user selected for specific notification');
      console.error('  - sendTo:', formData.sendTo);
      console.error('  - userId:', formData.userId);
      toast.error('Vui lòng chọn người dùng để gửi thông báo');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔑 Token check:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      
      if (!token) {
        toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
        return;
      }
      
      // Chọn API endpoint dựa trên sendTo
      const endpoint = formData.sendTo === 'all' 
        ? 'http://localhost:3001/api/notifications/broadcast'
        : 'http://localhost:3001/api/notifications/send';
      
      const requestBody = formData.sendTo === 'all' 
        ? {
            title: formData.title.trim(),
            message: formData.message.trim(),
            type: formData.type,
            sendTo: 'all'
          }
        : {
            userId: parseInt(formData.userId),
            title: formData.title.trim(),
            message: formData.message.trim(),
            type: 'custom'
          };
      
      // Validate request body
      if (formData.sendTo === 'specific') {
        if (!formData.userId || isNaN(parseInt(formData.userId))) {
          toast.error('Vui lòng chọn người dùng hợp lệ');
          return;
        }
      }
      
      console.log('📡 Sending to:', endpoint);
      console.log('📦 Request body:', requestBody);
      console.log('🔐 Auth header:', `Bearer ${token.substring(0, 20)}...`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📡 Response data:', data);

      if (response.ok && data.success) {
        toast.success(data.message || 'Gửi thông báo thành công!');
        console.log('✅ Notification sent successfully!');
        setFormData({
          title: '',
          message: '',
          type: 'system',
          sendTo: 'all',
          userId: null
        });
      } else {
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        toast.error(data.message || `Lỗi ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      toast.error(`Lỗi kết nối: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <Send className="me-2" size={20} />
                Gửi Thông Báo
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    {/* Title Input */}
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">
                        <Bell className="me-1" size={16} />
                        Tiêu đề thông báo *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Nhập tiêu đề thông báo..."
                        required
                        maxLength={255}
                        autoComplete="off"
                      />
                      <div className="form-text">
                        {formData.title.length}/255 ký tự
                      </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">
                        <AlertCircle className="me-1" size={16} />
                        Nội dung thông báo *
                      </label>
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Nhập nội dung thông báo..."
                        required
                        autoComplete="off"
                      />
                      <div className="form-text">
                        {formData.message.length} ký tự
                      </div>
                    </div>

                    {/* Type Selection */}
                    <div className="mb-3">
                      <label htmlFor="type" className="form-label">
                        <AlertCircle className="me-1" size={16} />
                        Loại thông báo
                      </label>
                      <select
                        className="form-select"
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        disabled={formData.sendTo === 'specific'}
                      >
                        <option value="system">🔧 Hệ thống</option>
                        <option value="promotion">🎁 Khuyến mãi</option>
                        <option value="maintenance">⚠️ Bảo trì</option>
                      </select>
                      {formData.sendTo === 'specific' && (
                        <div className="form-text text-muted">
                          Thông báo cá nhân sẽ tự động được đặt loại "custom"
                        </div>
                      )}
                    </div>

                    {/* Target Selection */}
                    <div className="mb-4">
                      <label htmlFor="userId" className="form-label">
                        <Users className="me-1" size={16} />
                        Người nhận
                      </label>
                      <select
                        className="form-select"
                        id="userId"
                        name="userId"
                        value={formData.userId || 'null'}
                        onChange={handleInputChange}
                      >
                        <option value="null">
                          📢 Gửi toàn hệ thống (tất cả người dùng)
                        </option>
                        {loadingUsers ? (
                          <option disabled>Đang tải danh sách người dùng...</option>
                        ) : (
                          users.map(user => (
                            <option key={user.id} value={user.id}>
                              👤 {user.name} ({user.email}) - {user.role}
                            </option>
                          ))
                        )}
                      </select>
                      <div className="form-text">
                        {formData.sendTo === 'all' ? (
                          <span className="text-info">
                            📢 Thông báo sẽ được gửi cho <strong>tất cả người dùng</strong> trong hệ thống
                          </span>
                        ) : (
                          <span className="text-warning">
                            👤 Thông báo sẽ được gửi cho <strong>1 người dùng cụ thể</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !formData.title.trim() || !formData.message.trim()}
                      >
                        {loading ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="me-2" size={16} />
                            Gửi thông báo
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setFormData({ title: '', message: '', type: 'system', sendTo: 'all', userId: null })}
                        disabled={loading}
                      >
                        Xóa form
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => {
                          setFormData({
                            title: '🧪 Test từ Admin Form',
                            message: `Test notification từ admin form - ${new Date().toLocaleString('vi-VN')}`,
                            type: 'system',
                            sendTo: 'all',
                            userId: null
                          });
                        }}
                        disabled={loading}
                      >
                        Điền test data
                      </button>
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Preview Card */}
                    <div className="card bg-light">
                      <div className="card-header">
                        <h6 className="mb-0">👀 Xem trước thông báo</h6>
                      </div>
                      <div className="card-body">
                        {formData.title || formData.message ? (
                          <div className="notification-preview">
                            <div className="d-flex align-items-start">
                              <div className="notification-icon me-3">
                                <Bell className="text-primary" size={20} />
                              </div>
                              <div className="notification-content flex-grow-1">
                                <h6 className="mb-1">
                                  {formData.title || 'Tiêu đề thông báo'}
                                  <span className="badge bg-primary ms-2">Mới</span>
                                </h6>
                                <p className="mb-2 text-muted small">
                                  {formData.message || 'Nội dung thông báo sẽ hiển thị ở đây...'}
                                </p>
                                <small className="text-muted">
                                  <i className="fas fa-clock me-1"></i>
                                  Vừa xong
                                </small>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted text-center">
                            Nhập nội dung để xem trước
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats Card */}
                    <div className="card mt-3">
                      <div className="card-body">
                        <h6>📊 Thống kê</h6>
                        <div className="small text-muted">
                          <div className="d-flex justify-content-between">
                            <span>Tổng người dùng:</span>
                            <strong>{users.length}</strong>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span>Người nhận:</span>
                            <strong>
                              {formData.userId ? '1 người' : `${users.length} người`}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNotification;