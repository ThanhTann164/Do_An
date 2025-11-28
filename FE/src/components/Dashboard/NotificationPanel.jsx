import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Eye,
  EyeOff
} from 'lucide-react';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, important

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/notifications/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/notifications/read/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'viewing':
        return <Calendar size={16} className="text-blue-500" />;
      case 'approval':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <Info size={16} className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'important') return notif.priority === 'high';
    return true;
  });

  const NotificationItem = ({ notification }) => (
    <div 
      className={`p-4 border-l-4 rounded-lg transition-all duration-300 ${
        notification.isRead 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-blue-50 border-blue-400 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-medium ${
              notification.isRead ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h4>
            <p className={`text-sm mt-1 ${
              notification.isRead ? 'text-gray-500' : 'text-gray-600'
            }`}>
              {notification.message}
            </p>
            <div className="flex items-center mt-2 text-xs text-gray-400">
              <span>{new Date(notification.createdAt).toLocaleString('vi-VN')}</span>
              {notification.priority === 'high' && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full">
                  Quan trọng
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!notification.isRead && (
            <button
              onClick={() => markAsRead(notification.id)}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title="Đánh dấu đã đọc"
            >
              <Eye size={14} />
            </button>
          )}
          <button
            onClick={() => deleteNotification(notification.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Xóa thông báo"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          {[1,2,3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell size={20} className="text-gray-700" />
          <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="unread">Chưa đọc</option>
            <option value="important">Quan trọng</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => (
            <NotificationItem key={notification.id || index} notification={notification} />
          ))
        ) : (
          <div className="text-center py-8">
            <Bell size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 text-sm">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' :
               filter === 'important' ? 'Không có thông báo quan trọng' :
               'Chưa có thông báo nào'}
            </p>
          </div>
        )}
      </div>

      {filteredNotifications.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;

