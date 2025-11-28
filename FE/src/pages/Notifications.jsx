import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
    // Kết nối WebSocket để nhận thông báo realtime
    const token = localStorage.getItem('token');
    if (token) {
      import('../services/websocket').then(({ default: websocketService }) => {
        if (!websocketService.isConnected()) {
          websocketService.connect(token);
        }
        
        const handleNewNotification = (notification) => {
          console.log('🔔 New notification received on page:', notification);
          setNotifications(prev => [notification, ...prev]);
        };

        websocketService.on('new_notification', handleNewNotification);

        return () => {
          websocketService.off('new_notification', handleNewNotification);
        };
      });
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('📡 Fetching notifications from API...');
      const response = await fetch('http://localhost:3001/api/notifications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📡 API Response data:', data);
        setNotifications(data.data || data.notifications || []);
        setError(null);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Không thể tải thông báo');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/notifications/read/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).fromNow();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'package':
        return 'fas fa-box';
      case 'payment':
        return 'fas fa-credit-card';
      case 'house':
        return 'fas fa-home';
      case 'viewing':
        return 'fas fa-eye';
      case 'system':
        return 'fas fa-cog';
      default:
        return 'fas fa-bell';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Đang tải thông báo...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_3.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center">
              <h1 className="heading text-white">Thông báo</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Thông báo của tôi</h2>
                <button 
                  className="btn btn-outline-primary"
                  onClick={fetchNotifications}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Làm mới
                </button>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {notifications.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Không có thông báo nào</h5>
                  <p className="text-muted">Các thông báo mới sẽ xuất hiện ở đây</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id || notification.NotificationID}
                      className={`notification-item p-4 mb-3 border rounded ${
                        !notification.isRead && !notification.IsRead ? 'border-primary bg-light' : 'border-light'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => markAsRead(notification.id || notification.NotificationID)}
                    >
                      <div className="d-flex align-items-start">
                        <div className="notification-icon me-3">
                          <i 
                            className={`${getNotificationIcon(notification.type || notification.Type)} fa-lg ${
                              !notification.isRead && !notification.IsRead ? 'text-primary' : 'text-muted'
                            }`}
                          ></i>
                        </div>
                        <div className="notification-content flex-grow-1">
                          <h6 className="mb-1">
                            {notification.title || notification.Title}
                            {(!notification.isRead && !notification.IsRead) && (
                              <span className="badge bg-primary ms-2">Mới</span>
                            )}
                          </h6>
                          <p className="mb-2 text-muted">
                            {notification.message || notification.Message}
                          </p>
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {formatDate(notification.createdAt || notification.CreatedAt)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
