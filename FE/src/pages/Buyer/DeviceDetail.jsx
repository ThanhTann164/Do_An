import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function DeviceDetail() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState(false);

  useEffect(() => {
    loadDeviceDetail();
    const interval = setInterval(loadDeviceDetail, 5000); // Auto refresh every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  const loadDeviceDetail = async () => {
    try {
      const response = await fetch(`/api/devices/${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDevice(data.data || data);
      }
    } catch (error) {
      console.error('Error loading device detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleControl = async (action) => {
    setControlLoading(true);
    try {
      const response = await fetch(`/api/devices/${id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
        credentials: 'include'
      });

      if (response.ok) {
        alert(`Đã gửi lệnh ${action} thành công!`);
        loadDeviceDetail();
      } else {
        alert('Có lỗi xảy ra khi điều khiển thiết bị');
      }
    } catch (error) {
      console.error('Error controlling device:', error);
      alert('Có lỗi xảy ra khi điều khiển thiết bị');
    } finally {
      setControlLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải thông tin thiết bị...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!device) {
    return (
      <Layout>
        <div className="container py-5">
          <div className="alert alert-warning text-center">
            Không tìm thấy thiết bị
          </div>
          <div className="text-center">
            <Link to="/devices" className="btn btn-primary">Quay lại danh sách</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'on':
        return 'success';
      case 'inactive':
      case 'off':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">
                <i className="fas fa-microchip me-3"></i>{device.DeviceName}
              </h1>
              <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="200">
               
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                      <i className="fas fa-microchip me-2"></i>
                      {device.DeviceName}
                    </h4>
                    <span className={`badge bg-${getStatusColor(device.Status)}`}>
                      {device.Status}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p><strong>Device ID:</strong> {device.DeviceID}</p>
                      <p><strong>Loại thiết bị:</strong> {device.DeviceType}</p>
                      <p><strong>Địa chỉ nhà:</strong> {device.house?.Address || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Trạng thái:</strong> 
                        <span className={`badge bg-${getStatusColor(device.Status)} ms-2`}>
                          {device.Status}
                        </span>
                      </p>
                      <p><strong>Ngày tạo:</strong> {new Date(device.CreatedAt).toLocaleString('vi-VN')}</p>
                      <p><strong>Cập nhật lần cuối:</strong> {new Date(device.UpdatedAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>

                  <hr />

                  <h5 className="mb-3">Điều khiển thiết bị</h5>
                  <div className="d-flex gap-2 justify-content-center mb-4">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={() => handleControl('ON')}
                      disabled={controlLoading || device.Status === 'Active'}
                    >
                      <i className="fas fa-power-off me-2"></i>Bật
                    </button>
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={() => handleControl('OFF')}
                      disabled={controlLoading || device.Status === 'Inactive'}
                    >
                      <i className="fas fa-power-off me-2"></i>Tắt
                    </button>
                  </div>

                  {controlLoading && (
                    <div className="text-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span>Đang xử lý...</span>
                    </div>
                  )}

                  <hr />

                  <h5 className="mb-3">Thông tin nhà</h5>
                  {device.house ? (
                    <div>
                      <p><strong>Địa chỉ:</strong> {device.house.Address}</p>
                      <p><strong>Thành phố:</strong> {device.house.City}</p>
                      <Link 
                        to={`/property/${device.house.HouseID}`} 
                        className="btn btn-outline-primary"
                      >
                        <i className="fas fa-home me-2"></i>Xem thông tin nhà
                      </Link>
                    </div>
                  ) : (
                    <p className="text-muted">Chưa liên kết với nhà nào</p>
                  )}
                </div>
                <div className="card-footer">
                  <Link to="/devices" className="btn btn-secondary">
                    <i className="fas fa-arrow-left me-2"></i>Quay lại danh sách
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

