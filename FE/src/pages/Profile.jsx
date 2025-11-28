import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile-premium.css';
import { useAuth } from '../contexts/AuthContext';
import { PackageContext } from '../context/PackageContext';
import PackageBadge from '../components/PackageBadge';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  Edit3, 
  Key, 
  LogOut, 
  ArrowLeft,
  Camera,
  TrendingUp,
  FileText,
  MapPin,
  Globe,
  Calendar,
  Star,
  GitBranch,
  Code,
  Zap,
  Heart,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  Clock,
  Building
} from 'lucide-react';

export default function Profile() {
  const { user: authUser, userPackage } = useAuth();
  const { packageInfo: packageSummary, detail: packageDetail, loading: pkgLoading } = useContext(PackageContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    gender: '',
    address: '',
    timezone: 'GMT+7 (ICT)',
    website: '',
    bio: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [hasActiveUpgradeRequest, setHasActiveUpgradeRequest] = useState(false);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:3001';
  const normalizedRole = (authUser?.role || user?.role || '').toLowerCase();
  const isSeller = normalizedRole === 'seller';
  const activePackage = isSeller ? ((packageDetail || userPackage)?.userPackage || null) : null;
  const currentPackageName = isSeller
    ? (packageSummary?.packageName || activePackage?.display_name || activePackage?.name || 'Gói Miễn Phí')
    : null;
  const packageExpiry = isSeller ? activePackage?.expires_at : null;
  const packageExpired = packageExpiry ? new Date(packageExpiry) < new Date() : false;
  const daysLeft = packageExpiry ? Math.max(0, Math.ceil((new Date(packageExpiry) - new Date()) / (1000 * 60 * 60 * 24))) : null;
  const postLimits = isSeller ? userPackage?.limits?.posts : null;
  const boostLimits = isSeller ? userPackage?.limits?.boost : null;
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Không giới hạn';
  const planExpiryText = isSeller ? (packageExpiry ? `Hết hạn: ${formatDate(packageExpiry)}` : 'Không giới hạn thời gian') : '';
  const planStatusText = isSeller
    ? (pkgLoading ? 'Đang đồng bộ gói...' : packageExpired ? 'Gói đã hết hạn' : daysLeft !== null ? `${daysLeft} ngày còn lại` : 'Không giới hạn thời gian')
    : '';

  // Debug: Log component mount
  console.log('🔍 Profile component rendered, loading:', loading, 'user:', user);

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    console.log('🔍 Validating form data:', formData);

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
      console.log('❌ Full name validation failed');
    }

    // Validate phone
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có đúng 10 số';
      console.log('❌ Phone validation failed:', formData.phone);
    }

    // Validate website
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Website phải có định dạng URL hợp lệ (http:// hoặc https://)';
      console.log('❌ Website validation failed:', formData.website);
    }

    // Validate avatar size
    if (formData.avatar && formData.avatar.size > 5 * 1024 * 1024) {
      newErrors.avatar = 'Kích thước avatar không được vượt quá 5MB';
      console.log('❌ Avatar validation failed:', formData.avatar.size);
    }

    console.log('🔍 Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Gọi checkUpgradeRequest sau khi user được set
  useEffect(() => {
    if (user) {
      checkUpgradeRequest();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }
     
      const response = await fetch(`${API_URL}/api/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const userData = data.user || data.data || data;
        
        if (!userData || !userData.email) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          navigate('/login');
          return;
        }
        
        console.log('🔍 Setting user data:', userData);
        console.log('🖼️ Avatar URL from API:', userData.avatarUrl || userData.AvatarUrl);
        
        // If no avatar from API but we have one in localStorage, use it
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!userData.avatarUrl && !userData.AvatarUrl && savedUser.avatarUrl) {
          userData.avatarUrl = savedUser.avatarUrl;
          console.log('🔄 Using saved avatar URL:', userData.avatarUrl);
        }
        
        setUser(userData);
        setFormData({
          email: userData.email || '',
          fullName: userData.fullName || userData.display_name || userData.FullName || '',
          phone: userData.phone || userData.PhoneNumber || '',
          gender: userData.gender || userData.Gender || '',
          address: userData.address || userData.Address || '',
          timezone: userData.timezone || userData.Timezone || 'GMT+7 (ICT)',
          website: userData.website || userData.Website || '',
          bio: userData.bio || userData.Bio || '',
          avatar: null
        });
        setLoading(false);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        navigate('/login');
      }

    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
      navigate('/login');
    }
  };

  // Kiểm tra xem có yêu cầu nâng cấp đang active không (chỉ cho Buyer)
  const checkUpgradeRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Chỉ kiểm tra upgrade request cho Buyer
      const userRole = user?.role;
      if (userRole !== 'Buyer') {
        setHasActiveUpgradeRequest(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/seller-upgrade/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const requestsArray = Array.isArray(data.data) ? data.data : [];

        const hasActive = requestsArray.some(req => 
          req?.Status === 'Pending' || req?.Status === 'Approved'
        );

        setHasActiveUpgradeRequest(hasActive);
      }
    } catch (error) {
      console.error('Error checking upgrade request:', error);
      setHasActiveUpgradeRequest(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Kích thước file không được vượt quá 5MB'
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Chỉ chấp nhận file ảnh'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        avatar: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      setErrors(prev => ({
        ...prev,
        avatar: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Form submission started');
    console.log('📝 Form data:', formData);
    
    // Validate form
    if (!validateForm()) {
      setMessage('Vui lòng kiểm tra lại thông tin đã nhập');
      console.log('❌ Validation failed:', errors);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName.trim());
      submitData.append('phone', formData.phone || '');
      submitData.append('gender', formData.gender || '');
      submitData.append('address', formData.address || '');
      submitData.append('timezone', formData.timezone || 'GMT+7 (ICT)');
      submitData.append('website', formData.website || '');
      submitData.append('bio', formData.bio || '');
      
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
        console.log('📸 Avatar file attached:', formData.avatar.name);
      }

      console.log('🚀 Sending API request...');
    
      const response = await fetch(`${API_URL}/api/user/update-profile`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: submitData
      });

      console.log('📊 API Response status:', response.status);
      const data = await response.json();
      console.log('📊 API Response data:', data);

      if (response.ok && data.success) {
        setMessage('Cập nhật thông tin thành công!');
        setEditing(false);
        setAvatarPreview(null);
        setErrors({});
        
        // Update user state with new data
        if (data.data && data.data.user) {
          const updatedUserData = data.data.user;
          
          // Add cache-busting timestamp to avatar URL if it exists
          if (updatedUserData.avatarUrl) {
            updatedUserData.avatarUrl = `${updatedUserData.avatarUrl}?t=${Date.now()}`;
          }
          
          console.log('✅ Updated user with new avatar URL:', updatedUserData.avatarUrl);
          
          // Set user immediately with updated data
          setUser(updatedUserData);
          
          // Force avatar re-render
          setAvatarKey(Date.now());
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUserData));
          
          // Reset form data to new values
          setFormData({
            email: updatedUserData.email || '',
            fullName: updatedUserData.fullName || '',
            phone: updatedUserData.phone || '',
            gender: updatedUserData.gender || '',
            address: updatedUserData.address || '',
            timezone: updatedUserData.timezone || 'GMT+7 (ICT)',
            website: updatedUserData.website || '',
            bio: updatedUserData.bio || '',
            avatar: null
          });
        }

        // DON'T call fetchUserProfile again as it might override the avatar URL
        // await fetchUserProfile();

        // Dispatch event để Navbar cập nhật
        window.dispatchEvent(new Event('userChanged'));
        
        console.log('✅ Profile updated successfully');
      } else {
        const errorMessage = data.message || 'Cập nhật thất bại';
        setMessage(errorMessage);
        console.log('❌ API Error:', errorMessage);
      }
    } catch (error) {
      console.error('❌ Network/Server Error:', error);
      setMessage('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch event để Navbar cập nhật
    window.dispatchEvent(new Event('userChanged'));
    
    navigate('/login');
  };

  // Hàm xử lý nút nâng cấp seller
  const handleSellerUpgrade = () => {
    if (hasActiveUpgradeRequest) {
      navigate('/my-upgrade-requests');
    } else {
      navigate('/request-upgrade');
    }
  };

  if (loading) {
    return (
      <div className="profile-premium-bg">
        {/* Floating Blobs */}
        <div className="blob blob--primary"></div>
        <div className="blob blob--secondary"></div>
        
        <div className="profile-container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="glass-card p-8 text-center fade-up">
              <div className="spinner-premium mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium text-lg">Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Debug fallback
  if (!user) {
    return (
      <div className="profile-premium-bg">
        {/* Floating Blobs */}
        <div className="blob blob--primary"></div>
        <div className="blob blob--secondary"></div>
        
        <div className="profile-container">
          <div className="glass-card p-8 fade-up">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Debug</h1>
            <div className="space-y-2 text-gray-700 mb-6">
              <p>Loading: {loading.toString()}</p>
              <p>User: {user ? 'Loaded' : 'Not loaded'}</p>
              <p>Token: {localStorage.getItem('token') ? 'Exists' : 'Not found'}</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="btn-premium btn-premium--primary px-6 py-3"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-premium-bg">
      {/* Floating Blobs */}
      <div className="blob blob--primary"></div>
      <div className="blob blob--secondary"></div>
      
      <div className="profile-container">
        {/* Alert Message */}
        {message && (
          <div className={`glass-card mb-8 p-6 fade-up ${
            message.includes('thành công') 
              ? 'border-green-300' 
              : 'border-red-300'
          }`}>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                message.includes('thành công')
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className={`font-medium ${
                message.includes('thành công') ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </span>
            </div>
          </div>
        )}

        {!editing ? (
          <div className="space-y-8">
            {/* Modern Profile Header */}
            <div className="glass-card glass-card--header header-shine fade-up">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Avatar Section */}
                  <div className="avatar-container flex-shrink-0">
                    <div className="avatar-wrapper">
                      {(user?.avatarUrl || user?.AvatarUrl) ? (
                        <img 
                          key={`avatar-main-${avatarKey}`}
                          src={`${API_URL}${user?.avatarUrl || user?.AvatarUrl}`}
                          alt="Avatar"
                          onLoad={() => console.log('✅ Avatar loaded successfully')}
                          onError={(e) => {
                            console.error('❌ Avatar load error, using default');
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`avatar-default ${(user?.avatarUrl || user?.AvatarUrl) ? 'hidden' : 'flex'}`}>
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                      <button 
                        onClick={() => setEditing(true)}
                        className="avatar-camera-icon"
                        title="Thay đổi ảnh đại diện"
                      >
                        <Camera />
                      </button>
                    </div>
                  </div>

                  {/* Profile Info - Centered */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center justify-center lg:justify-start gap-3">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                          {user?.fullName || user?.display_name || user?.FullName || 'Người dùng'}
                        </h1>
                        {isSeller && <PackageBadge size="md" className="shadow-sm" />}
                      </div>
                      {isSeller && (
                        <>
                          <p className="text-sm text-gray-600">{planStatusText}</p>
                          <p className="text-xs text-gray-500">{planExpiryText}</p>
                        </>
                      )}
                      <p className="text-lg text-gray-600">{user?.email}</p>
                    </div>
                    
                    {/* Modern Badges */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                      <span className="profile-badge profile-badge--seller">
                        <Shield className="w-4 h-4" />
                        {user?.role || 'User'}
                      </span>
                      <span className="profile-badge profile-badge--active">
                        <CheckCircle className="w-4 h-4" />
                        {user?.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 italic text-lg font-medium">"Chuyên nghiệp - Uy tín - Tận tâm"</p>
                  </div>
                </div>
            </div>

            {isSeller && (
              <div className="glass-card p-6 fade-up">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-gray-500">Gói hiện tại</p>
                    <h3 className="text-2xl font-bold text-gray-900">{currentPackageName}</h3>
                    <p className="text-sm text-gray-600">{planStatusText}</p>
                    <p className="text-xs text-gray-500">{planExpiryText}</p>
                  </div>
                  <PackageBadge size="lg" className="shadow-lg" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Bài đăng mỗi ngày</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {postLimits?.daily === -1 ? 'Không giới hạn' : `${postLimits?.daily || 0} bài`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Đã dùng hôm nay: {postLimits?.daily_used || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Lượt boost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {boostLimits?.per_day === -1 ? 'Không giới hạn' : `${boostLimits?.per_day || 0} lượt/ngày`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Đã dùng hôm nay: {boostLimits?.used_today || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <div className="glass-card p-8 fade-up fade-up--delay-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="icon-container icon-container--emerald mr-3">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Thông tin cá nhân
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="info-card info-card--emerald flex items-center gpu-accelerated">
                      <div className="icon-container icon-container--emerald mr-4">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-emerald-600 block">Điện thoại</span>
                        <span className="text-lg font-medium text-gray-800">{user?.phone || user?.PhoneNumber || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                    
                    <div className="info-card info-card--blue flex items-center gpu-accelerated">
                      <div className="icon-container icon-container--blue mr-4">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-blue-600 block">Email</span>
                        <span className="text-lg font-medium text-gray-800 truncate">{user?.email}</span>
                      </div>
                    </div>
                    
                    <div className="info-card info-card--purple flex items-center gpu-accelerated">
                      <div className="icon-container icon-container--purple mr-4">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-purple-600 block">Địa chỉ</span>
                        <span className="text-lg font-medium text-gray-800">{user?.address || user?.Address || 'TP. Hồ Chí Minh'}</span>
                      </div>
                    </div>
                    
                    <div className="info-card info-card--orange flex items-center gpu-accelerated">
                      <div className="icon-container icon-container--orange mr-4">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-orange-600 block">Múi giờ</span>
                        <span className="text-lg font-medium text-gray-800">{user?.timezone || user?.Timezone || 'GMT+7 (ICT)'}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 info-card info-card--indigo flex items-center gpu-accelerated">
                      <div className="icon-container icon-container--indigo mr-4">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-indigo-600 block">Website</span>
                        <span className="text-lg font-medium text-gray-800">
                          {user?.website || user?.Website ? (
                            <a 
                              href={user?.website || user?.Website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 underline"
                            >
                              {user?.website || user?.Website}
                            </a>
                          ) : (
                            'Chưa cập nhật'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="glass-card p-6 fade-up fade-up--delay-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="icon-container icon-container--emerald mr-3">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    Thao tác nhanh
                  </h3>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setEditing(true)}
                      className="w-full flex items-center justify-center px-6 py-4 btn-premium btn-premium--primary shadow-glow"
                    >
                      <Edit3 className="w-5 h-5 mr-3" />
                      Chỉnh sửa thông tin
                    </button>
                    
                    <button 
                      onClick={() => navigate('/change-password')}
                      className="w-full flex items-center justify-center px-6 py-4 btn-premium bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-semibold"
                    >
                      <Key className="w-5 h-5 mr-3" />
                      Đổi mật khẩu
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center px-6 py-4 btn-premium bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold border border-red-200"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                </div>

                {/* Seller Tools */}
                {user?.role === 'Seller' && (
                  <div className="glass-card p-6 fade-up fade-up--delay-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <div className="icon-container icon-container--blue mr-3">
                        <Building className="w-4 h-4 text-white" />
                      </div>
                      Công cụ Seller
                    </h3>
                    <div className="space-y-4">
                      <button 
                        onClick={() => navigate('/seller/dashboard')}
                        className="w-full flex items-center justify-center px-6 py-4 btn-premium btn-premium--primary shadow-glow"
                      >
                        <Building className="w-5 h-5 mr-3" />
                        Seller Dashboard
                      </button>
                      
                      <button 
                        onClick={() => navigate('/packages')}
                        className="w-full flex items-center justify-center px-6 py-4 btn-premium bg-yellow-50 hover:bg-yellow-100 text-yellow-700 hover:text-yellow-800 font-semibold border border-yellow-200"
                      >
                        <Star className="w-5 h-5 mr-3" />
                        Gói dịch vụ
                      </button>
                      
                      <button 
                        onClick={() => navigate('/notifications')}
                        className="w-full flex items-center justify-center px-6 py-4 btn-premium bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-semibold border border-blue-200"
                      >
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Thông báo
                      </button>
                    </div>
                  </div>
                )}

                {/* Buyer Upgrade */}
                {user?.role === 'Buyer' && (
                  <div className="glass-card p-6 fade-up fade-up--delay-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <div className="icon-container icon-container--emerald mr-3">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Nâng cấp tài khoản
                    </h3>
                    <button 
                      onClick={handleSellerUpgrade}
                      className={`w-full flex items-center justify-center px-6 py-4 btn-premium font-semibold ${
                        hasActiveUpgradeRequest 
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {hasActiveUpgradeRequest ? <FileText className="w-5 h-5 mr-3" /> : <TrendingUp className="w-5 h-5 mr-3" />}
                      {hasActiveUpgradeRequest ? 'Xem yêu cầu nâng cấp' : 'Nâng cấp lên Seller'}
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div className="glass-card p-6 fade-up fade-up--delay-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="icon-container icon-container--indigo mr-3">
                      <ArrowLeft className="w-4 h-4 text-white" />
                    </div>
                    Điều hướng
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full flex items-center justify-center px-6 py-3 btn-premium bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Trang chủ
                    </button>
                    
                    <button 
                      onClick={() => navigate('/properties')}
                      className="w-full flex items-center justify-center px-6 py-3 btn-premium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 font-medium"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Bất động sản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode - Premium Form */
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 fade-up">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="icon-container icon-container--emerald w-16 h-16 mx-auto mb-4">
                  <Edit3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gradient">
                  Chỉnh sửa thông tin cá nhân
                </h3>
                <p className="text-gray-600 mt-2">Cập nhật thông tin để hoàn thiện hồ sơ của bạn</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Upload Section */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="avatar-wrapper mx-auto mb-4 group cursor-pointer">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (user?.avatarUrl || user?.AvatarUrl) ? (
                        <img 
                          key={`avatar-edit-${avatarKey}`}
                          src={`${API_URL}${user?.avatarUrl || user?.AvatarUrl}`}
                          alt="Current avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Avatar load error in edit mode');
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`avatar-default ${(avatarPreview || user?.avatarUrl || user?.AvatarUrl) ? 'hidden' : 'flex'}`}>
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                      <label 
                        htmlFor="avatar-upload" 
                        className="avatar-camera-icon"
                      >
                        <Camera />
                      </label>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Nhấn vào biểu tượng camera để thay đổi avatar</p>
                  <p className="text-xs text-gray-400 mt-1">Kích thước tối đa: 5MB • Định dạng: JPG, PNG, WebP</p>
                  {errors.avatar && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.avatar}
                    </p>
                  )}
                </div>

                {/* Form Fields - 2 Column Layout */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-emerald-500" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className={`w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F5C] focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm ${
                          errors.fullName ? 'border-red-300 focus:ring-red-500' : 'border-white/40'
                        }`}
                        placeholder="Nhập họ và tên đầy đủ"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Shield className="w-5 h-5 text-purple-500" />
                      </div>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F5C] focus:border-transparent transition-all duration-300 text-gray-800 shadow-sm"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-blue-500" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F5C] focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm ${
                          errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-white/40'
                        }`}
                        placeholder="Nhập số điện thoại (10 số)"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Múi giờ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                      <select
                        id="timezone"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F5C] focus:border-transparent transition-all duration-300 text-gray-800 shadow-sm"
                      >
                        <option value="GMT+7 (ICT)">GMT+7 (ICT) - Việt Nam</option>
                        <option value="GMT+8 (CST)">GMT+8 (CST) - Trung Quốc</option>
                        <option value="GMT+9 (JST)">GMT+9 (JST) - Nhật Bản</option>
                        <option value="GMT+0 (UTC)">GMT+0 (UTC) - London</option>
                        <option value="GMT-5 (EST)">GMT-5 (EST) - New York</option>
                        <option value="GMT-8 (PST)">GMT-8 (PST) - Los Angeles</option>
                      </select>
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Globe className="w-5 h-5 text-indigo-500" />
                      </div>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F5C] focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm ${
                          errors.website ? 'border-red-300 focus:ring-red-500' : 'border-white/40'
                        }`}
                        placeholder="https://example.com"
                      />
                    </div>
                    {errors.website && (
                      <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-red-500" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F5C] focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                        placeholder="Nhập địa chỉ của bạn"
                      />
                    </div>
                  </div>
                </div>

                {/* Email - Read Only */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email đăng nhập
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full pl-12 pr-4 py-3 bg-gray-100/80 backdrop-blur-sm border border-gray-300 rounded-xl text-gray-600 cursor-not-allowed shadow-sm"
                      title="Email đăng nhập không thể thay đổi"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Không thể sửa</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email đăng nhập không thể thay đổi</p>
                </div>

                {/* Bio - Full Width */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú cá nhân
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F5F5C] focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm resize-none"
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/20">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 flex items-center justify-center px-8 py-4 btn-premium btn-premium--primary shadow-glow disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="spinner-premium w-5 h-5 mr-3"></div>
                        Đang lưu thay đổi...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        email: user?.email || '',
                        fullName: user?.fullName || user?.display_name || user?.FullName || '',
                        phone: user?.phone || user?.PhoneNumber || '',
                        gender: user?.gender || user?.Gender || '',
                        address: user?.address || user?.Address || '',
                        timezone: user?.timezone || user?.Timezone || 'GMT+7 (ICT)',
                        website: user?.website || user?.Website || '',
                        bio: user?.bio || user?.Bio || '',
                        avatar: null
                      });
                      setAvatarPreview(null);
                      setErrors({});
                      setMessage('');
                    }}
                    className="flex-1 flex items-center justify-center px-8 py-4 btn-premium bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-semibold text-lg"
                  >
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}