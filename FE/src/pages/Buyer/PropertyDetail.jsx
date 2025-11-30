import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import ChatBox from '../../components/ChatBox';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Lock, 
  Camera, 
  Thermometer, 
  Fan, 
  Snowflake, 
  Shield, 
  Smartphone,
  Home,
  Heart,
  Calendar,
  MessageCircle,
  MapPin,
  Bed,
  Bath,
  Square,
  CheckCircle,
  Phone,
  Mail,
  User
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
  const [quickContactName, setQuickContactName] = useState('');
  const [quickContactPhone, setQuickContactPhone] = useState('');
  const [quickContactMessage, setQuickContactMessage] = useState('');
  const [quickContactSubmitting, setQuickContactSubmitting] = useState(false);

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
        const propertyData = data.data || data;
        setProperty(propertyData);
        setImages(propertyData.houseimages || []);
        const devices = propertyData.iotDevices || [];
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
        const favoriteKey = `favorite_${id}_${token.slice(0, 10)}`;
        const isFavorited = localStorage.getItem(favoriteKey) === 'true';
        setIsFavorited(isFavorited);
      }
    } catch (error) {
      console.error('Error loading favorite status:', error);
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
        const message = data.isFavorited ? 'Đã thêm vào yêu thích!' : 'Đã bỏ khỏi yêu thích!';
        setTimeout(() => {
          alert(message);
        }, 100);
      } else {
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
    return <IconComponent className="w-6 h-6 text-emerald-600" />;
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

  const handleQuickContact = async (e) => {
    e.preventDefault();
    if (!quickContactName || !quickContactPhone || !quickContactMessage) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    if (!token) {
      alert('Vui lòng đăng nhập để gửi tin nhắn');
      window.location.href = '/login';
      return;
    }

    setQuickContactSubmitting(true);
    try {
      // Trigger chat with initial message
      setShowChat(true);
      setQuickContactName('');
      setQuickContactPhone('');
      setQuickContactMessage('');
      alert('Đang mở hộp thoại chat với người bán...');
    } catch (error) {
      console.error('Error sending quick contact:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setQuickContactSubmitting(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-white">
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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-6xl text-gray-300 mb-6">🏠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thông tin nhà</h2>
            <p className="text-gray-600 mb-8">Có thể nhà này đã được gỡ bỏ hoặc không tồn tại.</p>
            <Link 
              to="/properties" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all"
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
      {/* Header Section - Clean & Minimal */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-emerald-600 transition-colors">Danh sách nhà</Link>
            <span>/</span>
            <span className="text-emerald-600">Chi tiết</span>
          </nav>
        </div>
      </div>

      {/* Main Content - Premium Split Hero Layout */}
      <div className="bg-[#f8f9fa] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* Split Hero Section - Image (Left) + Summary Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            {/* LEFT COLUMN - Hero Image (8 columns on desktop) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-8"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-[16/10] lg:aspect-[3/2]">
                  <img 
                    src={mainImageUrl} 
                    alt="Property Main" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/img_1.jpg';
                    }}
                  />
                  {/* Price Tag - Top Right Corner */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl px-5 py-3 shadow-2xl border border-white/20">
                    <div className="text-2xl lg:text-3xl font-bold text-white">
                      {formatPrice(property.Price)}
                    </div>
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 p-4 bg-white/95 backdrop-blur-sm">
                    {images.slice(0, 4).map((img, index) => (
                      <motion.img
                        key={index}
                        src={getDriveViewUrl(img) || '/images/img_1.jpg'}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-full h-20 object-cover rounded-xl cursor-pointer transition-all ${
                          index === currentImageIndex 
                            ? 'ring-4 ring-emerald-500 scale-105 shadow-lg' 
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                        onError={(e) => {
                          e.target.src = '/images/img_1.jpg';
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* RIGHT COLUMN - Summary Card (4 columns on desktop, sticky) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4"
            >
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  {/* Status Badge - Top */}
                  <div className="mb-4">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                      property.Status === 'Available' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {property.Status === 'Available' ? 'Có sẵn' : 'Đã bán'}
                    </span>
                  </div>

                  {/* Title - Two Lines: Prefix + Property Name */}
                  <div className="mb-3">
                    {/* Line 1: Prefix */}
                    <div className="text-sm lg:text-base font-semibold text-emerald-600 mb-2">
                      💎 Nhà phố Premium
                    </div>
                    {/* Line 2: Property Name - Wraps correctly */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight break-words" style={{ fontFamily: 'Georgia, serif' }}>
                      {property.Title || 'Nhà đẹp'}
                    </h1>
                  </div>

                  {/* Address */}
                  <div className="flex items-start text-gray-600 mb-6">
                    <MapPin className="w-5 h-5 mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm lg:text-base break-words">{property.Address}</span>
                  </div>

                  {/* Action Buttons - Stacked Vertically */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          alert('Vui lòng đăng nhập để đặt lịch xem nhà');
                          window.location.href = '/login';
                          return;
                        }
                        setShowViewingModal(true);
                      }}
                      className="w-full group flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Đặt lịch xem</span>
                    </button>

                    <button
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
                      className="w-full group flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Liên hệ người bán</span>
                    </button>

                    <button
                      onClick={toggleFavorite}
                      disabled={favoriteLoading}
                      className={`w-full group flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        isFavorited
                          ? 'bg-red-50 border-2 border-red-300 text-red-600 hover:bg-red-100'
                          : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                      } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {favoriteLoading ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                      )}
                      <span>{isFavorited ? 'Đã yêu thích' : 'Thêm vào yêu thích'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Stats - Enhanced */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: Bed, value: property.Bedrooms || 0, label: 'Phòng ngủ' },
              { icon: Bath, value: property.Bathrooms || 0, label: 'Phòng tắm' },
              { icon: Square, value: property.Area || 0, label: 'm²' },
              { icon: CheckCircle, value: property.Status, label: 'Trạng thái' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                whileHover={{ scale: 1.05 }}
              >
                <stat.icon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              {/* Description */}
              {property.Description && (
                <motion.div 
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                    Mô tả
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">{property.Description}</p>
                </motion.div>
              )}

              {/* Detailed Information Card */}
              <motion.div 
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 hover:border-emerald-200"
              >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                    Thông tin chi tiết
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      {[
                        { icon: MapPin, label: 'Địa chỉ', value: property.Address },
                        { icon: Home, label: 'Loại nhà', value: property.HouseType || 'Chưa cập nhật' },
                        { icon: null, label: 'Hướng nhà', value: property.Orientation || 'Chưa cập nhật', customIcon: true }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          className="flex items-start group"
                          whileHover={{ x: 5 }}
                        >
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                            {item.customIcon ? (
                              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                              </svg>
                            ) : (
                              <item.icon className="w-6 h-6 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                            <div className="font-semibold text-gray-900">{item.value}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="space-y-5">
                      {[
                        { icon: User, label: 'Người đăng', value: property.Owner?.FullName || property.user?.FullName || property.user?.fullName || 'Chưa cập nhật' },
                        { icon: Mail, label: 'Email', value: maskEmail(property.Owner?.Email || property.user?.Email || property.user?.email) },
                        { icon: Calendar, label: 'Ngày đăng', value: dayjs(property.CreatedAt).format('DD/MM/YYYY') }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          className="flex items-start group"
                          whileHover={{ x: 5 }}
                        >
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                            <item.icon className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                            <div className="font-semibold text-gray-900">{item.value}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

              {/* IoT Devices Section */}
              <motion.div 
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300 hover:border-emerald-200"
              >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <Home className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif' }}>
                      Thiết bị IoT
                    </h2>
                  </div>
                  
                  {iotDevices && iotDevices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {iotDevices.map((device, index) => (
                        <motion.div 
                          key={device.DeviceID || index}
                          className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300"
                          whileHover={{ scale: 1.05 }}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                              {getDeviceIcon(device.DeviceType)}
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                            {device.DeviceName || 'Thiết bị IoT'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {device.DeviceType || 'Unknown'}
                          </p>
                          {device.Status && (
                            <span className={`inline-block px-3 py-1 text-xs rounded-full font-semibold ${
                              device.Status === 'Active' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {device.Status}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600 text-lg mb-2">Nhà này chưa có thiết bị IoT nào được kích hoạt</p>
                      <p className="text-gray-500 text-sm">Liên hệ chủ nhà để biết thêm thông tin về các thiết bị thông minh</p>
                    </div>
                  )}
                </motion.div>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:sticky lg:top-6 h-fit space-y-6">
              {/* Seller Information Card */}
              {(property.Owner || property.user) && (
                <motion.div 
                  variants={slideInLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                      Thông tin Seller
                    </h2>
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-xl">
                        {((property.Owner?.FullName || property.user?.FullName || property.user?.fullName || 'S')[0]).toUpperCase()}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                        {property.Owner?.FullName || property.user?.FullName || property.user?.fullName || 'Chưa cập nhật'}
                      </h3>
                      <div className="space-y-3 w-full">
                        <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl p-3">
                          <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                          <span className="text-sm">{maskEmail(property.Owner?.Email || property.user?.Email || property.user?.email)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 rounded-xl p-3">
                          <Phone className="w-4 h-4 mr-2 text-emerald-600" />
                          <span className="text-sm">{maskPhone(property.Owner?.PhoneNumber || property.user?.PhoneNumber || property.user?.phone)}</span>
                        </div>
                        <div className="flex justify-center">
                          <span className="px-4 py-2 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                            {property.Owner?.Role || property.user?.Role || property.user?.role || 'Seller'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/seller/${property.OwnerID}/properties`}
                      className="w-full inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Xem nhà khác
                    </Link>
                  </motion.div>
              )}

              {/* Quick Contact Form */}
              <motion.div 
                variants={slideInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-300"
              >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                    Liên hệ nhanh
                  </h2>
                  <form onSubmit={handleQuickContact} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên của bạn</label>
                      <input
                        type="text"
                        value={quickContactName}
                        onChange={(e) => setQuickContactName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Nhập tên của bạn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={quickContactPhone}
                        onChange={(e) => setQuickContactPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tin nhắn</label>
                      <textarea
                        value={quickContactMessage}
                        onChange={(e) => setQuickContactMessage(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                        placeholder="Nhập tin nhắn của bạn..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={quickContactSubmitting}
                      className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {quickContactSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                    </button>
                  </form>
                </motion.div>
            </div>
          </div>

        </div>
      </div>

      {/* Viewing Modal */}
      {showViewingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Đặt lịch xem nhà</h2>
                <button 
                  type="button" 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowViewingModal(false)}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Chọn thời gian phù hợp với bạn</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleScheduleViewing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày xem nhà</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={viewingDate}
                    onChange={(e) => setViewingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giờ xem nhà</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={viewingTime}
                    onChange={(e) => setViewingTime(e.target.value)}
                    required
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Seller sẽ xác nhận lịch hẹn của bạn trong thời gian sớm nhất
                  </p>
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <button 
                    type="button" 
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                    onClick={() => setShowViewingModal(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all hover:shadow-lg"
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
