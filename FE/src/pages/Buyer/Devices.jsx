import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndDevices();
  }, []);

  const loadUserAndDevices = async () => {
    try {
      // Load user info
      const userResponse = await fetch('/api/user', { credentials: 'include' });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.data || userData.user);
      }

      // Load devices
      const devicesResponse = await fetch('/api/devices', { credentials: 'include' });
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData.data || devicesData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'on':
        return 'bg-success';
      case 'inactive':
      case 'off':
        return 'bg-secondary';
      default:
        return 'bg-warning';
    }
  };

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">
                <i className="fas fa-microchip me-3"></i>IoT Devices
              </h1>
              <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="200">
               
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Đang tải danh sách thiết bị...</p>
            </div>
          ) : (
            <>
              <div className="row mb-4">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <h2 className="heading text-primary">Danh sách Thiết bị IoT</h2>
                    {user?.role === 'Seller' && (
                      <Link to="/devices/add" className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>Thêm thiết bị
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="row">
                {devices.length === 0 ? (
                  <div className="col-12 text-center text-muted py-5">
                    <i className="fas fa-microchip fa-3x mb-3"></i>
                    <p>Không có thiết bị nào</p>
                  </div>
                ) : (
                  devices.map((device) => (
                    <div key={device.DeviceID} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h5 className="card-title text-primary">
                              <i className="fas fa-microchip me-2"></i>
                              {device.DeviceName}
                            </h5>
                            <span className={`badge ${getStatusBadgeClass(device.Status)}`}>
                              {device.Status}
                            </span>
                          </div>
                          
                          <p className="card-text text-muted small mb-3">
                            <strong>Device ID:</strong> {device.DeviceID}
                          </p>
                          
                          <div className="mb-3">
                            <p className="mb-1"><strong>Loại:</strong> {device.DeviceType}</p>
                            <p className="mb-1"><strong>Nhà:</strong> {device.house?.Address || 'N/A'}</p>
                          </div>

                          <div className="d-grid">
                            <Link 
                              to={`/device/${device.DeviceID}`} 
                              className="btn btn-outline-primary"
                            >
                              <i className="fas fa-eye me-2"></i>Xem chi tiết
                            </Link>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent text-muted small">
                          <i className="far fa-clock me-1"></i>
                          Cập nhật: {new Date(device.UpdatedAt || device.CreatedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

