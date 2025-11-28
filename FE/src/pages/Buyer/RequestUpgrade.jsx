import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RequestUpgrade() {
  const [files, setFiles] = useState({
    CCCD_Front: null,
    CCCD_Back: null,
    CCCD_Selfie: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles.length > 0) {
      setFiles(prev => ({
        ...prev,
        [name]: uploadedFiles[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Kiểm tra đã upload đủ file chưa
    if (!files.CCCD_Front || !files.CCCD_Back || !files.CCCD_Selfie) {
      setMessage('Vui lòng upload đầy đủ các giấy tờ yêu cầu');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('CCCD_Front', files.CCCD_Front);
      formData.append('CCCD_Back', files.CCCD_Back);
      formData.append('CCCD_Selfie', files.CCCD_Selfie);

      const response = await fetch(`${API_URL}/api/seller-upgrade/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Gửi yêu cầu nâng cấp thành công!');
        setTimeout(() => navigate('/my-upgrade-requests'), 2000);
      } else {
        setMessage(data.message || 'Có lỗi xảy ra khi gửi yêu cầu');
      }
    } catch (error) {
      console.error('Error sending upgrade request:', error);
      setMessage('Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Yêu cầu nâng cấp tài khoản Seller</h3>
            </div>
            <div className="card-body">
              {message && (
                <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="CCCD_Front" className="form-label">CCCD - Mặt trước</label>
                  <input
                    type="file"
                    className="form-control"
                    id="CCCD_Front"
                    name="CCCD_Front"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="CCCD_Back" className="form-label">CCCD - Mặt sau</label>
                  <input
                    type="file"
                    className="form-control"
                    id="CCCD_Back"
                    name="CCCD_Back"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="CCCD_Selfie" className="form-label">Ảnh chụp cầm CCCD</label>
                  <input
                    type="file"
                    className="form-control"
                    id="CCCD_Selfie"
                    name="CCCD_Selfie"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                  <small className="form-text text-muted">
                    Vui lòng chụp ảnh bạn cầm CCCD để xác thực danh tính
                  </small>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Quay lại
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}