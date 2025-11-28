import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationCard = ({ notifications = [], loading = false }) => {
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg animate-pulse">
              <div className="w-4 h-4 bg-gray-200 rounded-full mt-1"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-[#00A884]" />
          <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
        </div>
        <Link 
          to="/notifications" 
          className="flex items-center text-[#00A884] hover:text-[#007a65] text-sm font-medium transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <div 
              key={notification.id || index} 
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-sm ${
                notification.read 
                  ? 'border-gray-100 bg-gray-50' 
                  : 'border-[#00A884]/20 bg-[#00A884]/5'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${
                  notification.read ? 'text-gray-700' : 'text-gray-900'
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${
                  notification.read ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>

              {!notification.read && (
                <div className="w-2 h-2 bg-[#00A884] rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h4>
            <p className="text-gray-500">Các thông báo mới sẽ xuất hiện tại đây</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
