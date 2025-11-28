import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Calendar,
  AlertCircle,
  Download
} from 'lucide-react';

const ProductionIdentityVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      // Mock data - trong thực tế sẽ gọi API
      const mockVerifications = [
        {
          id: 1,
          userId: 101,
          userName: 'Nguyễn Văn A',
          userEmail: 'nguyenvana@email.com',
          submittedAt: '2024-11-25T10:30:00Z',
          status: 'pending',
          documents: {
            idCard: {
              front: '/uploads/id-front-1.jpg',
              back: '/uploads/id-back-1.jpg'
            },
            selfie: '/uploads/selfie-1.jpg',
            businessLicense: '/uploads/business-1.pdf'
          },
          personalInfo: {
            fullName: 'Nguyễn Văn A',
            idNumber: '123456789012',
            dateOfBirth: '1990-05-15',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
          },
          businessInfo: {
            companyName: 'Công ty BDS ABC',
            taxCode: '0123456789',
            businessAddress: '456 Lê Lợi, Quận 1, TP.HCM'
          }
        },
        {
          id: 2,
          userId: 102,
          userName: 'Trần Thị B',
          userEmail: 'tranthib@email.com',
          submittedAt: '2024-11-24T14:20:00Z',
          status: 'approved',
          documents: {
            idCard: {
              front: '/uploads/id-front-2.jpg',
              back: '/uploads/id-back-2.jpg'
            },
            selfie: '/uploads/selfie-2.jpg'
          },
          personalInfo: {
            fullName: 'Trần Thị B',
            idNumber: '987654321098',
            dateOfBirth: '1985-08-20',
            address: '789 Điện Biên Phủ, Quận 3, TP.HCM'
          }
        },
        {
          id: 3,
          userId: 103,
          userName: 'Lê Văn C',
          userEmail: 'levanc@email.com',
          submittedAt: '2024-11-23T09:15:00Z',
          status: 'rejected',
          documents: {
            idCard: {
              front: '/uploads/id-front-3.jpg',
              back: '/uploads/id-back-3.jpg'
            },
            selfie: '/uploads/selfie-3.jpg'
          },
          personalInfo: {
            fullName: 'Lê Văn C',
            idNumber: '456789123456',
            dateOfBirth: '1992-12-10',
            address: '321 Võ Văn Tần, Quận 3, TP.HCM'
          },
          rejectionReason: 'Ảnh CMND không rõ nét, cần chụp lại'
        }
      ];
      
      setTimeout(() => {
        setVerifications(mockVerifications);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      setLoading(false);
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    if (filter === 'all') return true;
    return verification.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  const handleApprove = async (verificationId) => {
    try {
      setVerifications(prev => prev.map(verification => 
        verification.id === verificationId 
          ? { ...verification, status: 'approved' }
          : verification
      ));
      console.log(`Approved verification ${verificationId}`);
    } catch (error) {
      console.error('Error approving verification:', error);
    }
  };

  const handleReject = async (verificationId, reason) => {
    try {
      setVerifications(prev => prev.map(verification => 
        verification.id === verificationId 
          ? { ...verification, status: 'rejected', rejectionReason: reason }
          : verification
      ));
      console.log(`Rejected verification ${verificationId}: ${reason}`);
    } catch (error) {
      console.error('Error rejecting verification:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Xác minh danh tính</h1>
        <p className="text-gray-600">Duyệt các yêu cầu xác minh danh tính từ người dùng</p>
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
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Verifications List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin cá nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày gửi
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
              {filteredVerifications.map((verification) => (
                <tr key={verification.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {verification.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {verification.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div>CMND: {verification.personalInfo.idNumber}</div>
                      <div className="text-gray-500">
                        Sinh: {new Date(verification.personalInfo.dateOfBirth).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(verification.submittedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(verification.status)}`}>
                      {getStatusText(verification.status)}
                    </span>
                    {verification.status === 'rejected' && verification.rejectionReason && (
                      <div className="mt-1 text-xs text-red-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {verification.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedVerification(verification)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {verification.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(verification.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(verification.id, 'Cần bổ sung thông tin')}
                            className="text-red-600 hover:text-red-900"
                          >
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

        {filteredVerifications.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu xác minh</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== 'all' 
                ? 'Không tìm thấy yêu cầu phù hợp với bộ lọc.'
                : 'Chưa có yêu cầu xác minh danh tính nào.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Chi tiết xác minh danh tính
                </h2>
                <button 
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin cá nhân */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thông tin cá nhân</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Họ tên:</label>
                      <p className="text-sm text-gray-900">{selectedVerification.personalInfo.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Số CMND:</label>
                      <p className="text-sm text-gray-900">{selectedVerification.personalInfo.idNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Ngày sinh:</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedVerification.personalInfo.dateOfBirth).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Địa chỉ:</label>
                      <p className="text-sm text-gray-900">{selectedVerification.personalInfo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Tài liệu */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tài liệu đính kèm</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">CMND mặt trước:</label>
                      <div className="mt-1">
                        <button className="flex items-center text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4 mr-1" />
                          Tải xuống
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">CMND mặt sau:</label>
                      <div className="mt-1">
                        <button className="flex items-center text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4 mr-1" />
                          Tải xuống
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Ảnh selfie:</label>
                      <div className="mt-1">
                        <button className="flex items-center text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4 mr-1" />
                          Tải xuống
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedVerification.status === 'pending' && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button 
                    onClick={() => {
                      handleReject(selectedVerification.id, 'Cần bổ sung thông tin');
                      setSelectedVerification(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Từ chối
                  </button>
                  <button 
                    onClick={() => {
                      handleApprove(selectedVerification.id);
                      setSelectedVerification(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Duyệt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionIdentityVerification;
