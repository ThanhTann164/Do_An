import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import '../../styles/ViewingManagement.css';

export default function ViewingManagement() {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadViewings();
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById("navbar");
      if (!nav) return;

      if (window.scrollY > 10) {
        nav.classList.add("navbar-scrolled");
      } else {
        nav.classList.remove("navbar-scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadViewings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/viewings/seller', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Seller viewings data:', data);
        setViewings(data.data || []);
      } else {
        console.error('Failed to load viewings:', response.status);
        const errorData = await response.text();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error loading viewings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (viewingId, status) => {
    const confirmMessages = {
      'approved': 'Bạn có chắc muốn duyệt lịch xem nhà này?',
      'rejected': 'Bạn có chắc muốn từ chối lịch xem nhà này?',
      'confirmed': 'Bạn có chắc muốn duyệt lịch xem nhà này?',
      'cancelled': 'Bạn có chắc muốn hủy lịch xem nhà này?'
    };

    if (!confirm(confirmMessages[status] || 'Bạn có chắc muốn thay đổi trạng thái?')) return;

    try {
      setUpdating(viewingId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/viewings/${viewingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert('Cập nhật trạng thái thành công!');
        loadViewings(); // Reload data
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Lỗi khi cập nhật trạng thái');
    } finally {
      setUpdating(null);
    }
  };

  const filteredViewings = viewings.filter(v => {
    if (filter === 'all') return true;
    return v.Status?.toLowerCase() === filter;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { class: 'warning', text: 'Chờ duyệt', icon: 'clock' },
      'confirmed': { class: 'success', text: 'Đã duyệt', icon: 'check-circle' },
      'cancelled': { class: 'danger', text: 'Đã hủy', icon: 'times-circle' },
      'completed': { class: 'info', text: 'Hoàn thành', icon: 'check-double' }
    };
    const s = statusMap[status?.toLowerCase()] || { class: 'secondary', text: status, icon: 'question' };
    return (
      <span className={`badge bg-${s.class}`}>
        <i className={`fas fa-${s.icon} me-1`}></i>
        {s.text}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCount = (status) => {
    if (status === 'all') return viewings.length;
    return viewings.filter(v => v.Status?.toLowerCase() === status).length;
  };

  return (
    <Layout>
      <div className="viewing-management-page" style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: '100vh',
        padding: '20px 0'
      }}>
        <div className="container py-5" style={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          padding: '30px',
          margin: '0 auto',
          maxWidth: '1200px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '25px',
            color: '#0F5A66',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0F5A66, #0099CC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            padding: '10px 0'
          }}>
            <i className="fas fa-calendar-check me-3" style={{color: '#0F5A66'}}></i>
            🏠 QUẢN LÝ LỊCH XEM NHÀ - GIAO DIỆN MỚI 🏠
          </h1>

          {/* Statistics - New Design */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginBottom: '25px'
          }}>
            <div style={{
              width: '260px',
              height: '90px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              background: '#0F5A66',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }} 
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
              <div>
                <h4 style={{fontSize: '28px', fontWeight: '700', margin: '0', lineHeight: '1'}}>{getStatusCount('all')}</h4>
                <p style={{fontSize: '14px', fontWeight: '600', margin: '4px 0 0 0', opacity: '0.95'}}>Tổng lịch hẹn</p>
              </div>
              <i className="fas fa-calendar" style={{fontSize: '24px', opacity: '0.9'}}></i>
            </div>
            
            <div style={{
              width: '260px',
              height: '90px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#4A3A00',
              background: '#F5CC5A',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
              <div>
                <h4 style={{fontSize: '28px', fontWeight: '700', margin: '0', lineHeight: '1', color: '#4A3A00'}}>{getStatusCount('pending')}</h4>
                <p style={{fontSize: '14px', fontWeight: '600', margin: '4px 0 0 0', opacity: '0.95', color: '#4A3A00'}}>Chờ duyệt</p>
              </div>
              <i className="fas fa-clock" style={{fontSize: '24px', opacity: '0.9', color: '#4A3A00'}}></i>
            </div>
            
            <div style={{
              width: '260px',
              height: '90px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              background: '#39A859',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
              <div>
                <h4 style={{fontSize: '28px', fontWeight: '700', margin: '0', lineHeight: '1'}}>{getStatusCount('confirmed')}</h4>
                <p style={{fontSize: '14px', fontWeight: '600', margin: '4px 0 0 0', opacity: '0.95'}}>Đã duyệt</p>
              </div>
              <i className="fas fa-check-circle" style={{fontSize: '24px', opacity: '0.9'}}></i>
            </div>
            
            <div style={{
              width: '260px',
              height: '90px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff',
              background: '#FF6B6B',
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
              <div>
                <h4 style={{fontSize: '28px', fontWeight: '700', margin: '0', lineHeight: '1'}}>{getStatusCount('cancelled')}</h4>
                <p style={{fontSize: '14px', fontWeight: '600', margin: '4px 0 0 0', opacity: '0.95'}}>Đã hủy</p>
              </div>
              <i className="fas fa-times-circle" style={{fontSize: '24px', opacity: '0.9'}}></i>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{display: 'flex', gap: '12px', marginBottom: '25px', flexWrap: 'wrap'}}>
            <button 
              style={{
                padding: '10px 22px',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: '600',
                background: filter === 'all' ? '#007BFF' : '#EAF7FF',
                color: filter === 'all' ? '#fff' : '#0F5A66',
                border: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: filter === 'all' ? '0 3px 8px rgba(0,0,0,0.15)' : 'none'
              }}
              onClick={() => setFilter('all')}
            >
              Tất cả ({getStatusCount('all')})
            </button>
            <button 
              style={{
                padding: '10px 22px',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: '600',
                background: filter === 'pending' ? '#007BFF' : '#EAF7FF',
                color: filter === 'pending' ? '#fff' : '#0F5A66',
                border: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: filter === 'pending' ? '0 3px 8px rgba(0,0,0,0.15)' : 'none'
              }}
              onClick={() => setFilter('pending')}
            >
              Chờ duyệt ({getStatusCount('pending')})
            </button>
            <button 
              style={{
                padding: '10px 22px',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: '600',
                background: filter === 'confirmed' ? '#007BFF' : '#EAF7FF',
                color: filter === 'confirmed' ? '#fff' : '#0F5A66',
                border: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: filter === 'confirmed' ? '0 3px 8px rgba(0,0,0,0.15)' : 'none'
              }}
              onClick={() => setFilter('confirmed')}
            >
              Đã duyệt ({getStatusCount('confirmed')})
            </button>
            <button 
              style={{
                padding: '10px 22px',
                borderRadius: '25px',
                fontSize: '15px',
                fontWeight: '600',
                background: filter === 'cancelled' ? '#007BFF' : '#EAF7FF',
                color: filter === 'cancelled' ? '#fff' : '#0F5A66',
                border: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: filter === 'cancelled' ? '0 3px 8px rgba(0,0,0,0.15)' : 'none'
              }}
              onClick={() => setFilter('cancelled')}
            >
              Đã hủy ({getStatusCount('cancelled')})
            </button>
          </div>

          {/* Viewings list */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3">Đang tải...</p>
            </div>
          ) : filteredViewings.length === 0 ? (
            <div style={{
              background: '#E8F9FF',
              borderLeft: '5px solid #0099CC',
              padding: '40px 18px',
              borderRadius: '10px',
              textAlign: 'center',
              margin: '30px 0'
            }}>
              <i className="fas fa-calendar-times" style={{
                fontSize: '48px',
                color: '#0099CC',
                marginBottom: '16px',
                opacity: '0.8'
              }}></i>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0F5A66',
                marginBottom: '8px'
              }}>Chưa có lịch xem nhà nào</h3>
              <p style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#0F5A66',
                opacity: '0.8',
                margin: '0'
              }}>{filter === 'all' ? 'Hiện tại chưa có lịch xem nhà nào được tạo.' : `Không có lịch xem nhà ${filter === 'pending' ? 'chờ duyệt' : filter === 'confirmed' ? 'đã duyệt' : 'đã hủy'}.`}</p>
            </div>
          ) : (
            <div className="row">
              {filteredViewings.map(viewing => (
                <div key={viewing.ViewingID} className="col-lg-6 mb-4">
                  <div className="card viewing-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          <i className="fas fa-home me-2 text-primary"></i>
                          {viewing.HouseTitle || 'N/A'}
                        </h5>
                        {getStatusBadge(viewing.Status)}
                      </div>

                      <div className="viewing-details">
                        <div className="detail-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{viewing.HouseAddress || 'N/A'}</span>
                        </div>
                        
                        {viewing.HouseCity && (
                          <div className="detail-item">
                            <i className="fas fa-city"></i>
                            <span>{viewing.HouseCity}</span>
                          </div>
                        )}
                        
                        <div className="detail-item highlight">
                          <i className="fas fa-calendar-alt"></i>
                          <span><strong>Thời gian:</strong> {formatDateTime(viewing.ViewingDate)}</span>
                        </div>
                        
                        <div className="detail-item">
                          <i className="fas fa-user"></i>
                          <span><strong>Khách hàng:</strong> {viewing.BuyerName || 'N/A'}</span>
                        </div>
                        
                        <div className="detail-item">
                          <i className="fas fa-envelope"></i>
                          <span><strong>Email:</strong> {viewing.BuyerEmail || 'N/A'}</span>
                        </div>
                        
                        {viewing.BuyerPhone && (
                          <div className="detail-item">
                            <i className="fas fa-phone"></i>
                            <span><strong>SĐT:</strong> {viewing.BuyerPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3">
                        {viewing.Status?.toLowerCase() === 'pending' && (
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-success flex-fill"
                              onClick={() => handleUpdateStatus(viewing.ViewingID, 'approved')}
                              disabled={updating === viewing.ViewingID}
                            >
                              {updating === viewing.ViewingID ? (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                              ) : (
                                <i className="fas fa-check me-2"></i>
                              )}
                              Duyệt
                            </button>
                            <button 
                              className="btn btn-danger flex-fill"
                              onClick={() => handleUpdateStatus(viewing.ViewingID, 'rejected')}
                              disabled={updating === viewing.ViewingID}
                            >
                              <i className="fas fa-times me-2"></i>Từ chối
                            </button>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <a 
                            href={`/property/${viewing.HouseID}`}
                            className="btn btn-outline-primary w-100"
                          >
                            <i className="fas fa-eye me-2"></i>Xem chi tiết nhà
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}