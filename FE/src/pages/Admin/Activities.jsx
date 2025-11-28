import React, { useState, useEffect } from 'react';
import { Activity, User, Home, Eye, MessageSquare, Calendar } from 'lucide-react';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // Mock data - trong thực tế sẽ gọi API
      const mockActivities = [
        {
          id: 1,
          type: 'user_register',
          user: 'Nguyễn Văn A',
          description: 'Đăng ký tài khoản mới',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          details: 'Email: nguyenvana@email.com'
        },
        {
          id: 2,
          type: 'house_posted',
          user: 'Trần Thị B',
          description: 'Đăng tin bán căn hộ 2PN tại Quận 1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          details: 'Giá: 3.5 tỷ VND'
        },
        {
          id: 3,
          type: 'viewing_scheduled',
          user: 'Lê Văn C',
          description: 'Đặt lịch xem nhà Villa cao cấp',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          details: 'Thời gian: 14:00 ngày 01/12/2024'
        },
        {
          id: 4,
          type: 'message_sent',
          user: 'Phạm Thị D',
          description: 'Gửi tin nhắn cho người bán',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          details: 'Về căn hộ tại Thủ Đức'
        },
        {
          id: 5,
          type: 'house_viewed',
          user: 'Hoàng Văn E',
          description: 'Xem chi tiết bất động sản',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          details: 'Villa 3 tầng tại Quận 7'
        }
      ];
      
      setTimeout(() => {
        setActivities(mockActivities);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_register': return <User className="w-5 h-5 text-blue-500" />;
      case 'house_posted': return <Home className="w-5 h-5 text-green-500" />;
      case 'viewing_scheduled': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'message_sent': return <MessageSquare className="w-5 h-5 text-orange-500" />;
      case 'house_viewed': return <Eye className="w-5 h-5 text-gray-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_register': return 'bg-blue-50 border-blue-200';
      case 'house_posted': return 'bg-green-50 border-green-200';
      case 'viewing_scheduled': return 'bg-purple-50 border-purple-200';
      case 'message_sent': return 'bg-orange-50 border-orange-200';
      case 'house_viewed': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoạt động hệ thống</h1>
        <p className="text-gray-600">Theo dõi các hoạt động gần đây trên nền tảng</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả hoạt động</option>
            <option value="user_register">Đăng ký người dùng</option>
            <option value="house_posted">Đăng tin bất động sản</option>
            <option value="viewing_scheduled">Lịch xem nhà</option>
            <option value="message_sent">Tin nhắn</option>
            <option value="house_viewed">Xem bất động sản</option>
          </select>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredActivities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== filteredActivities.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex space-x-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span> {activity.description}
                          </p>
                          {activity.details && (
                            <p className="text-sm text-gray-500 mt-1">{activity.details}</p>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          {formatTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có hoạt động</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== 'all' 
                ? 'Không tìm thấy hoạt động phù hợp với bộ lọc.'
                : 'Chưa có hoạt động nào được ghi nhận.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;