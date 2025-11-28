import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import ChatBox from '../../components/ChatBox';
import IoTDevicesSection from '../../components/IoTDevicesSection';
import dayjs from 'dayjs';
import { 
  Lightbulb, 
  Lock, 
  Camera, 
  Thermometer, 
  Fan, 
  Snowflake, 
  Shield, 
  Smartphone,
  Home
} from 'lucide-react';
import '../../styles/property-detail.css';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [iotDevices, setIotDevices] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingDate, setViewingDate] = useState('');
  const [viewingTime, setViewingTime] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    loadPropertyDetail();
    loadCurrentUser();
    loadFavoriteStatus();
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      if (!token) return;

      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user || data.data);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadPropertyDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/houses/${id}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [PropertyDetail] Full API Response:', data);
        
        const propertyData = data.data || data;
        console.log('🔍 [PropertyDetail] Property Data:', propertyData);
        console.log('🔍 [PropertyDetail] IoT Devices in Property:', propertyData.iotDevices);
        console.log('🔍 [PropertyDetail] IoT Devices Type:', typeof propertyData.iotDevices);
        console.log('🔍 [PropertyDetail] IoT Devices Length:', propertyData.iotDevices?.length);
        
        setProperty(propertyData);
        setImages(propertyData.houseimages || []);
        
        // Set IoT devices from property data with debug
        const devices = propertyData.iotDevices || [];
        console.log('🔍 [PropertyDetail] Setting IoT Devices:', devices);
        setIotDevices(devices);
      }
    } catch (error) {
      console.error('Error loading property detail:', error);
    } finally {
      setLoading(false);
    }
  };


  const loadFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      if (!token) return;

      const response = await fetch(`/api/favorites/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited || false);
      } else {
        // Fallback to localStorage for demo
        const favoriteKey = `favorite_${id}_${token.slice(0, 10)}`;
        const isFavorited = localStorage.getItem(favoriteKey) === 'true';
        setIsFavorited(isFavorited);
      }
    } catch (error) {
      console.error('Error loading favorite status:', error);
      // Fallback to localStorage for demo
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      if (token) {
        const favoriteKey = `favorite_${id}_${token.slice(0, 10)}`;
        const isFavorited = localStorage.getItem(favoriteKey) === 'true';
        setIsFavorited(isFavorited);
      }
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    
    if (!token) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      window.location.href = '/login';
      return;
    }

    setFavoriteLoading(true);
    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ propertyId: id })
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.isFavorited);
        
        // Show success message
        const message = data.isFavorited ? 'Đã thêm vào yêu thích!' : 'Đã bỏ khỏi yêu thích!';
        setTimeout(() => {
          alert(message);
        }, 100);
      } else {
        // Fallback to localStorage for demo
        const favoriteKey = `favorite_${id}_${token.slice(0, 10)}`;
        const newFavoriteStatus = !isFavorited;
        
        if (newFavoriteStatus) {
          localStorage.setItem(favoriteKey, 'true');
        } else {
          localStorage.removeItem(favoriteKey);
        }
        
        setIsFavorited(newFavoriteStatus);
        
        const message = newFavoriteStatus ? 'Đã thêm vào yêu thích!' : 'Đã bỏ khỏi yêu thích!';
        setTimeout(() => {
          alert(message);
        }, 100);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Fallback to localStorage for demo
      const favoriteKey = `favorite_${id}_${token.slice(0, 10)}`;
      const newFavoriteStatus = !isFavorited;
      
      if (newFavoriteStatus) {
        localStorage.setItem(favoriteKey, 'true');
      } else {
        localStorage.removeItem(favoriteKey);
      }
      
      setIsFavorited(newFavoriteStatus);
      
      const message = newFavoriteStatus ? 'Đã thêm vào yêu thích!' : 'Đã bỏ khỏi yêu thích!';
      setTimeout(() => {
        alert(message);
      }, 100);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleScheduleViewing = async (e) => {
    e.preventDefault();
    if (!viewingDate || !viewingTime) {
      alert('Vui lòng chọn ngày và giờ xem nhà');
      return;
    }

    try {
      const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
      
      if (!token) {
        alert('Vui lòng đăng nhập để đặt lịch xem nhà');
        window.location.href = '/login';
        return;
      }

      const viewingDateTime = new Date(`${viewingDate}T${viewingTime}`);
      const response = await fetch('/api/viewings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          HouseID: id,
          ViewingDate: viewingDateTime.toISOString()
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Đặt lịch xem nhà thành công! Seller sẽ xác nhận lịch hẹn của bạn.');
        setShowViewingModal(false);
        setViewingDate('');
        setViewingTime('');
      } else {
        alert(result.message || 'Không thể đặt lịch xem nhà');
      }
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau.');
    }
  };

  const getDeviceIcon = (deviceType) => {
    const iconMap = {
      'Light': Lightbulb,
      'Door Lock': Lock,
      'Camera': Camera,
      'Thermostat': Thermometer,
      'Fan': Fan,
      'Air Conditioner': Snowflake,
      'Security System': Shield,
      'Smart Lock': Lock,
      'Temperature Sensor': Thermometer,
      'Motion Sensor': Camera,
      'Smoke Detector': Shield,
      'Smart Switch': Lightbulb,
      'Smart Plug': Smartphone
    };
    
    const IconComponent = iconMap[deviceType] || Home;
    return <IconComponent className="w-8 h-8 text-[#009879]" />;
  };

  const maskEmail = (email) => {
    if (!email) return 'N/A';
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    const visibleChars = Math.min(3, Math.floor(username.length / 2));
    const masked = username.substring(0, visibleChars) + '***';
    return `${masked}@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return 'Chưa cập nhật';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return '***';
    const visible = cleaned.substring(0, 3);
    const masked = visible + '***' + cleaned.substring(cleaned.length - 2);
    return masked;
  };

  const getDriveViewUrl = (img) => {
    if (!img) return null;
    
    if (img.DriveFileID) {
      return `https://drive.google.com/thumbnail?id=${img.DriveFileID}&sz=w1000`;
    }
    
    if (img.CloudPath) {
      try {
        const u = new URL(img.CloudPath);
        const id = u.searchParams.get('id');
        if (id) {
          return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
        }
      } catch(e) {
        return img.CloudPath;
      }
    }
    
    if (img.ImageUrl) {
      return img.ImageUrl;
    }
    
    return null;
  };

  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4 animate-spin">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 font-medium">Đang tải thông tin nhà...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-6xl text-gray-300 mb-6">🏠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thông tin nhà</h2>
            <p className="text-gray-600 mb-8">Có thể nhà này đã được gỡ bỏ hoặc không tồn tại.</p>
            <Link 
              to="/properties" 
              className="btn-premium btn-premium-primary inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const mainImage = images[currentImageIndex] || images[0];
  const mainImageUrl = getDriveViewUrl(mainImage) || '/images/img_1.jpg';

  return (
    <Layout>
      {/* Hero Section - Compact */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center animate-fadeInUp">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Chi tiết bất động sản</h1>
            <nav className="flex justify-center items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link to="/properties" className="hover:text-emerald-600 transition-colors">Danh sách nhà</Link>
              <span>/</span>
              <span className="text-emerald-600">Chi tiết</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content - Premium 2 Column Layout */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white py-16 overflow-hidden">
        {/* Global Decorative Elements */}
        <div className="decorative-orb decorative-orb-1"></div>
        <div className="decorative-orb decorative-orb-2"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column - Image Gallery */}
            <div className="animate-fadeInUp animate-delay-100">
              <div className="property-image-gallery">
                <img 
                  src={mainImageUrl} 
                  alt="Property Main" 
                  className="main-property-image"
                  onError={(e) => {
                    e.target.src = '/images/img_1.jpg';
                  }}
                />
              </div>

              {images.length > 1 && (
                <div className="thumbnail-grid animate-fadeInUp animate-delay-200">
                  {images.slice(0, 4).map((img, index) => (
                    <img
                      key={index}
                      src={getDriveViewUrl(img) || '/images/img_1.jpg'}
                      alt={`Thumbnail ${index + 1}`}
                      className={`property-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        e.target.src = '/images/img_1.jpg';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Property Info */}
            <div className="animate-slideInRight animate-delay-200">
              {/* Property Title & Price */}
              <div className="mb-8">
                <h1 className="property-title">{property.Title || 'Nhà đẹp'}</h1>
                <p className="text-lg text-gray-600 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.Address}
                </p>
                <div className="property-price">{formatPrice(property.Price)}</div>
                
                {/* Status Badge */}
                <span className={`status-badge ${property.Status === 'Available' ? 'available' : 'sold'}`}>
                  {property.Status === 'Available' ? 'Có sẵn' : 'Đã bán'}
                </span>
              </div>

              {/* Property Features - Glassmorphism */}
              <div className="glass-card p-6 mb-8 animate-fadeInUp animate-delay-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="property-info-item">
                    <div className="property-info-icon bg-blue-100 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M7 13h10" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Phòng ngủ</div>
                      <div className="font-semibold text-gray-900">{property.Bedrooms || 0}</div>
                    </div>
                  </div>

                  <div className="property-info-item">
                    <div className="property-info-icon bg-emerald-100 text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Phòng tắm</div>
                      <div className="font-semibold text-gray-900">{property.Bathrooms || 0}</div>
                    </div>
                  </div>

                  <div className="property-info-item">
                    <div className="property-info-icon bg-purple-100 text-purple-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Diện tích</div>
                      <div className="font-semibold text-gray-900">{property.Area || 0} m²</div>
                    </div>
                  </div>

                  <div className="property-info-item">
                    <div className="property-info-icon bg-orange-100 text-orange-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Trạng thái</div>
                      <div className="font-semibold text-gray-900">{property.Status}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.Description && (
                <div className="mb-8 animate-fadeInUp animate-delay-400">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                  <p className="text-gray-600 leading-relaxed">{property.Description}</p>
                </div>
              )}

              {/* Compact Action Buttons - Modern SaaS Style */}
              <div className="relative animate-fadeInUp animate-delay-400">
                {/* Decorative Background Elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-cyan-200/20 to-purple-200/20 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-emerald-200/25 to-teal-200/25 rounded-full blur-2xl opacity-40"></div>
                
                <div className="relative bg-gradient-to-br from-white/80 to-gray-50/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
                  {/* Header Section */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">Hành động</h3>
                    <div className="w-12 h-px bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-gray-600">Chọn thao tác bạn muốn thực hiện</p>
                    {/* Debug info */}
                    <p className="text-xs text-gray-400 mt-2">
                      User: {currentUser ? 'Logged in' : 'Not logged in'} | 
                      Property: {property ? 'Loaded' : 'Not loaded'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Compact Two Column Layout */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        className="compact-action-btn group bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 hover:from-emerald-100 hover:to-emerald-200/60"
                        style={{ 
                          padding: '0.875rem 1rem', 
                          borderRadius: '1.125rem', 
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          display: 'block'
                        }}
                        onClick={() => {
                          if (!currentUser) {
                            alert('Vui lòng đăng nhập để đặt lịch xem nhà');
                            window.location.href = '/login';
                            return;
                          }
                          setShowViewingModal(true);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-emerald-700">Đặt lịch xem</span>
                        </div>
                      </button>

                      <button 
                        className="compact-action-btn group bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 hover:from-blue-100 hover:to-blue-200/60"
                        style={{ 
                          padding: '0.875rem 1rem', 
                          borderRadius: '1.125rem', 
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          display: 'block'
                        }}
                        onClick={() => {
                          if (!currentUser) {
                            alert('Vui lòng đăng nhập để liên hệ người bán');
                            window.location.href = '/login';
                            return;
                          }
                          if (currentUser && property && currentUser.userId === property.OwnerID) {
                            alert('Bạn không thể liên hệ với chính mình');
                            return;
                          }
                          setShowChat(true);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-blue-700">Liên hệ người bán</span>
                        </div>
                      </button>
                    </div>

                    {/* Compact Favorite Button */}
                    <button 
                      className={`compact-action-btn w-full group transition-all duration-300 ${
                        isFavorited 
                          ? 'bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/60 hover:from-red-100 hover:to-pink-100' 
                          : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/60 hover:from-red-50 hover:to-pink-50 hover:border-red-200/60'
                      } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ 
                        padding: '0.875rem 1rem', 
                        borderRadius: '1.125rem', 
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: favoriteLoading ? 'not-allowed' : 'pointer',
                        display: 'block',
                        width: '100%'
                      }}
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {favoriteLoading ? (
                          <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <span className={`text-lg ${isFavorited ? 'animate-heartbeat' : ''}`}>
                            {isFavorited ? '❤️' : '🤍'}
                          </span>
                        )}
                        <span className={`text-sm font-semibold ${isFavorited ? 'text-red-600' : 'text-gray-700'}`}>
                          {isFavorited ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="relative bg-white py-16 hover-lift">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-fadeInUp">
            <h2 className="section-title">Thông tin chi tiết</h2>
            
            <div className="glass-card p-8 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="property-info-icon bg-red-100 text-red-600 mr-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Địa chỉ</div>
                      <div className="font-semibold text-gray-900">{property.Address}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="property-info-icon bg-indigo-100 text-indigo-600 mr-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Loại nhà</div>
                      <div className="font-semibold text-gray-900">{property.HouseType || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="property-info-icon bg-green-100 text-green-600 mr-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Hướng nhà</div>
                      <div className="font-semibold text-gray-900">{property.Orientation || 'Chưa cập nhật'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="property-info-icon bg-yellow-100 text-yellow-600 mr-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Người đăng</div>
                      <div className="font-semibold text-gray-900">{property.Owner?.FullName || property.user?.FullName || property.user?.fullName || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="property-info-icon bg-pink-100 text-pink-600 mr-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-semibold text-gray-900">{maskEmail(property.Owner?.Email || property.user?.Email || property.user?.email)}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="property-info-icon bg-teal-100 text-teal-600 mr-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Ngày đăng</div>
                      <div className="font-semibold text-gray-900">{dayjs(property.CreatedAt).format('DD/MM/YYYY')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* IoT Devices Section - DIRECT RENDER */}
            <div className="animate-fadeInUp animate-delay-250" style={{ backgroundColor: 'lightgreen', padding: '20px', margin: '20px 0' }}>
              <h2 className="section-title" style={{ color: 'darkgreen', fontSize: '28px' }}>🏠 Thiết bị IoT trong căn nhà</h2>
              
              {iotDevices && iotDevices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {iotDevices.map((device, index) => (
                    <div 
                      key={device.DeviceID || index} 
                      className="iot-device-card animate-fadeInUp"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        padding: '24px',
                        borderRadius: '16px',
                        backgroundColor: 'white',
                        border: '2px solid #009879',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4" style={{ fontSize: '48px' }}>
                          {getDeviceIcon(device.DeviceType)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                            {device.DeviceName || 'Thiết bị IoT'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {device.DeviceType || 'Unknown'}
                          </p>
                          {device.Status && (
                            <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                              device.Status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {device.Status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card text-center mb-12" style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'lightyellow' }}>
                  <div className="mb-4 opacity-50">
                    <Home className="w-16 h-16 mx-auto text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">Nhà này chưa có thiết bị IoT nào được kích hoạt</p>
                  <p className="text-gray-500 text-sm">Liên hệ chủ nhà để biết thêm thông tin về các thiết bị thông minh</p>
                </div>
              )}
            </div>

            {/* Seller Information Card */}
            {(property.Owner || property.user) && (
              <div className="animate-fadeInUp animate-delay-200">
                <h2 className="section-title">Thông tin Seller</h2>
                
                <div className="seller-card">
                  <div className="flex items-center justify-between flex-wrap gap-6">
                    <div className="flex items-center">
                      <div className="seller-avatar">
                        {((property.Owner?.FullName || property.user?.FullName || property.user?.fullName || 'S')[0]).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {property.Owner?.FullName || property.user?.FullName || property.user?.fullName || 'Chưa cập nhật'}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {maskEmail(property.Owner?.Email || property.user?.Email || property.user?.email)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {maskPhone(property.Owner?.PhoneNumber || property.user?.PhoneNumber || property.user?.phone)}
                          </div>
                          <div className="flex items-center">
                            <span className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                              {property.Owner?.Role || property.user?.Role || property.user?.role || 'Seller'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Link 
                        to={`/seller/${property.OwnerID}/properties`}
                        className="btn-premium btn-premium-outline flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Xem nhà khác
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Ultra Modern Glassmorphism Modal */}
      {showViewingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modalFadeIn">
          <div className="w-full max-w-md bg-white/55 backdrop-filter backdrop-blur-[18px] border border-white/25 rounded-[28px] shadow-2xl animate-modalSlideIn">
            {/* Compact Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[22px] font-semibold text-gray-900">Đặt lịch xem nhà</h2>
                <button 
                  type="button" 
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                  onClick={() => setShowViewingModal(false)}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600">Chọn thời gian phù hợp với bạn</p>
            </div>
            
            <div className="px-6 pb-6">
              <form onSubmit={handleScheduleViewing} className="space-y-4">
                {/* Compact Input Group */}
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày xem nhà</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-white/60 border border-black/8 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-gray-900 placeholder-gray-500"
                        value={viewingDate}
                        onChange={(e) => setViewingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                      <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 opacity-40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giờ xem nhà</label>
                    <div className="relative">
                      <input
                        type="time"
                        className="w-full px-4 py-3 bg-white/60 border border-black/8 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300 text-gray-900"
                        value={viewingTime}
                        onChange={(e) => setViewingTime(e.target.value)}
                        required
                      />
                      <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 opacity-40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Compact Note */}
                <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-[12px] p-4 text-center">
                  <p className="text-sm text-blue-800 font-medium">
                    Seller sẽ xác nhận lịch hẹn của bạn trong thời gian sớm nhất
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button" 
                    className="flex-1 px-4 py-3 bg-gray-100/80 border border-gray-200/50 text-gray-700 rounded-[14px] font-semibold hover:bg-gray-200/80 transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setShowViewingModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[14px] font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    Xác nhận đặt lịch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ChatBox */}
      {showChat && (property?.Owner || property?.user) && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
          <ChatBox
            targetUser={{
              userId: property.Owner?.UserID || property.user?.UserID || property.user?.userId || property.OwnerID,
              fullName: property.Owner?.FullName || property.user?.FullName || property.user?.fullName,
              role: property.Owner?.Role || property.user?.Role || property.user?.role
            }}
            onClose={() => setShowChat(false)}
            initialMessage={{
              text: `${window.location.origin}/property/${property.HouseID}`,
              type: 'property_link',
              metadata: {
                houseId: property.HouseID,
                title: property.Title,
                address: property.Address,
                price: formatPrice(property.Price),
                bedrooms: property.Bedrooms,
                bathrooms: property.Bathrooms,
                area: property.Area
              }
            }}
          />
        </div>
      )}
    </Layout>
  );
}
