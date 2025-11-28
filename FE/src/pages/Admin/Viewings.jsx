import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminViewings = () => {
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
          staffName: 'Lê Văn C',
          scheduledDate: '2024-12-01',
          scheduledTime: '14:00',
          status: 'scheduled',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
        },
        {
          id: 2,
          propertyTitle: 'Villa cao cấp Thủ Đức',
          buyerName: 'Phạm Thị D',
          buyerPhone: '0907654321',
          sellerName: 'Hoàng Văn E',
          staffName: 'Nguyễn Thị F',
          scheduledDate: '2024-12-02',
          scheduledTime: '10:30',
          status: 'completed',
          address: '456 Võ Văn Ngân, Thủ Đức, TP.HCM'
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
        <p className="text-gray-600">Theo dõi và quản lý các cuộc hẹn xem nhà</p>
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

      {/* Viewings List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bất động sản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người mua
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lịch hẹn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredViewings.map((viewing) => (
                <tr key={viewing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viewing.propertyTitle}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {viewing.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viewing.buyerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {viewing.buyerPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {viewing.staffName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div>{viewing.scheduledDate}</div>
                        <div className="text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {viewing.scheduledTime}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewing.status)}`}>
                      {getStatusText(viewing.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      {viewing.status === 'scheduled' && (
                        <>
                          <button className="text-green-600 hover:text-green-900">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredViewings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lịch xem nhà</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== 'all' 
                ? 'Không tìm thấy lịch xem nhà phù hợp với bộ lọc.'
                : 'Chưa có lịch xem nhà nào được đặt.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewings;
