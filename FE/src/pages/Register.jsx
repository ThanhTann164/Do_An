import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ModernAuth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateFullName = (name) => {
    if (!name) return 'Họ tên là bắt buộc';
    if (name.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email là bắt buộc';
    if (!emailRegex.test(email)) return 'Email không hợp lệ';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Mật khẩu là bắt buộc';
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường';
    if (!/[0-9]/.test(password)) return 'Mật khẩu phải có ít nhất 1 số';
    return '';
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return 'Vui lòng xác nhận mật khẩu';
    if (confirmPassword !== formData.password) return 'Mật khẩu xác nhận không khớp';
    return '';
  };

  const validatePhone = (phone) => {
    if (phone && !/^\d{10,11}$/.test(phone)) {
      return 'Số điện thoại phải có 10-11 chữ số';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    
    if (name === 'fullName') error = validateFullName(value);
    else if (name === 'email') error = validateEmail(value);
    else if (name === 'password') error = validatePassword(value);
    else if (name === 'confirmPassword') error = validateConfirmPassword(value);
    else if (name === 'phone') error = validatePhone(value);
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullNameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    const phoneError = validatePhone(formData.phone);

    if (fullNameError || emailError || passwordError || confirmPasswordError || phoneError) {
      setErrors({
        fullName: fullNameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        phone: phoneError
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔄 Đang gửi request đăng ký...', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });
      
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        })
      });

      console.log('📊 Response status:', response.status);

      const responseText = await response.text();
      console.log('📊 Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Lỗi parse JSON:', parseError);
        setErrors({ 
          general: 'Server trả về response không hợp lệ' 
        });
        return;
      }

      if (response.ok && data.success) {
        console.log('✅ Đăng ký thành công:', data);
        localStorage.setItem('pendingUserId', data.userId);
        
        navigate('/verify-otp', { 
          state: { 
            email: data.email,
            expiredAt: data.expiredAt,
            message: data.message || 'Đăng ký thành công! Vui lòng xác thực OTP.'
          }
        });
      } else {
        console.log('❌ Đăng ký thất bại:', data.message);
        // Xử lý trường hợp user đã tồn tại nhưng chưa active
        if (data.alreadyRegistered) {
          localStorage.setItem('pendingUserId', data.userId);
          navigate('/verify-otp', { 
            state: { 
              email: data.email,
              expiredAt: data.expiredAt,
              message: data.message
            }
          });
        } else {
          setErrors({ 
            email: data.message || `Lỗi server: ${response.status}` 
          });
        }
      }
    } catch (error) {
      console.error('💥 Lỗi kết nối:', error);
      setErrors({ 
        general: `Lỗi kết nối: ${error.message}. Kiểm tra xem server đã chạy chưa?` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-container">
      <div className="modern-auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#28a745"/>
              <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h10v2H8v-2z" fill="white"/>
            </svg>
          </div>
          <h1>Tạo tài khoản mới</h1>
          <p>Đăng ký để bắt đầu sử dụng dịch vụ của chúng tôi</p>
        </div>

        {errors.general && (
          <div className="error-message show" style={{ 
            marginBottom: '20px', 
            textAlign: 'center',
            background: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '5px'
          }}>
            {errors.general}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className={`input-group ${errors.fullName ? 'error' : ''}`}>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="fullName">Họ và tên *</label>
            <span className="input-border"></span>
            {errors.fullName && <span className="error-message show">{errors.fullName}</span>}
          </div>

          <div className={`input-group ${errors.email ? 'error' : ''}`}>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="email"
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="email">Địa chỉ Email *</label>
            <span className="input-border"></span>
            {errors.email && <span className="error-message show">{errors.email}</span>}
          </div>

          <div className={`input-group ${errors.password ? 'error' : ''}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="password">Mật khẩu *</label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              disabled={loading}
            >
              <svg className="eye-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3C4.5 3 1.6 5.6 1 8c.6 2.4 3.5 5 7 5s6.4-2.6 7-5c-.6-2.4-3.5-5-7-5zm0 8.5A3.5 3.5 0 118 4.5a3.5 3.5 0 010 7zm0-5.5a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/>
              </svg>
            </button>
            <span className="input-border"></span>
            {errors.password && <span className="error-message show">{errors.password}</span>}
          </div>

          <div className={`input-group ${errors.confirmPassword ? 'error' : ''}`}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle password visibility"
              disabled={loading}
            >
              <svg className="eye-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3C4.5 3 1.6 5.6 1 8c.6 2.4 3.5 5 7 5s6.4-2.6 7-5c-.6-2.4-3.5-5-7-5zm0 8.5A3.5 3.5 0 118 4.5a3.5 3.5 0 010 7zm0-5.5a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/>
              </svg>
            </button>
            <span className="input-border"></span>
            {errors.confirmPassword && <span className="error-message show">{errors.confirmPassword}</span>}
          </div>

          <div className={`input-group ${errors.phone ? 'error' : ''}`}>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder=" "
              disabled={loading}
            />
            <label htmlFor="phone">Số điện thoại</label>
            <span className="input-border"></span>
            {errors.phone && <span className="error-message show">{errors.phone}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading} 
            style={{ background: '#28a745', opacity: loading ? 0.7 : 1 }}
          >
            <span className="btn-text">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </span>
            {loading && (
              <div className="btn-loader">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity="0.25"/>
                  <path d="M16 9a7 7 0 01-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" dur="1s" values="0 9 9;360 9 9" repeatCount="indefinite"/>
                  </path>
                </svg>
              </div>
            )}
          </button>
        </form>

        <div className="signup-link">
          <span>Đã có tài khoản? </span>
          <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}