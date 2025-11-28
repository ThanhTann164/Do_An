import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import '../styles/change-password.css';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return '';
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;

    if (score < 3) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
  };

  // Real-time validation
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'currentPassword':
        if (!value.trim()) {
          newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        } else {
          delete newErrors.currentPassword;
        }
        break;

      case 'newPassword':
        if (!value) {
          newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (value.length < 8) {
          newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.newPassword = 'Mật khẩu phải có chữ hoa, chữ thường và số';
        } else {
          delete newErrors.newPassword;
        }
        
        // Check if confirm password still matches
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (value !== formData.newPassword) {
          newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);

    // Update password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const isCurrentValid = validateField('currentPassword', formData.currentPassword);
    const isNewValid = validateField('newPassword', formData.newPassword);
    const isConfirmValid = validateField('confirmPassword', formData.confirmPassword);

    if (!isCurrentValid || !isNewValid || !isConfirmValid) {
      showToast('Vui lòng kiểm tra lại thông tin đã nhập', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Đổi mật khẩu thành công!', 'success');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength('');
        setErrors({});
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        if (data.field === 'currentPassword') {
          setErrors({ currentPassword: data.message });
        } else {
          showToast(data.message || 'Đổi mật khẩu thất bại', 'error');
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.message.includes('JSON')) {
        showToast('Lỗi kết nối server. Vui lòng thử lại sau.', 'error');
      } else {
        showToast('Có lỗi xảy ra khi đổi mật khẩu', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Yếu';
      case 'medium': return 'Trung bình';
      case 'strong': return 'Mạnh';
      default: return '';
    }
  };

  return (
    <div className="change-password-bg">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' ? (
              <CheckCircle size={16} color="#22c55e" />
            ) : (
              <AlertCircle size={16} color="#ef4444" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="change-password-card">
        {/* Header */}
        <div className="header-section">
          <div className="header-icon">
            <Shield size={24} color="white" />
          </div>
          <h1 className="header-title">Đổi mật khẩu</h1>
          <p className="header-subtitle">
            Cập nhật mật khẩu để bảo mật tài khoản của bạn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group">
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type={showPasswords.current ? "text" : "password"}
                className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Mật khẩu hiện tại"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <div className="validation-message error">
                <AlertCircle size={14} />
                {errors.currentPassword}
              </div>
            )}
          </div>

          {/* New Password */}
          <div className="form-group">
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type={showPasswords.new ? "text" : "password"}
                className={`form-input ${errors.newPassword ? 'error' : formData.newPassword && !errors.newPassword ? 'success' : ''}`}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Mật khẩu mới"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {/* Password Strength */}
            {formData.newPassword && (
              <div className={`password-strength strength-${passwordStrength}`}>
                <div className="strength-label">
                  Độ mạnh: <span className="strength-text">{getPasswordStrengthText()}</span>
                </div>
                <div className="strength-bar">
                  <div className="strength-fill"></div>
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <div className="validation-message error">
                <AlertCircle size={14} />
                {errors.newPassword}
              </div>
            )}
            
            {formData.newPassword && !errors.newPassword && (
              <div className="validation-message success">
                <CheckCircle size={14} />
                Mật khẩu hợp lệ
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type={showPasswords.confirm ? "text" : "password"}
                className={`form-input ${errors.confirmPassword ? 'error' : formData.confirmPassword && !errors.confirmPassword ? 'success' : ''}`}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Xác nhận mật khẩu mới"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {errors.confirmPassword && (
              <div className="validation-message error">
                <AlertCircle size={14} />
                {errors.confirmPassword}
              </div>
            )}
            
            {formData.confirmPassword && !errors.confirmPassword && formData.newPassword === formData.confirmPassword && (
              <div className="validation-message success">
                <CheckCircle size={14} />
                Mật khẩu khớp
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="button-section">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Đang xử lý...
                </>
              ) : (
                'Đổi mật khẩu'
              )}
            </button>
            
            <Link to="/profile" className="btn-secondary">
              <ArrowLeft size={16} style={{ marginRight: '6px' }} />
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}