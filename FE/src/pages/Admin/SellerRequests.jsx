import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function SellerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/seller-upgrade/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const requestsData = (data.data || data.requests || []).map(req => ({
          ...req,
          UserName: req.Buyer?.FullName || 'N/A',
          UserEmail: req.Buyer?.Email || 'N/A'
        }));
        setRequests(requestsData);
      }
    } catch (error) {
      console.error('Error loading seller requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/seller-upgrade/request/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const requestData = data.data || data;
        
        // Fetch images through proxy and convert to blob URLs
        const documentsWithBlobs = await Promise.all(
          (requestData.userdocuments || []).map(async (doc) => {
            const fileId = doc.FilePath?.match(/\/d\/([^/]+)/)?.[1];
            if (fileId) {
              try {
                const imgResponse = await fetch(`http://localhost:3001/api/seller-upgrade/image/${fileId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (imgResponse.ok) {
                  const blob = await imgResponse.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  return { ...doc, blobUrl };
                }
              } catch (err) {
                console.error('Error loading image:', err);
              }
            }
            return doc;
          })
        );
        
        setSelectedRequest({
          ...requestData,
          userdocuments: documentsWithBlobs,
          UserName: requestData.Buyer?.FullName || 'N/A',
          UserEmail: requestData.Buyer?.Email || 'N/A'
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error loading request details:', error);
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) return;

    try {
      const token = localStorage.getItem('token');
      
      // Tạo nội dung hợp đồng mặc định
      const contractContent = `
        HỢP ĐỒNG NÂNG CẤP TÀI KHOẢN SELLER
        
        Điều 1: Bên A đồng ý nâng cấp tài khoản lên Seller
        Điều 2: Bên A cam kết tuân thủ các quy định của nền tảng
        Điều 3: Hợp đồng có hiệu lực kể từ ngày ký
        
        Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}
        Request ID: ${requestId}
      `;
      
      const response = await fetch('http://localhost:3001/api/seller-upgrade/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, contractContent })
      });

      if (response.ok) {
        alert('Duyệt yêu cầu thành công!');
        setShowModal(false);
        loadRequests();
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Có lỗi xảy ra khi duyệt yêu cầu');
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/seller-upgrade/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, reason })
      });

      if (response.ok) {
        alert('Đã từ chối yêu cầu');
        setShowModal(false);
        loadRequests();
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Có lỗi xảy ra khi từ chối yêu cầu');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': { class: 'warning', text: 'Chờ duyệt' },
      'Approved': { class: 'success', text: 'Đã duyệt' },
      'Rejected': { class: 'danger', text: 'Từ chối' },
      'ContractSigned': { class: 'info', text: 'Đã ký HĐ' }
    };
    const badge = statusMap[status] || { class: 'secondary', text: status };
    return <span className={`badge bg-${badge.class}`}>{badge.text}</span>;
  };

  // Get document blob URL by type
  const getDocumentUrl = (documents, type) => {
    const doc = documents?.find(d => d.DocumentType === type);
    return doc?.blobUrl || null;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <header className="admin-header">
        <h1 className="page-title">Yêu cầu nâng cấp Seller</h1>
      </header>

      <div className="admin-content">
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length > 0 ? (
                    requests.map((request) => (
                      <tr key={request.RequestID}>
                        <td>{request.RequestID}</td>
                        <td>{request.UserName || 'N/A'}</td>
                        <td>{request.UserEmail || 'N/A'}</td>
                        <td>{new Date(request.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td>{getStatusBadge(request.Status)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleViewDetails(request.RequestID)}
                          >
                            <i className="fas fa-eye"></i> Xem
                          </button>
                          {request.Status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApprove(request.RequestID)}
                              >
                                <i className="fas fa-check"></i> Duyệt
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleReject(request.RequestID)}
                              >
                                <i className="fas fa-times"></i> Từ chối
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">
                        Không có yêu cầu nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết */}
      {showModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết yêu cầu #{selectedRequest.RequestID}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <p><strong>User:</strong> {selectedRequest.UserName}</p>
                    <p><strong>Email:</strong> {selectedRequest.UserEmail}</p>
                    <p><strong>Trạng thái:</strong> {getStatusBadge(selectedRequest.Status)}</p>
                    <p><strong>Ngày gửi:</strong> {new Date(selectedRequest.CreatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                
                <div className="row">
                  {getDocumentUrl(selectedRequest.userdocuments, 'CCCD_Front') && (
                    <div className="col-md-4 mb-3">
                      <strong>CCCD Mặt trước:</strong>
                      <div className="border rounded p-2 mt-2" style={{ minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                        <img 
                          src={getDocumentUrl(selectedRequest.userdocuments, 'CCCD_Front')} 
                          alt="CCCD Front" 
                          className="img-fluid rounded"
                          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EKhông load được ảnh%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {getDocumentUrl(selectedRequest.userdocuments, 'CCCD_Back') && (
                    <div className="col-md-4 mb-3">
                      <strong>CCCD Mặt sau:</strong>
                      <div className="border rounded p-2 mt-2" style={{ minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                        <img 
                          src={getDocumentUrl(selectedRequest.userdocuments, 'CCCD_Back')} 
                          alt="CCCD Back" 
                          className="img-fluid rounded"
                          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EKhông load được ảnh%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {getDocumentUrl(selectedRequest.userdocuments, 'CCCD_Selfie') && (
                    <div className="col-md-4 mb-3">
                      <strong>CCCD Selfie:</strong>
                      <div className="border rounded p-2 mt-2" style={{ minHeight: '200px', backgroundColor: '#f8f9fa' }}>
                        <img 
                          src={getDocumentUrl(selectedRequest.userdocuments, 'CCCD_Selfie')} 
                          alt="CCCD Selfie" 
                          className="img-fluid rounded"
                          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EKhông load được ảnh%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Show raw links for debugging */}
                {selectedRequest.userdocuments && selectedRequest.userdocuments.length > 0 && (
                  <div className="mt-3">
                    <details>
                      <summary className="text-muted" style={{ cursor: 'pointer' }}>
                        <small>Xem links gốc (debug)</small>
                      </summary>
                      <div className="mt-2">
                        {selectedRequest.userdocuments.map((doc, idx) => (
                          <div key={idx} className="mb-2">
                            <small><strong>{doc.DocumentType}:</strong></small><br/>
                            <small className="text-break">
                              <a href={doc.FilePath} target="_blank" rel="noopener noreferrer">
                                {doc.FilePath}
                              </a>
                            </small>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {selectedRequest.Status === 'Pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedRequest.RequestID)}
                    >
                      <i className="fas fa-check"></i> Duyệt
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(selectedRequest.RequestID)}
                    >
                      <i className="fas fa-times"></i> Từ chối
                    </button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

