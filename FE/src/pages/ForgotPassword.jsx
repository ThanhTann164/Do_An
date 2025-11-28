import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        alert('Đã gửi email hướng dẫn đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.');
      } else {
        alert(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      alert('Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body text-center p-5">
                <i className="fas fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                <h3 className="mt-3">Email đã được gửi!</h3>
                <p className="text-muted">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                </p>
                <Link to="/login" className="btn btn-primary">
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Quên mật khẩu</h3>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2"></i>Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Nhập địa chỉ email của bạn"
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi email đặt lại mật khẩu'
                    )}
                  </button>
                  
                  <Link to="/login" className="btn btn-secondary">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

