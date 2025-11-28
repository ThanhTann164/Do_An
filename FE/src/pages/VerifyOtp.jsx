import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const expiredAt = location.state?.expiredAt;
  const message = location.state?.message;
  const fromLogin = location.state?.fromLogin;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    if (expiredAt) {
      const now = new Date().getTime();
      const expiredTime = new Date(expiredAt).getTime();
      const remaining = Math.max(0, Math.floor((expiredTime - now) / 1000));
      setCountdown(remaining);
    }
  }, [email, expiredAt, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrors({ otp: 'Vui lòng nhập đầy đủ 6 chữ số OTP' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const pendingUserId = localStorage.getItem('pendingUserId');
      
      if (!pendingUserId) {
        setErrors({ general: 'Không tìm thấy thông tin người dùng. Vui lòng đăng ký lại.' });
        return;
      }

      const response = await fetch('http://localhost:3001/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingUserId,
          otp: otpValue,
          fromLogin: fromLogin || false
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Backend returns token if fromLogin is true
        if (data.token && data.user) {
          console.log('✅ Auto-login after OTP verification');
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.removeItem('pendingUserId');
          localStorage.removeItem('pendingPassword');
          
          // Dispatch event để Navbar cập nhật
          window.dispatchEvent(new Event('userChanged'));
          
          console.log('✅ OTP verified, redirecting to home...');
          
          // Sử dụng navigate thay vì window.location để tránh reload trang
          navigate('/', { replace: true });
        } else {
          // Regular registration flow - redirect to login
          localStorage.removeItem('pendingUserId');
          localStorage.removeItem('pendingPassword');
          
          navigate('/login', { 
            state: { 
              message: 'Kích hoạt tài khoản thành công! Vui lòng đăng nhập.' 
            }
          });
        }
      } else {
        setErrors({ otp: data.message || 'Xác thực thất bại' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setErrors({ general: 'Có lỗi xảy ra khi xác thực' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setErrors({});

    try {
      const pendingUserId = localStorage.getItem('pendingUserId');
      
      if (!pendingUserId) {
        setErrors({ general: 'Không tìm thấy thông tin người dùng' });
        return;
      }

      const response = await fetch('http://localhost:3001/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingUserId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Calculate new countdown from expiredAt
        if (data.expiredAt) {
          const now = new Date().getTime();
          const expiredTime = new Date(data.expiredAt).getTime();
          const remaining = Math.max(0, Math.floor((expiredTime - now) / 1000));
          setCountdown(remaining);
        } else {
          setCountdown(600); // 10 minutes default
        }
        
        setErrors({ success: 'Đã gửi lại mã OTP thành công!' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setErrors(prev => {
            const { success, ...rest } = prev;
            return rest;
          });
        }, 3000);
      } else {
        setErrors({ general: data.message || 'Gửi lại OTP thất bại' });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setErrors({ general: 'Có lỗi xảy ra khi gửi lại OTP' });
    } finally {
      setResendLoading(false);
    }
  };

  // Handle paste event for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(newOtp);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .btn-loader svg path {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
      
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#17a2b8"/>
              <path d="M12 8h8v2h-8V8zm0 4h8v2h-8v-2zm0 4h8v2h-8v-2zm-4 8h16v2H8v-2z" fill="white"/>
            </svg>
          </div>
          <h1 style={styles.title}>Xác thực OTP</h1>
          <p style={styles.subtitle}>
            {message || 'Vui lòng nhập mã OTP đã được gửi đến email của bạn'}
          </p>
          <p style={styles.email}>{email}</p>
        </div>

        {errors.general && (
          <div style={styles.errorGeneral}>{errors.general}</div>
        )}

        {errors.success && (
          <div style={styles.successMessage}>{errors.success}</div>
        )}

        <form style={styles.form} onSubmit={handleVerify}>
          <div style={styles.otpContainer} onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={e => handleOtpChange(e.target, index)}
                onKeyDown={e => handleKeyDown(e, index)}
                onFocus={e => e.target.select()}
                style={{
                  ...styles.otpInput,
                  ...(errors.otp ? styles.otpInputError : {})
                }}
                disabled={loading}
              />
            ))}
          </div>
          {errors.otp && <div style={styles.errorMessage}>{errors.otp}</div>}

          {countdown > 0 && (
            <div style={styles.countdownText}>
              Mã OTP sẽ hết hạn sau: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            <span style={styles.btnText}>
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </span>
            {loading && (
              <div style={styles.btnLoader}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                  <path d="M16 9a7 7 0 01-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </button>
        </form>

        <div style={styles.resendSection}>
          <p style={styles.resendText}>Không nhận được mã? </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading || countdown > 0}
            style={{
              ...styles.resendBtn,
              opacity: (resendLoading || countdown > 0) ? 0.7 : 1,
              cursor: (resendLoading || countdown > 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {resendLoading ? 'Đang gửi...' : countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
          </button>
        </div>

        <div style={styles.backLink}>
          <Link to="/register" style={styles.backLinkText}>
            ← Quay lại đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '480px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logo: {
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 8px 0'
  },
  subtitle: {
    color: '#666',
    margin: '0 0 16px 0',
    fontSize: '14px'
  },
  email: {
    fontWeight: 'bold',
    color: '#007bff',
    margin: 0,
    fontSize: '14px'
  },
  form: {
    width: '100%'
  },
  otpContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    margin: '20px 0'
  },
  otpInput: {
    width: '45px',
    height: '55px',
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    background: '#fff',
    transition: 'all 0.3s ease'
  },
  otpInputError: {
    borderColor: '#dc3545'
  },
  countdownText: {
    textAlign: 'center',
    color: '#666',
    fontSize: '13px',
    marginTop: '10px'
  },
  submitBtn: {
    width: '100%',
    padding: '12px 20px',
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '20px'
  },
  btnText: {
    fontSize: '14px'
  },
  btnLoader: {
    display: 'flex',
    alignItems: 'center'
  },
  resendSection: {
    textAlign: 'center',
    margin: '20px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px'
  },
  resendText: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    textDecoration: 'underline',
    fontSize: '14px'
  },
  backLink: {
    marginTop: '20px',
    textAlign: 'center'
  },
  backLinkText: {
    color: '#6c757d',
    textDecoration: 'none',
    fontSize: '14px'
  },
  errorGeneral: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  successMessage: {
    color: '#155724',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '8px'
  }
};