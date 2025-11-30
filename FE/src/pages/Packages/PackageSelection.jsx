import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Sparkles, 
  Crown, 
  Zap, 
  Eye, 
  MessageCircle, 
  BarChart3, 
  Camera, 
  RefreshCw, 
  Shield, 
  Star,
  ArrowRight,
  Rocket,
  Home,
  TrendingUp,
  Video,
  Megaphone,
  Clock,
  Users,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { usePackage } from '../../hooks/usePackage';
import { packageService } from '../../services/packageService';
import { paymentService } from '../../services/paymentService';

const PackageSelection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState('vnpay');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const navigate = useNavigate();
  const { userPackage, fetchUserPackage } = usePackage();

  useEffect(() => {
    setIsVisible(true);
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await packageService.getAllPackages();
      
      if (response && response.success && response.data && response.data.packages) {
        // Map API data to UI format
        const mappedPackages = response.data.packages.map(pkg => {
          const packageType = (pkg.name || 'FREE').toUpperCase();
          return {
            id: pkg.id,
            name: pkg.name || 'FREE',
            displayName: pkg.display_name || 'Gói Miễn Phí',
            type: packageType,
            price: parseFloat(pkg.price) || 0,
            duration: `${pkg.duration_days || 30} ngày`,
            popular: packageType === 'PREMIUM',
            icon: getPackageIcon(packageType),
            buttonText: packageType === 'FREE' ? 'Sử dụng miễn phí' : `Mua ${packageType}`,
            buttonIcon: packageType === 'PREMIUM' ? <Crown className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />,
            features: getPackageFeatures(packageType)
          };
        });
        
        setPackages(mappedPackages);
      } else {
        throw new Error('Dữ liệu gói không hợp lệ');
      }
    } catch (err) {
      console.error('Error loading packages:', err);
      setError(err.message || 'Không thể tải danh sách gói. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getPackageIcon = (type) => {
    switch (type) {
      case 'FREE':
        return <Home className="w-7 h-7" />;
      case 'PRO':
        return <Zap className="w-7 h-7" />;
      case 'PREMIUM':
        return <Crown className="w-7 h-7" />;
      default:
        return <Home className="w-7 h-7" />;
    }
  };

  const getPackageFeatures = (type) => {
    const baseFeatures = [
      { name: 'Đăng tin cơ bản', included: true, icon: <Check className="w-5 h-5" /> },
      { name: 'Tìm kiếm bất động sản', included: true, icon: <Check className="w-5 h-5" /> },
      { name: 'Liên hệ trực tiếp', included: true, icon: <Check className="w-5 h-5" /> }
    ];

    switch (type) {
      case 'FREE':
        return [
          ...baseFeatures,
          { name: 'Số bài đăng: 1/ngày, 3/tháng', included: true, icon: <Check className="w-5 h-5" /> },
          { name: 'Tối đa 3 ảnh/bài', included: true, icon: <Check className="w-5 h-5" /> },
          { name: 'Tin nổi bật', included: false, icon: <X className="w-5 h-5" /> },
          { name: 'Boost tin đăng', included: false, icon: <X className="w-5 h-5" /> },
          { name: 'AI tối ưu nội dung', included: false, icon: <X className="w-5 h-5" /> },
          { name: 'Video panorama', included: false, icon: <X className="w-5 h-5" /> },
          { name: 'Banner quảng cáo', included: false, icon: <X className="w-5 h-5" /> }
        ];
      
      case 'PRO':
        return [
          ...baseFeatures,
          { name: 'Số bài đăng: 5/ngày, 20/tháng', included: true, icon: <Check className="w-5 h-5" /> },
          { name: 'Tối đa 10 ảnh/bài', included: true, icon: <Check className="w-5 h-5" /> },
          { name: 'Tin nổi bật (Highlight)', included: true, icon: <Check className="w-5 h-5" /> },
          { name: 'Boost 1 lần/ngày', included: true, icon: <Rocket className="w-5 h-5" /> },
          { name: 'AI tối ưu (title + mô tả)', included: true, icon: <Sparkles className="w-5 h-5" /> },
          { name: 'Video panorama', included: true, icon: <Video className="w-5 h-5" /> },
          { name: 'Badge "Verified Seller"', included: true, icon: <Shield className="w-5 h-5" /> },
          { name: 'Auto-refresh 24h', included: true, icon: <RefreshCw className="w-5 h-5" /> },
          { name: 'Ưu tiên hiển thị Level 2', included: true, icon: <TrendingUp className="w-5 h-5" /> },
          { name: 'Banner quảng cáo', included: false, icon: <X className="w-5 h-5" /> }
        ];
      
      case 'PREMIUM':
        return [
          ...baseFeatures,
          { name: 'Số bài đăng: Không giới hạn', included: true, icon: <Crown className="w-5 h-5" /> },
          { name: 'Tối đa 20 ảnh/bài', included: true, icon: <Check className="w-5 h-5" /> },
          { name: 'Tin nổi bật (Gold Highlight)', included: true, icon: <Crown className="w-5 h-5" /> },
          { name: 'Boost 3 lần/ngày', included: true, icon: <Rocket className="w-5 h-5" /> },
          { name: 'AI đầy đủ (5 công cụ)', included: true, icon: <Sparkles className="w-5 h-5" /> },
          { name: 'Video 360° panorama', included: true, icon: <Video className="w-5 h-5" /> },
          { name: 'Banner quảng cáo', included: true, icon: <Megaphone className="w-5 h-5" /> },
          { name: 'Badge "Verified Seller"', included: true, icon: <Shield className="w-5 h-5" /> },
          { name: 'Auto-refresh 24h', included: true, icon: <RefreshCw className="w-5 h-5" /> },
          { name: 'Ưu tiên SEO tối đa', included: true, icon: <TrendingUp className="w-5 h-5" /> },
          { name: 'Priority Chat', included: true, icon: <MessageCircle className="w-5 h-5" /> },
          { name: 'Analytics nâng cao', included: true, icon: <BarChart3 className="w-5 h-5" /> }
        ];
      
      default:
        return baseFeatures;
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const isCurrentPackage = (pkg) => {
    if (!userPackage) return false;
    return userPackage.name === pkg.type;
  };

  const handlePackageSelect = (pkg) => {
    if (pkg.type === 'FREE') {
      navigate('/');
      return;
    }

    if (isCurrentPackage(pkg)) {
      return; // Disabled
    }

    // Mở popup chọn cổng thanh toán
    setSelectedPackage(pkg);
    setSelectedGateway('vnpay');
  };

  const getPackageStyles = (pkg) => {
    const isCurrent = isCurrentPackage(pkg);
    const isHovered = hoveredCard === pkg.id;

    switch (pkg.type) {
      case 'FREE':
        return {
          cardBg: 'bg-gradient-to-br from-gray-50 to-gray-100',
          borderColor: 'border-gray-300',
          iconBg: 'bg-gradient-to-br from-gray-400 to-gray-500',
          buttonBg: 'bg-gradient-to-r from-gray-600 to-gray-700',
          glowColor: 'gray'
        };
      
      case 'PRO':
        return {
          cardBg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
          borderColor: 'border-blue-300',
          iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          buttonBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
          glowColor: 'blue'
        };
      
      case 'PREMIUM':
        return {
          cardBg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50',
          borderColor: 'border-yellow-400',
          iconBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500',
          buttonBg: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500',
          glowColor: 'yellow'
        };
      
      default:
        return {
          cardBg: 'bg-white',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-500',
          buttonBg: 'bg-gray-600',
          glowColor: 'gray'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách gói...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadPackages}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full mb-6 shadow-lg border border-purple-100">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700 font-semibold text-sm">Chọn gói phù hợp với bạn</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gói Dịch Vụ Đăng Tin
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tối ưu hiệu quả bán nhà với công nghệ AI tiên tiến.
            <span className="text-purple-600 font-semibold"> Tăng lượt xem lên đến 500%</span> và bán nhanh hơn 3x.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {packages.map((pkg, index) => {
            const styles = getPackageStyles(pkg);
            const isCurrent = isCurrentPackage(pkg);
            const isHovered = hoveredCard === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`
                  relative group
                  transition-all duration-500 ease-out
                  ${pkg.popular ? 'lg:scale-105 lg:-mt-2' : ''}
                  ${isVisible ? `opacity-100 translate-y-0` : 'opacity-0 translate-y-12'}
                  ${isCurrent ? 'opacity-75' : ''}
                `}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredCard(pkg.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Most Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 animate-pulse">
                      <Star className="w-4 h-4 fill-current" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Current Package Badge */}
                {isCurrent && (
                  <div className="absolute -top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>Đang sử dụng</span>
                    </div>
                  </div>
                )}

                {/* Card Container */}
                <div className={`
                  relative h-full p-8 rounded-[24px] backdrop-blur-md border-2 transition-all duration-300
                  ${pkg.popular 
                    ? `${styles.cardBg} border-transparent shadow-2xl` 
                    : `${styles.cardBg} ${styles.borderColor} shadow-xl`
                  }
                  ${isHovered ? 'scale-[1.03] shadow-2xl' : ''}
                  ${isCurrent ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}>
                  
                  {/* Premium Gold Border */}
                  {pkg.popular && (
                    <div className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 p-[2px] -z-10">
                      <div className={`h-full w-full rounded-[24px] ${styles.cardBg}`} />
                    </div>
                  )}

                  {/* Glow Effect on Hover */}
                  {isHovered && !isCurrent && (
                    <div className={`absolute inset-0 rounded-[24px] bg-${styles.glowColor}-400/20 blur-xl -z-20 opacity-75`} />
                  )}

                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`
                      inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 transition-all duration-300
                      ${styles.iconBg} text-white shadow-lg
                      ${isHovered ? 'scale-110 rotate-3' : ''}
                    `}>
                      {pkg.icon}
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      {pkg.displayName}
                    </h3>
                    
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      {pkg.price === 0 ? (
                        <span className="text-5xl font-bold text-gray-900">Miễn phí</span>
                      ) : (
                        <span className="text-5xl font-bold text-gray-900">
                          {formatPrice(pkg.price)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 font-medium mb-3">{pkg.duration}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8 min-h-[400px]">
                    {pkg.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className={`
                          flex items-start gap-3 transition-all duration-300
                          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                        `}
                        style={{ transitionDelay: `${(index * 150) + (idx * 50)}ms` }}
                      >
                        <div className={`
                          flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 mt-0.5
                          ${feature.included 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                          }
                          ${isHovered && feature.included ? 'bg-green-200 scale-110 shadow-md' : ''}
                        `}>
                          {feature.icon}
                        </div>
                        <span className={`
                          text-sm md:text-base font-medium transition-colors duration-200 leading-relaxed
                          ${feature.included ? 'text-gray-800' : 'text-gray-400'}
                          ${isHovered && feature.included ? 'text-gray-900 font-semibold' : ''}
                        `}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePackageSelect(pkg)}
                    disabled={isCurrent}
                    className={`
                      w-full py-4 px-6 rounded-2xl font-bold text-base md:text-lg transition-all duration-300 
                      flex items-center justify-center gap-2 group relative overflow-hidden
                      transform hover:scale-105 active:scale-95
                      ${isCurrent 
                        ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                        : pkg.type === 'FREE'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg hover:shadow-xl'
                        : pkg.popular
                        ? `${styles.buttonBg} text-white shadow-xl hover:shadow-2xl`
                        : `${styles.buttonBg} text-white shadow-lg hover:shadow-xl`
                      }
                    `}
                  >
                    {/* Ripple Effect */}
                    {!isCurrent && (
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    )}
                    
                    <span className="relative z-10 font-semibold">
                      {isCurrent ? 'Đang sử dụng' : pkg.buttonText}
                    </span>
                    {!isCurrent && (
                      <div className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">
                        {pkg.buttonIcon}
                      </div>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className={`
          transition-all duration-1000 delay-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <div className="bg-white/80 backdrop-blur-md rounded-[24px] p-8 md:p-12 max-w-5xl mx-auto shadow-xl border border-purple-100/50 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              🚀 Tại sao chọn gói Premium?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center space-y-3 group hover:scale-105 transition-transform duration-300 p-6 rounded-2xl hover:bg-purple-50/50">
                <div className="text-4xl group-hover:animate-bounce inline-block">📈</div>
                <h4 className="font-bold text-gray-900 text-lg">Tăng lượt xem 500%</h4>
                <p className="text-sm text-gray-600 leading-relaxed">AI tối ưu giúp tin đăng của bạn nổi bật và tiếp cận nhiều khách hàng hơn</p>
              </div>
              <div className="text-center space-y-3 group hover:scale-105 transition-transform duration-300 p-6 rounded-2xl hover:bg-pink-50/50">
                <div className="text-4xl group-hover:animate-bounce inline-block">⚡</div>
                <h4 className="font-bold text-gray-900 text-lg">Bán nhanh hơn 3x</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Boost và ưu tiên hiển thị hàng đầu giúp bạn bán nhanh chóng</p>
              </div>
              <div className="text-center space-y-3 group hover:scale-105 transition-transform duration-300 p-6 rounded-2xl hover:bg-indigo-50/50">
                <div className="text-4xl group-hover:animate-bounce inline-block">🎯</div>
                <h4 className="font-bold text-gray-900 text-lg">Tiếp cận đúng khách</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Analytics chi tiết và targeting thông minh giúp bạn tìm đúng khách hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateway Modal */}
        {selectedPackage && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-6 md:p-8 relative">
              <button
                onClick={() => !isCreatingPayment && setSelectedPackage(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Chọn phương thức thanh toán
                </h2>
                <p className="text-gray-600 text-sm">
                  Gói bạn chọn: <span className="font-semibold">{selectedPackage.displayName}</span> (
                  {selectedPackage.type})
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {/* MoMo */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('momo')}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${selectedGateway === 'momo'
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${selectedGateway === 'momo'
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300'}
                    `}
                  >
                    {selectedGateway === 'momo' && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Ví MoMo</div>
                      <div className="text-xs text-gray-600">
                        Thanh toán qua ví MoMo, QR Code, ATM
                      </div>
                    </div>
                  </div>
                </button>

                {/* VNPay */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('vnpay')}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${selectedGateway === 'vnpay'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${selectedGateway === 'vnpay'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'}
                    `}
                  >
                    {selectedGateway === 'vnpay' && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">VN</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">VNPay</div>
                      <div className="text-xs text-gray-600">
                        Thanh toán qua ví điện tử, thẻ ATM
                      </div>
                    </div>
                  </div>
                </button>

                {/* ZaloPay (optional) */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('zalopay')}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${selectedGateway === 'zalopay'
                      ? 'border-teal-500 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div
                    className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${selectedGateway === 'zalopay'
                        ? 'border-teal-500 bg-teal-500'
                        : 'border-gray-300'}
                    `}
                  >
                    {selectedGateway === 'zalopay' && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">ZP</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">ZaloPay</div>
                      <div className="text-xs text-gray-600">
                        Ví ZaloPay (tuỳ chọn nếu đã bật cấu hình)
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={isCreatingPayment}
                  onClick={() => setSelectedPackage(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isCreatingPayment}
                  onClick={() => {
                    if (!selectedPackage) return;
                    // Navigate to payment page instead of creating payment directly
                    navigate(`/package/payment?package_id=${selectedPackage.id}&gateway=${selectedGateway}`);
                  }}
                  className={`
                    flex-1 py-3 px-4 rounded-xl text-white text-sm font-semibold
                    bg-gradient-to-r from-purple-600 to-indigo-600
                    hover:from-purple-700 hover:to-indigo-700
                    disabled:opacity-60 disabled:cursor-not-allowed
                  `}
                >
                  Tiếp tục thanh toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageSelection;
