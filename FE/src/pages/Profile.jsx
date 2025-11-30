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
  Building,
  Crown,
  Lock,
  Sparkles
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

  // Get current package tier (FREE, PRO, PREMIUM)
  const getPackageTier = () => {
    if (!isSeller) return 'FREE';
    const packageName = (user?.currentPackage?.name || 
                         authUser?.currentPackage?.name || 
                         packageSummary?.packageName || 
                         activePackage?.name || 
                         'FREE').toUpperCase();
    return packageName === 'PREMIUM' ? 'PREMIUM' : packageName === 'PRO' ? 'PRO' : 'FREE';
  };

  const packageTier = getPackageTier();

  // Tier-based theme configuration
  const getTierStyle = () => {
    switch (packageTier) {
      case 'PREMIUM':
        return {
          tier: 'PREMIUM',
          primaryColor: '#FFD700', // Gold
          secondaryColor: '#000000', // Black
          accentColor: '#8B5CF6', // Purple for gradients
          headerBg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50',
          headerBorder: 'border-yellow-300',
          avatarBorder: 'border-4 border-yellow-500',
          avatarGlow: 'shadow-[0_0_20px_rgba(255,215,0,0.5)]',
          badgeBg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
          badgeText: 'text-white',
          badgeIcon: Crown,
          cardBg: 'bg-white',
          cardBorder: 'border-yellow-200',
          cardShadow: 'shadow-lg shadow-yellow-100',
          textPrimary: 'text-gray-900',
          textSecondary: 'text-gray-600',
          buttonPrimary: 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700',
          verifiedIcon: true,
          crownIcon: true
        };
      case 'PRO':
        return {
          tier: 'PRO',
          primaryColor: '#1e3a8a', // Navy Blue
          secondaryColor: '#64748b', // Silver
          accentColor: '#3b82f6', // Blue
          headerBg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50',
          headerBorder: 'border-blue-300',
          avatarBorder: 'border-2 border-blue-500',
          avatarGlow: '',
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white',
          badgeIcon: Shield,
          cardBg: 'bg-white',
          cardBorder: 'border-blue-200',
          cardShadow: 'shadow-md shadow-blue-50',
          textPrimary: 'text-gray-900',
          textSecondary: 'text-gray-600',
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
          verifiedIcon: true,
          crownIcon: false
        };
      default: // FREE
        return {
          tier: 'FREE',
          primaryColor: '#6b7280', // Gray
          secondaryColor: '#9ca3af', // Light Gray
          accentColor: '#d1d5db', // Very Light Gray
          headerBg: 'bg-white',
          headerBorder: 'border-gray-200',
          avatarBorder: 'border-2 border-gray-300',
          avatarGlow: '',
          badgeBg: 'bg-gray-100',
          badgeText: 'text-gray-700',
          badgeIcon: User,
          cardBg: 'bg-white',
          cardBorder: 'border-gray-200',
          cardShadow: 'shadow-sm',
          textPrimary: 'text-gray-900',
          textSecondary: 'text-gray-500',
          buttonPrimary: 'bg-gray-600 hover:bg-gray-700',
          verifiedIcon: false,
          crownIcon: false
        };
    }
  };

  const tierStyle = getTierStyle();
  const BadgeIcon = tierStyle.badgeIcon;

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
            {/* Dynamic Profile Header - Tier-Based Design */}
            <div className={`${tierStyle.headerBg} rounded-2xl shadow-sm border-2 ${tierStyle.headerBorder} p-8 lg:p-10 fade-up relative overflow-hidden`}>
              {/* Premium Glow Effect */}
              {packageTier === 'PREMIUM' && (
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 via-transparent to-amber-200/20 pointer-events-none"></div>
              )}
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
                {/* Avatar Section - Tier-Based Styling */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full overflow-hidden ${tierStyle.avatarBorder} ${tierStyle.avatarGlow} shadow-lg relative`}>
                      {(user?.avatarUrl || user?.AvatarUrl) ? (
                        <img 
                          key={`avatar-main-${avatarKey}`}
                          src={`${API_URL}${user?.avatarUrl || user?.AvatarUrl}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('✅ Avatar loaded successfully')}
                          onError={(e) => {
                            console.error('❌ Avatar load error, using default');
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${(user?.avatarUrl || user?.AvatarUrl) ? 'hidden' : 'flex'}`}>
                        <User className="w-16 h-16 text-gray-400" />
                      </div>
                      
                      {/* Crown Icon for Premium */}
                      {packageTier === 'PREMIUM' && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-2 shadow-lg animate-pulse">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setEditing(true)}
                      className={`absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 transition-colors ${
                        packageTier === 'PREMIUM' 
                          ? 'border-yellow-300 hover:border-yellow-500' 
                          : packageTier === 'PRO'
                            ? 'border-blue-300 hover:border-blue-500'
                            : 'border-gray-200 hover:border-gray-400'
                      }`}
                      title="Thay đổi ảnh đại diện"
                    >
                      <Camera className={`w-5 h-5 ${
                        packageTier === 'PREMIUM' 
                          ? 'text-yellow-600' 
                          : packageTier === 'PRO'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-3">
                      <h1 className={`text-4xl lg:text-5xl font-bold ${tierStyle.textPrimary} leading-tight`}>
                        {user?.fullName || user?.display_name || user?.FullName || 'Người dùng'}
                      </h1>
                      {/* Verified Icon for PRO and PREMIUM */}
                      {tierStyle.verifiedIcon && (
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          packageTier === 'PREMIUM' 
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500' 
                            : 'bg-blue-500'
                        } shadow-md`}>
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {isSeller && <PackageBadge size="md" className="shadow-sm" />}
                    </div>
                    <p className={`text-lg ${tierStyle.textSecondary} mb-2`}>{user?.email}</p>
                    {isSeller && (
                      <div className="flex flex-col gap-1 mb-4">
                        <p className={`text-sm ${tierStyle.textSecondary}`}>{planStatusText}</p>
                        <p className="text-xs text-gray-500">{planExpiryText}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Tier-Based Badges */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 ${tierStyle.badgeBg} ${tierStyle.badgeText} rounded-full text-sm font-bold shadow-md`}>
                      <BadgeIcon className="w-4 h-4" />
                      {packageTier === 'PREMIUM' ? 'PREMIUM MEMBER' : packageTier === 'PRO' ? 'PRO SELLER' : 'Member'}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 bg-white border-2 rounded-full text-sm font-medium transition-colors ${
                      user?.status === 'Active' 
                        ? 'border-green-200 text-green-700 hover:border-green-300' 
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${user?.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`} />
                      {user?.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Banner for FREE Tier */}
            {packageTier === 'FREE' && isSeller && (
              <div className="bg-gradient-to-r from-[#0F5F5C] to-[#1B7A78] rounded-2xl shadow-lg border-2 border-[#0F5F5C] p-6 lg:p-8 fade-up">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      🔒 Nâng cấp ngay để mở khóa toàn bộ tính năng!
                    </h3>
                    <p className="text-white/90 text-lg mb-4">
                      Nhận huy hiệu xác thực, tăng lượt đăng bài, và nhiều quyền lợi độc quyền khác.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                        <Lock className="w-4 h-4" />
                        Huy hiệu xác thực
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                        <Lock className="w-4 h-4" />
                        Nhiều bài đăng hơn
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                        <Lock className="w-4 h-4" />
                        Ưu tiên hiển thị
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/packages')}
                    className="bg-white text-[#0F5F5C] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    Nâng cấp ngay →
                  </button>
                </div>
              </div>
            )}

            {isSeller && (
              <div className={`${tierStyle.cardBg} rounded-2xl ${tierStyle.cardShadow} border-2 ${tierStyle.cardBorder} p-8 lg:p-10 fade-up`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <p className={`text-xs uppercase tracking-wider ${tierStyle.textSecondary} font-semibold mb-2`}>Gói hiện tại</p>
                    <h3 className={`text-3xl font-bold ${tierStyle.textPrimary} mb-2`}>{currentPackageName}</h3>
                    <div className="flex flex-col gap-1">
                      <p className={`text-sm ${tierStyle.textSecondary}`}>{planStatusText}</p>
                      <p className="text-xs text-gray-500">{planExpiryText}</p>
                    </div>
                  </div>
                  <PackageBadge size="lg" className="shadow-lg" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-xl bg-gray-50 border-2 ${tierStyle.cardBorder} hover:${tierStyle.cardBorder} transition-colors`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        packageTier === 'PREMIUM' 
                          ? 'bg-gradient-to-br from-yellow-500 to-amber-600' 
                          : packageTier === 'PRO'
                            ? 'bg-blue-600'
                            : 'bg-gray-600'
                      }`}>
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${tierStyle.textSecondary} mb-1`}>Bài đăng mỗi ngày</p>
                        <p className={`text-2xl font-bold ${tierStyle.textPrimary}`}>
                          {postLimits?.daily === -1 ? 'Không giới hạn' : `${postLimits?.daily || 0} bài`}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 pl-16">
                      Đã dùng hôm nay: <span className="font-semibold text-gray-700">{postLimits?.daily_used || 0}</span>
                    </p>
                  </div>
                  <div className={`p-6 rounded-xl bg-gray-50 border-2 ${tierStyle.cardBorder} hover:${tierStyle.cardBorder} transition-colors`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        packageTier === 'PREMIUM' 
                          ? 'bg-gradient-to-br from-yellow-500 to-amber-600' 
                          : packageTier === 'PRO'
                            ? 'bg-blue-600'
                            : 'bg-gray-600'
                      }`}>
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${tierStyle.textSecondary} mb-1`}>Lượt boost</p>
                        <p className={`text-2xl font-bold ${tierStyle.textPrimary}`}>
                          {boostLimits?.per_day === -1 ? 'Không giới hạn' : `${boostLimits?.per_day || 0} lượt/ngày`}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 pl-16">
                      Đã dùng hôm nay: <span className="font-semibold text-gray-700">{boostLimits?.used_today || 0}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Personal Information - Clean List Format */}
              <div className="lg:col-span-2">
                <div className={`${tierStyle.cardBg} rounded-2xl ${tierStyle.cardShadow} border-2 ${tierStyle.cardBorder} p-8 lg:p-10 fade-up fade-up--delay-1`}>
                  <h3 className={`text-2xl font-bold ${tierStyle.textPrimary} mb-8 flex items-center`}>
                    <User className={`w-6 h-6 mr-3 ${
                      packageTier === 'PREMIUM' 
                        ? 'text-yellow-600' 
                        : packageTier === 'PRO'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                    }`} />
                    Thông tin cá nhân
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Phone */}
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Điện thoại</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.phone || user?.PhoneNumber || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                        <p className="text-lg font-semibold text-gray-900 truncate">{user?.email}</p>
                      </div>
                    </div>
                    
                    {/* Address */}
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Địa chỉ</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.address || user?.Address || 'TP. Hồ Chí Minh'}</p>
                      </div>
                    </div>
                    
                    {/* Timezone */}
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Múi giờ</p>
                        <p className="text-lg font-semibold text-gray-900">{user?.timezone || user?.Timezone || 'GMT+7 (ICT)'}</p>
                      </div>
                    </div>
                    
                    {/* Website */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                        {user?.website || user?.Website ? (
                          <a 
                            href={user?.website || user?.Website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-[#0F5F5C] hover:text-[#0a4a47] underline"
                          >
                            {user?.website || user?.Website}
                          </a>
                        ) : (
                          <p className="text-lg font-semibold text-gray-400">Chưa cập nhật</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className={`${tierStyle.cardBg} rounded-2xl ${tierStyle.cardShadow} border-2 ${tierStyle.cardBorder} p-6 fade-up fade-up--delay-2`}>
                  <h3 className={`text-xl font-bold ${tierStyle.textPrimary} mb-6 flex items-center`}>
                    <Zap className={`w-5 h-5 mr-3 ${
                      packageTier === 'PREMIUM' 
                        ? 'text-yellow-600' 
                        : packageTier === 'PRO'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                    }`} />
                    Thao tác nhanh
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setEditing(true)}
                      className={`w-full flex items-center justify-center px-6 py-4 ${tierStyle.buttonPrimary} text-white rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md`}
                    >
                      <Edit3 className="w-5 h-5 mr-3" />
                      Chỉnh sửa thông tin
                    </button>
                    
                    <button 
                      onClick={() => navigate('/change-password')}
                      className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl font-semibold transition-colors"
                    >
                      <Key className="w-5 h-5 mr-3" />
                      Đổi mật khẩu
                    </button>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 rounded-xl font-semibold transition-colors"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                </div>

                {/* Seller Tools */}
                {user?.role === 'Seller' && (
                  <div className={`${tierStyle.cardBg} rounded-2xl ${tierStyle.cardShadow} border-2 ${tierStyle.cardBorder} p-6 fade-up fade-up--delay-3`}>
                    <h3 className={`text-xl font-bold ${tierStyle.textPrimary} mb-6 flex items-center`}>
                      <Building className={`w-5 h-5 mr-3 ${
                        packageTier === 'PREMIUM' 
                          ? 'text-yellow-600' 
                          : packageTier === 'PRO'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                      }`} />
                      Công cụ Seller
                    </h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => navigate('/seller/dashboard')}
                        className={`w-full flex items-center justify-center px-6 py-4 ${tierStyle.buttonPrimary} text-white rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md`}
                      >
                        <Building className="w-5 h-5 mr-3" />
                        Seller Dashboard
                      </button>
                      
                      <button 
                        onClick={() => navigate('/packages')}
                        className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl font-semibold transition-colors"
                      >
                        <Star className="w-5 h-5 mr-3" />
                        Gói dịch vụ
                      </button>
                      
                      <button 
                        onClick={() => navigate('/notifications')}
                        className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl font-semibold transition-colors"
                      >
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Thông báo
                      </button>
                    </div>
                  </div>
                )}

                {/* Buyer Upgrade */}
                {user?.role === 'Buyer' && (
                  <div className={`${tierStyle.cardBg} rounded-2xl ${tierStyle.cardShadow} border-2 ${tierStyle.cardBorder} p-6 fade-up fade-up--delay-3`}>
                    <h3 className={`text-xl font-bold ${tierStyle.textPrimary} mb-6 flex items-center`}>
                      <TrendingUp className={`w-5 h-5 mr-3 ${
                        packageTier === 'PREMIUM' 
                          ? 'text-yellow-600' 
                          : packageTier === 'PRO'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                      }`} />
                      Nâng cấp tài khoản
                    </h3>
                    <button 
                      onClick={handleSellerUpgrade}
                      className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-colors ${
                        hasActiveUpgradeRequest 
                          ? 'bg-white border-2 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700' 
                          : `${tierStyle.buttonPrimary} text-white shadow-sm hover:shadow-md`
                      }`}
                    >
                      {hasActiveUpgradeRequest ? <FileText className="w-5 h-5 mr-3" /> : <TrendingUp className="w-5 h-5 mr-3" />}
                      {hasActiveUpgradeRequest ? 'Xem yêu cầu nâng cấp' : 'Nâng cấp lên Seller'}
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div className={`${tierStyle.cardBg} rounded-2xl ${tierStyle.cardShadow} border-2 ${tierStyle.cardBorder} p-6 fade-up fade-up--delay-4`}>
                  <h3 className={`text-lg font-bold ${tierStyle.textPrimary} mb-4 flex items-center`}>
                    <ArrowLeft className={`w-5 h-5 mr-3 ${
                      packageTier === 'PREMIUM' 
                        ? 'text-yellow-600' 
                        : packageTier === 'PRO'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                    }`} />
                    Điều hướng
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Trang chủ
                    </button>
                    
                    <button 
                      onClick={() => navigate('/properties')}
                      className="w-full flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl font-medium transition-colors"
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