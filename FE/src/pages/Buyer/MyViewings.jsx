import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import '../../styles/MyViewings.css';

export default function MyViewings() {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected, completed

  useEffect(() => {
    loadMyViewings();
  }, []);

  const loadMyViewings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/viewings/my-viewings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('My viewings data:', data);
        setViewings(data.data || []);
      } else {
        console.error('Failed to load viewings:', response.status);
      }
    } catch (error) {
      console.error('Error loading viewings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelViewing = async (viewingId) => {
    if (!confirm('Bạn có chắc muốn hủy lịch xem nhà này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/viewings/${viewingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Đã hủy lịch xem nhà');
        loadMyViewings();
      } else {
        alert('Không thể hủy lịch xem nhà');
      }
    } catch (error) {
      console.error('Error canceling viewing:', error);
      alert('Lỗi khi hủy lịch xem nhà');
    }
  };

  const filteredViewings = viewings.filter(v => {
    if (filter === 'all') return true;
    return v.Status?.toLowerCase() === filter;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { class: 'warning', text: 'Chờ duyệt', icon: 'clock' },
      'approved': { class: 'success', text: 'Đã duyệt', icon: 'check-circle' },
      'rejected': { class: 'danger', text: 'Từ chối', icon: 'times-circle' },
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

  return (
    <Layout>
      <div className="my-viewings-page">
        <div className="container py-5">
          <h1 className="mb-4">
            <i className="fas fa-calendar-check me-3"></i>
            Lịch xem nhà của tôi
          </h1>

          {/* Filter tabs */}
          <ul className="nav nav-pills mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <i className="fas fa-list me-2"></i>
                Tất cả ({viewings.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                <i className="fas fa-clock me-2"></i>
                Chờ duyệt ({viewings.filter(v => v.Status?.toLowerCase() === 'pending').length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'approved' ? 'active' : ''}`}
                onClick={() => setFilter('approved')}
              >
                <i className="fas fa-check-circle me-2"></i>
                Đã duyệt ({viewings.filter(v => v.Status?.toLowerCase() === 'approved').length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                <i className="fas fa-check-double me-2"></i>
                Hoàn thành ({viewings.filter(v => v.Status?.toLowerCase() === 'completed').length})
              </button>
            </li>
          </ul>

          {/* Viewings list */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3">Đang tải...</p>
            </div>
          ) : filteredViewings.length === 0 ? (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Bạn chưa đặt lịch xem nhà nào
            </div>
          ) : (
            <div className="row">
              {filteredViewings.map(viewing => (
                <div key={viewing.ViewingID} className="col-lg-6 mb-4">
                  <div className="card my-viewing-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          <i className="fas fa-home me-2 text-primary"></i>
                          {viewing.House?.Title || viewing.house?.Title || 'N/A'}
                        </h5>
                        {getStatusBadge(viewing.Status)}
                      </div>

                      <div className="viewing-details">
                        <div className="detail-item">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{viewing.House?.Address || viewing.house?.Address || 'N/A'}</span>
                        </div>
                        
                        {viewing.House?.City && (
                          <div className="detail-item">
                            <i className="fas fa-city"></i>
                            <span>{viewing.House.City}</span>
                          </div>
                        )}
                        
                        <div className="detail-item highlight">
                          <i className="fas fa-calendar-alt"></i>
                          <span><strong>Thời gian:</strong> {formatDateTime(viewing.ViewingDate)}</span>
                        </div>
                        

                      </div>

                      <div className="mt-3 d-flex gap-2">
                        <a 
                          href={`/property/${viewing.HouseID}`}
                          className="btn btn-outline-primary flex-fill"
                        >
                          <i className="fas fa-eye me-2"></i>Xem nhà
                        </a>
                        
                        {(viewing.Status?.toLowerCase() === 'pending' || viewing.Status === 'PENDING') && (
                          <button 
                            className="btn btn-outline-danger flex-fill"
                            onClick={() => handleCancelViewing(viewing.ViewingID)}
                          >
                            <i className="fas fa-times me-2"></i>Hủy lịch
                          </button>
                        )}
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
