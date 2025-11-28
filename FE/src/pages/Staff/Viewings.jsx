import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Eye, CheckCircle, XCircle, Phone } from 'lucide-react';

const StaffViewings = () => {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchViewings();
  }, []);

  const fetchViewings = async () => {
    try {
      setLoading(true);
      // Mock data - trong thực tế sẽ gọi API
      const mockViewings = [
        {
          id: 1,
          propertyTitle: 'Căn hộ 2PN tại Quận 1',
          buyerName: 'Nguyễn Văn A',
          buyerPhone: '0901234567',
          sellerName: 'Trần Thị B',
          sellerPhone: '0907654321',
          scheduledDate: '2024-12-01',
          scheduledTime: '14:00',
          status: 'scheduled',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          notes: 'Khách hàng muốn xem vào cuối tuần'
        },
        {
          id: 2,
          propertyTitle: 'Villa cao cấp Thủ Đức',
          buyerName: 'Phạm Thị D',
          buyerPhone: '0907654321',
          sellerName: 'Hoàng Văn E',
          sellerPhone: '0908765432',
          scheduledDate: '2024-12-02',
          scheduledTime: '10:30',
          status: 'completed',
          address: '456 Võ Văn Ngân, Thủ Đức, TP.HCM',
          notes: 'Đã hoàn thành, khách hàng hài lòng'
        },
        {
          id: 3,
          propertyTitle: 'Nhà phố 3 tầng Quận 7',
          buyerName: 'Lê Văn C',
          buyerPhone: '0909876543',
          sellerName: 'Nguyễn Thị F',
          sellerPhone: '0901357924',
          scheduledDate: '2024-12-03',
          scheduledTime: '16:00',
          status: 'cancelled',
          address: '789 Nguyễn Thị Thập, Quận 7, TP.HCM',
          notes: 'Khách hàng hủy do bận việc đột xuất'
        }
      ];
      
      setTimeout(() => {
        setViewings(mockViewings);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching viewings:', error);
      setLoading(false);
    }
  };

  const filteredViewings = viewings.filter(viewing => {
    if (filter === 'all') return true;
    return viewing.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Đã lên lịch';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const handleStatusChange = async (viewingId, newStatus) => {
    try {
      // Trong thực tế sẽ gọi API để cập nhật status
      setViewings(prev => prev.map(viewing => 
        viewing.id === viewingId 
          ? { ...viewing, status: newStatus }
          : viewing
      ));
      console.log(`Updated viewing ${viewingId} to status: ${newStatus}`);
    } catch (error) {
      console.error('Error updating viewing status:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý lịch xem nhà</h1>
        <p className="text-gray-600">Theo dõi và quản lý các cuộc hẹn xem nhà được phân công</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Viewings Cards */}
      <div className="grid gap-6">
        {filteredViewings.map((viewing) => (
          <div key={viewing.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {viewing.propertyTitle}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{viewing.address}</span>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(viewing.status)}`}>
                {getStatusText(viewing.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Thời gian */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Thời gian</p>
                  <p className="text-sm text-gray-600">{viewing.scheduledDate}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {viewing.scheduledTime}
                  </p>
                </div>
              </div>

              {/* Người mua */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Người mua</p>
                  <p className="text-sm text-gray-600">{viewing.buyerName}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {viewing.buyerPhone}
                  </p>
                </div>
              </div>

              {/* Người bán */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Người bán</p>
                  <p className="text-sm text-gray-600">{viewing.sellerName}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {viewing.sellerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {viewing.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Ghi chú:</p>
                <p className="text-sm text-gray-600">{viewing.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <button className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                <Eye className="w-4 h-4 mr-1" />
                Xem chi tiết
              </button>
              
              {viewing.status === 'scheduled' && (
                <>
                  <button 
                    onClick={() => handleStatusChange(viewing.id, 'completed')}
                    className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-800 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Hoàn thành
                  </button>
                  <button 
                    onClick={() => handleStatusChange(viewing.id, 'cancelled')}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Hủy bỏ
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredViewings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lịch xem nhà</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== 'all' 
              ? 'Không tìm thấy lịch xem nhà phù hợp với bộ lọc.'
              : 'Chưa có lịch xem nhà nào được phân công.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffViewings;
