import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function SignContract() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState('');
  const [certificate, setCertificate] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Verify OTP và lấy hợp đồng
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setMessage('Vui lòng nhập mã OTP 6 số');
      return;
    }

    setVerifying(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Verify OTP trước
      const verifyResponse = await fetch(`${API_URL}/api/seller-upgrade/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        setMessage(verifyData.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
        setVerifying(false);
        return;
      }

      // Sau khi verify OTP thành công, lấy hợp đồng
      const contractResponse = await fetch(`${API_URL}/api/seller-upgrade/contract/${requestId}?otp=${otp}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contractData = await contractResponse.json();

      if (contractResponse.ok && contractData.success) {
        setContract(contractData.data.contract);
        setCertificate(contractData.data.certificate);
        setOtpVerified(true);
        setMessage('');
      } else {
        setMessage(contractData.message || 'Không thể tải thông tin hợp đồng');
      }
    } catch (error) {
      console.error('Error verifying OTP or fetching contract:', error);
      setMessage('Có lỗi xảy ra khi xác thực OTP');
    } finally {
      setVerifying(false);
    }
  };

  const handleSign = async () => {
    if (!contract || !certificate) return;
    
    setSigning(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/seller-upgrade/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contractId: contract.ContractID,
          certificateId: certificate.CertificateID
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(
          '✅ Ký hợp đồng thành công! ' +
          'Tài khoản của bạn đã được nâng cấp thành Seller. ' +
          'Nội dung hợp đồng đã ký đã được gửi đến email của bạn. ' +
          'Vui lòng kiểm tra email để lưu lại bản sao hợp đồng.'
        );
        // Reload user info to update role
        setTimeout(() => {
          localStorage.removeItem('user');
          window.location.href = '/profile';
        }, 5000); // Tăng thời gian để user đọc thông báo
      } else {
        setMessage(data.message || 'Có lỗi xảy ra khi ký hợp đồng');
      }
    } catch (error) {
      console.error('Error signing contract:', error);
      setMessage('Có lỗi xảy ra khi ký hợp đồng');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Ký hợp đồng nâng cấp Seller</h3>
            </div>
            <div className="card-body">
              {message && (
                <div className={`alert ${message.includes('thành công') ? 'alert-success' : message.includes('lỗi') || message.includes('không') ? 'alert-danger' : 'alert-info'}`}>
                  {message}
                </div>
              )}

              {!otpVerified ? (
                // Form nhập OTP
                <div>
                  <div className="alert alert-info">
                    <h5>🔐 Xác thực OTP</h5>
                    <p className="mb-0">
                      Vui lòng nhập mã OTP 6 số đã được gửi đến email của bạn để xem và ký hợp đồng.
                      Mã OTP có hiệu lực trong <strong>10 phút</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp}>
                    <div className="mb-3">
                      <label htmlFor="otp" className="form-label">
                        <strong>Mã OTP:</strong>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg text-center"
                        id="otp"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          if (message) setMessage('');
                        }}
                        placeholder="Nhập mã OTP 6 số"
                        maxLength={6}
                        autoComplete="off"
                        style={{
                          fontSize: '24px',
                          letterSpacing: '8px',
                          fontWeight: 'bold'
                        }}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={verifying || otp.length !== 6}
                      >
                        {verifying ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang xác thực...
                          </>
                        ) : (
                          'Xác thực OTP'
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/my-upgrade-requests')}
                        disabled={verifying}
                      >
                        Quay lại
                      </button>
                    </div>
                  </form>
                </div>
              ) : contract ? (
                // Hiển thị hợp đồng sau khi verify OTP thành công
                <>
                  <div className="alert alert-success">
                    <strong>✅ OTP đã được xác thực thành công!</strong> Vui lòng xem nội dung hợp đồng và ký.
                  </div>

                  <div className="mb-4">
                    <h4>Nội dung hợp đồng</h4>
                    <div className="contract-content p-3 border rounded bg-light" style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
                      {contract.ContractContent}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4>Chứng thư số</h4>
                    <div className="certificate-info p-3 border rounded">
                      <p><strong>Nhà cung cấp:</strong> {certificate?.Provider}</p>
                      <p><strong>Hiệu lực từ:</strong> {new Date(certificate?.ValidFrom).toLocaleDateString('vi-VN')}</p>
                      <p><strong>Hiệu lực đến:</strong> {new Date(certificate?.ValidTo).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleSign}
                      disabled={signing || contract.Status !== 'Sent'}
                    >
                      {signing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Đang ký hợp đồng...
                        </>
                      ) : (
                        '✍️ Ký hợp đồng'
                      )}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate('/my-upgrade-requests')}
                      disabled={signing}
                    >
                      Quay lại
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="mb-3">Không tìm thấy thông tin hợp đồng</p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/my-upgrade-requests')}
                  >
                    Quay lại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}