import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ModernAuth.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email là bắt buộc';
    if (!emailRegex.test(email)) return 'Email không hợp lệ';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Mật khẩu là bắt buộc';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    if (name === 'email') error = validateEmail(value);
    if (name === 'password') error = validatePassword(value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }

    setLoading(true);

   try {
      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
 
        const token = data.token;

        try {
          const verifyRes = await fetch(`${API_URL}/api/user`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
          });

          if (!verifyRes.ok) {
            // Token invalid on backend
            const errBody = await verifyRes.json().catch(() => ({}));
            setErrors({ password: errBody.message || 'Token không hợp lệ sau khi đăng nhập' });
            setLoading(false);
            return;
          }

          // Get user info from verify response
          const verifyData = await verifyRes.json();
          console.log('📡 [Login] Full verify response:', verifyData);
          const verifiedUser = verifyData.user || verifyData.data || {};

          console.log('✅ [Login] Verified user data:', verifiedUser);
          console.log('👤 [Login] FullName:', verifiedUser.fullName);
          console.log('👤 [Login] Display Name:', verifiedUser.display_name);
          console.log('👤 [Login] Email:', verifiedUser.email);
          console.log('🎭 [Login] Role:', verifiedUser.role);
          console.log('🎭 [Login] All keys:', Object.keys(verifiedUser));

          // Token OK: store and continue
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(verifiedUser));

          console.log('💾 [Login] Saved to localStorage');
          console.log('🔍 [Login] Verify saved - token:', localStorage.getItem('token') ? 'exists' : 'missing');
          console.log('🔍 [Login] Verify saved - user:', localStorage.getItem('user'));
          console.log('📢 [Login] Dispatching userChanged event');

          // Dispatch event để Navbar cập nhật
          window.dispatchEvent(new Event('userChanged'));

          // Redirect dựa trên role
          const userRole = verifiedUser.role || verifiedUser.Role;
          console.log('🔄 [Login] Redirecting based on role:', userRole);
          
          if (userRole === 'Admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (userRole === 'Seller') {
            navigate('/myhome', { replace: true });
          } else {
            navigate('/properties', { replace: true });
          }
        } catch (verifyErr) {
          console.error('Error verifying token after login:', verifyErr);
          setErrors({ password: 'Không thể xác thực token sau khi đăng nhập' });
          setLoading(false);
          return;
        }
      } else {
        // Check if account is not activated
        if (data.notActivated && data.userId) {
          console.log('⚠️ Account not activated, redirecting to OTP verification');
          
          // Store userId and password for later use
          localStorage.setItem('pendingUserId', data.userId);
          localStorage.setItem('pendingPassword', formData.password);
          
          navigate('/verify-otp', {
            state: {
              email: data.email || formData.email,
              expiredAt: data.expiredAt,
              message: data.message || 'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.',
              fromLogin: true
            }
          });
        } else {
          // Other errors
          setErrors({ password: data.message || 'Đăng nhập thất bại' });
        }
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrors({ password: 'Có lỗi xảy ra khi đăng nhập' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      
      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('✅ [Google Login] Response:', data);
      
      if (response.ok && data.success) {
        // Lưu token và user data
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          console.log('✅ [Google Login] User data saved:', data.user);
          console.log('👤 [Google Login] FullName:', data.user.fullName);
          console.log('🔍 [Google Login] Verify saved - token:', localStorage.getItem('token') ? 'exists' : 'missing');
        }
        
        // Dispatch event để Navbar cập nhật
        console.log('📢 [Google Login] Dispatching userChanged event');
        window.dispatchEvent(new Event('userChanged'));
        
        // Redirect dựa trên role
        const userRole = data.user.role || data.user.Role;
        console.log('🔄 [Google Login] Redirecting based on role:', userRole);
        console.log('🔍 [Google Login] Final check - token:', localStorage.getItem('token') ? 'exists' : 'missing');
        
        if (userRole === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'Seller') {
          navigate('/myhome', { replace: true });
        } else {
          navigate('/properties', { replace: true });
        }
      } else {
        setErrors({ password: data.message || 'Đăng nhập Google thất bại' });
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      setErrors({ password: 'Có lỗi xảy ra khi đăng nhập với Google' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({ password: 'Đăng nhập Google thất bại. Vui lòng thử lại.' });
  };

  return (
    <div className="modern-auth-container">
      <div className="modern-auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#007bff"/>
              <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h10v2H8v-2z" fill="white"/>
            </svg>
          </div>
          <h1>Đăng nhập vào tài khoản</h1>
          <p>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            />
            <label htmlFor="email">Địa chỉ Email</label>
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
              autoComplete="current-password"
              placeholder=" "
            />
            <label htmlFor="password">Mật khẩu</label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              <svg className="eye-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3C4.5 3 1.6 5.6 1 8c.6 2.4 3.5 5 7 5s6.4-2.6 7-5c-.6-2.4-3.5-5-7-5zm0 8.5A3.5 3.5 0 118 4.5a3.5 3.5 0 010 7zm0-5.5a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/>
              </svg>
            </button>
            <span className="input-border"></span>
            {errors.password && <span className="error-message show">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input type="checkbox" id="remember" name="remember" />
              <span className="checkmark">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Ghi nhớ đăng nhập
            </label>
            <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            <span className="btn-text">{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
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

        <div className="divider">
          <span>hoặc tiếp tục với</span>
        </div>

        <div className="social-buttons">
          <div className="google-oauth-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="continue_with"
              size="large"
              width="380"
              logo_alignment="left"
            />
          </div>
        </div>

        <div className="signup-link">
          <span>Chưa có tài khoản? </span>
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}