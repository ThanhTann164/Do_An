import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import PackageBadge from '../../components/PackageBadge';
import { PackageContext } from '../../context/PackageContext';
import provincesData from '../../data/vietnam-provinces.json';
import { useAuth } from '../../contexts/AuthContext';
import PackageFeatureGuard from '../../components/PackageFeatureGuard';
import aiService from '../../services/aiService';
import { toast } from 'react-toastify';
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
  Plus,
  X
} from 'lucide-react';

export default function CreatePost() {
  const navigate = useNavigate();
  const { hasFeature, getPackageRules, isFreePlan, isProPlan, isPremiumPlan, userPackage, packageLoading, user: authUser } = useAuth();
  const { packageInfo: packageSummary, detail: packageDetail } = useContext(PackageContext);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    propertyType: '',
    contactName: '',
    contactPhone: '',
    iotDevices: []
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState({ title: false, description: false, marketAnalysis: false });
  const [marketAnalysisResult, setMarketAnalysisResult] = useState(null);
  
  // State cho địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const normalizedRole = (authUser?.role || '').toLowerCase();
  const isSeller = normalizedRole === 'seller';
  const detailSource = packageDetail || userPackage;
  const currentPackageName = isSeller
    ? (packageSummary?.packageName || detailSource?.userPackage?.display_name || detailSource?.userPackage?.name || 'Gói Miễn Phí')
    : null;
  const packageExpiry = isSeller ? detailSource?.userPackage?.expires_at : null;
  const packageExpired = packageExpiry ? new Date(packageExpiry) < new Date() : false;
  const daysLeft = packageExpiry ? Math.max(0, Math.ceil((new Date(packageExpiry) - new Date()) / (1000 * 60 * 60 * 24))) : null;
  const postLimits = isSeller ? userPackage?.limits?.posts : null;
  const boostLimits = isSeller ? userPackage?.limits?.boost : null;
  const formatDate = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Không giới hạn';
  const planStatusText = isSeller
    ? (packageLoading ? 'Đang đồng bộ gói...' : packageExpired ? 'Gói đã hết hạn' : daysLeft !== null ? `${daysLeft} ngày còn lại` : 'Không giới hạn thời gian')
    : '';
  const planExpiryText = isSeller ? (packageExpiry ? `Hết hạn: ${formatDate(packageExpiry)}` : 'Không giới hạn thời gian') : '';

  // Danh sách thiết bị IoT có sẵn
  const availableIoTDevices = [
    { id: 'smart_light', name: 'Đèn thông minh', type: 'Light', icon: Lightbulb },
    { id: 'smart_lock', name: 'Khóa thông minh', type: 'Smart Lock', icon: Lock },
    { id: 'security_camera', name: 'Camera an ninh', type: 'Camera', icon: Camera },
    { id: 'temp_sensor', name: 'Cảm biến nhiệt độ', type: 'Temperature Sensor', icon: Thermometer },
    { id: 'smart_fan', name: 'Quạt thông minh', type: 'Fan', icon: Fan },
    { id: 'air_conditioner', name: 'Điều hòa thông minh', type: 'Air Conditioner', icon: Snowflake },
    { id: 'security_system', name: 'Hệ thống bảo mật', type: 'Security System', icon: Shield },
    { id: 'smart_plug', name: 'Ổ cắm thông minh', type: 'Smart Plug', icon: Smartphone },
    { id: 'smoke_detector', name: 'Cảm biến khói', type: 'Smoke Detector', icon: Shield },
    { id: 'motion_sensor', name: 'Cảm biến chuyển động', type: 'Motion Sensor', icon: Camera }
  ];

  // Load dữ liệu địa chỉ từ JSON
  useEffect(() => {
    setProvinces(provincesData);
  }, []);

  // Cập nhật districts khi chọn city
  useEffect(() => {
    if (formData.city) {
      const selectedProvince = provinces.find(p => p.name === formData.city);
      if (selectedProvince && selectedProvince.districts) {
        setDistricts(selectedProvince.districts);
      } else {
        setDistricts([]);
      }
      setFormData(prev => ({
        ...prev,
        district: '',
        ward: ''
      }));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [formData.city, provinces]);

  // Cập nhật wards khi chọn district
  useEffect(() => {
    if (formData.district && districts.length > 0) {
      const selectedDistrict = districts.find(d => d.name === formData.district);
      if (selectedDistrict && selectedDistrict.wards) {
        setWards(selectedDistrict.wards);
      } else {
        setWards([]);
      }
      setFormData(prev => ({
        ...prev,
        ward: ''
      }));
    } else {
      setWards([]);
    }
  }, [formData.district, districts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thêm thiết bị IoT
  const handleAddIoTDevice = (device) => {
    if (!formData.iotDevices.find(d => d.id === device.id)) {
      setFormData(prev => ({
        ...prev,
        iotDevices: [...prev.iotDevices, device]
      }));
    }
  };

  // Xử lý xóa thiết bị IoT
  const handleRemoveIoTDevice = (deviceId) => {
    setFormData(prev => ({
      ...prev,
      iotDevices: prev.iotDevices.filter(d => d.id !== deviceId)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postFormData = new FormData();
      postFormData.append('title', formData.title);
      postFormData.append('description', formData.description);
      postFormData.append('price', formData.price);
      postFormData.append('propertyType', formData.propertyType);
      postFormData.append('area', formData.area);
      postFormData.append('city', formData.city);
      postFormData.append('district', formData.district);
      postFormData.append('ward', formData.ward);
      postFormData.append('address', formData.address);
      postFormData.append('bedrooms', formData.bedrooms);
      postFormData.append('bathrooms', formData.bathrooms);
      postFormData.append('contactName', formData.contactName);
      postFormData.append('contactPhone', formData.contactPhone);
      
      // Thêm IoT devices
      postFormData.append('iotDevices', JSON.stringify(formData.iotDevices));
      
      images.forEach((image) => {
        postFormData.append('images', image);
      });

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        body: postFormData,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('✅ Tạo bài đăng thành công! Bài đăng đang chờ Admin duyệt.');
        navigate('/posts');
      } else {
        const error = await response.json();
        alert(`❌ Có lỗi xảy ra: ${error.message || 'Vui lòng thử lại'}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('❌ Có lỗi xảy ra khi tạo bài đăng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">
                <i className="fas fa-plus-circle me-3"></i>Tạo bài đăng mới
              </h1>
              <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="200">
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Thông tin bài đăng</h4>
                    {/* Package Limits Info */}
                    {isSeller && (
                      <div className="text-end">
                        <PackageBadge />
                        <div className="text-xs text-white-50 mt-1">
                          {planStatusText}
                        </div>
                        <div className="text-xs text-white-50">
                          {planExpiryText}
                        </div>
                        <div className="text-xs text-white fw-semibold mt-1">
                          Bài/ngày: {postLimits?.daily === -1 ? '∞' : (postLimits?.daily || 0)} • Boost/ngày: {boostLimits?.per_day === -1 ? '∞' : (boostLimits?.per_day || 0)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {isSeller && (
                    <div className="alert alert-info bg-blue-50 border border-blue-100 text-blue-900 rounded-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                      <div>
                        <p className="mb-1 fw-semibold text-uppercase text-xs">Gói hiện tại</p>
                        <p className="mb-0 fw-bold">{currentPackageName}</p>
                        <small>{planStatusText}</small>
                      </div>
                      <div className="text-sm text-blue-700">
                        <div>Bài/ngày: {postLimits?.daily === -1 ? 'Không giới hạn' : (postLimits?.daily || 0)}</div>
                        <div>Boost/ngày: {boostLimits?.per_day === -1 ? 'Không giới hạn' : (boostLimits?.per_day || 0)}</div>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label mb-0">Tiêu đề <span className="text-danger">*</span></label>
                          
                          {/* AI Title Optimization Button */}
                          <PackageFeatureGuard feature="ai_tools" requiredPackages={['PRO', 'PREMIUM']}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={aiLoading.title || !formData.title}
                              onClick={async () => {
                                if (!formData.title) {
                                  alert('Vui lòng nhập tiêu đề trước khi tối ưu');
                                  return;
                                }
                                try {
                                  setAiLoading(prev => ({ ...prev, title: true }));
                                  const result = await aiService.optimizeTitle({
                                    title: formData.title,
                                    house_type: formData.propertyType,
                                    price: formData.price ? parseInt(formData.price) : null,
                                    location: formData.district ? `${formData.district}, ${formData.city}` : formData.city
                                  });
                                  if (result.success && result.data?.optimized_title) {
                                    setFormData(prev => ({ ...prev, title: result.data.optimized_title }));
                                    
                                    // TASK 2: Handle fallback response
                                    if (result.isFallback) {
                                      alert('⚠️ Hệ thống AI đang bận, đã sử dụng mẫu tiêu đề có sẵn.');
                                    } else {
                                      alert('✨ Tối ưu tiêu đề thành công!');
                                    }
                                  } else {
                                    alert(result.message || 'Có lỗi xảy ra khi tối ưu tiêu đề');
                                  }
                                } catch (error) {
                                  console.error('AI optimize title error:', error);
                                  const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
                                  alert(`❌ ${errorMsg}`);
                                } finally {
                                  setAiLoading(prev => ({ ...prev, title: false }));
                                }
                              }}
                            >
                              {aiLoading.title ? '⏳ Đang xử lý...' : '✨ AI Tối ưu tiêu đề'}
                            </button>
                          </PackageFeatureGuard>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="form-label">Loại bất động sản <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Chọn loại bất động sản</option>
                          <option value="Apartment">Căn hộ chung cư</option>
                          <option value="Townhouse">Nhà phố</option>
                          <option value="Villa">Biệt thự</option>
                          <option value="Land">Đất nền</option>
                          <option value="Office">Văn phòng</option>
                          <option value="Shop">Cửa hàng</option>
                          <option value="Other">Khác</option>
                        </select>
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="form-label">Địa chỉ <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tỉnh/Thành phố <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          {provinces.map(province => (
                            <option key={province.code} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Quận/Huyện <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          required
                          disabled={!formData.city}
                        >
                          <option value="">{districts.length > 0 ? 'Chọn quận/huyện' : 'Chọn tỉnh/thành phố trước'}</option>
                          {districts.map(district => (
                            <option key={district.code} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phường/Xã <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="ward"
                          value={formData.ward}
                          onChange={handleChange}
                          required
                          disabled={!formData.district}
                        >
                          <option value="">{wards.length > 0 ? 'Chọn phường/xã' : 'Chọn quận/huyện trước'}</option>
                          {wards.map(ward => (
                            <option key={ward.code} value={ward.name}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Giá (VNĐ) <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="5000000000"
                          required
                        />
                        
                        {/* AI Market Analysis Section - PREMIUM only */}
                        {authUser?.currentPackage?.name === 'PREMIUM' && (
                          <div className="mt-3 p-3 rounded" style={{ 
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <label className="form-label mb-0 fw-bold">
                                🤖 AI Định Giá & Phân Tích
                              </label>
                              <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '600',
                                boxShadow: '0 2px 4px rgba(245, 87, 108, 0.3)'
                              }}
                              disabled={aiLoading.marketAnalysis || !formData.district || !formData.city || !formData.propertyType || !formData.area}
                              onClick={async () => {
                                if (!formData.district || !formData.city || !formData.propertyType || !formData.area) {
                                  alert('Vui lòng điền đầy đủ: Vị trí, Loại nhà, Diện tích');
                                  return;
                                }
                                try {
                                  setAiLoading(prev => ({ ...prev, marketAnalysis: true }));
                                  setMarketAnalysisResult(null);
                                  
                                  // Build location string
                                  const location = [formData.ward, formData.district, formData.city]
                                    .filter(Boolean)
                                    .join(', ');
                                  
                                  const result = await aiService.analyzeMarketNew({
                                    location: location,
                                    price: formData.price ? parseInt(formData.price) : null,
                                    area: formData.area ? parseFloat(formData.area) : null,
                                    propertyType: formData.propertyType
                                  });
                                  
                                  // TASK 2: Handle fallback response
                                  if (result.success && result.data) {
                                    setMarketAnalysisResult(result.data);
                                    
                                    if (result.isFallback) {
                                      toast.warning('⚠️ Hệ thống AI đang bận, đã sử dụng phân tích mặc định.');
                                    } else if (result.fromCache) {
                                      toast.info('📊 Phân tích thị trường (Từ cache)');
                                    } else {
                                      toast.success('📊 Phân tích thị trường thành công!');
                                    }
                                  } else {
                                    toast.error(result.message || 'Có lỗi xảy ra khi phân tích');
                                  }
                                } catch (error) {
                                  console.error('AI market analysis error:', error);
                                  const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
                                  toast.error(`❌ ${errorMsg}`);
                                } finally {
                                  setAiLoading(prev => ({ ...prev, marketAnalysis: false }));
                                }
                              }}
                            >
                              {aiLoading.marketAnalysis ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Đang phân tích...
                                </>
                              ) : (
                                'Phân tích thị trường'
                              )}
                            </button>
                          </div>
                          
                          {/* Market Analysis Results */}
                          {marketAnalysisResult && (
                            <div className="mt-3 p-3 bg-white rounded border" style={{ borderColor: '#dee2e6' }}>
                              {/* Valuation */}
                              <div className="mb-3">
                                <strong className="d-block mb-2">📊 Đánh giá giá:</strong>
                                <span className={`badge ${marketAnalysisResult.valuation === 'Rẻ' ? 'bg-success' : marketAnalysisResult.valuation === 'Đắt' ? 'bg-danger' : 'bg-warning'} fs-6`}>
                                  {marketAnalysisResult.valuation}
                                </span>
                              </div>
                              
                              {/* Pros */}
                              {marketAnalysisResult.pros && marketAnalysisResult.pros.length > 0 && (
                                <div className="mb-3">
                                  <strong className="d-block mb-2 text-success">✅ Ưu điểm:</strong>
                                  <ul className="mb-0" style={{ listStyle: 'none', paddingLeft: 0 }}>
                                    {marketAnalysisResult.pros.map((pro, index) => (
                                      <li key={index} className="text-success mb-1">
                                        <span className="me-2">✓</span>
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Cons */}
                              {marketAnalysisResult.cons && marketAnalysisResult.cons.length > 0 && (
                                <div>
                                  <strong className="d-block mb-2 text-danger">⚠️ Nhược điểm:</strong>
                                  <ul className="mb-0" style={{ listStyle: 'none', paddingLeft: 0 }}>
                                    {marketAnalysisResult.cons.map((con, index) => (
                                      <li key={index} className="text-danger mb-1">
                                        <span className="me-2">✗</span>
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Diện tích (m²) <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          placeholder="120"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Số phòng ngủ <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Số phòng tắm <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-12 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label mb-0">Mô tả</label>
                          
                          {/* AI Description Buttons - PREMIUM only */}
                          {authUser?.currentPackage?.name === 'PREMIUM' && (
                            <div className="d-flex gap-2">
                              {/* Generate New Description */}
                              <button
                                type="button"
                                className="btn btn-sm"
                                style={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  border: 'none',
                                  fontWeight: '600',
                                  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
                                }}
                                disabled={aiLoading.description || !formData.address || !formData.propertyType || !formData.area}
                            onClick={async () => {
                              if (!formData.address || !formData.propertyType || !formData.area) {
                                alert('Vui lòng điền đầy đủ: Địa chỉ, Loại nhà, Diện tích');
                                return;
                              }
                              try {
                                setAiLoading(prev => ({ ...prev, description: true }));
                                
                                // Extract features from IoT devices
                                const features = formData.iotDevices.map(deviceId => {
                                  const device = availableIoTDevices.find(d => d.id === deviceId);
                                  return device ? device.name : deviceId;
                                });
                                
                                // Build location string
                                const location = [formData.ward, formData.district, formData.city]
                                  .filter(Boolean)
                                  .join(', ');
                                
                                const result = await aiService.generateDescription({
                                  propertyType: formData.propertyType,
                                  location: location || formData.address,
                                  features: features.length > 0 ? features : ['đầy đủ tiện ích'],
                                  area: formData.area ? parseFloat(formData.area) : null,
                                  price: formData.price ? parseInt(formData.price) : null
                                });
                                
                                // TASK 2: Handle fallback response
                                if (result.success && result.description) {
                                  setFormData(prev => ({ ...prev, description: result.description }));
                                  
                                  // Show warning if fallback
                                  if (result.isFallback) {
                                    alert('⚠️ Hệ thống AI đang bận, đã sử dụng mẫu mô tả có sẵn.');
                                  } else if (result.fromCache) {
                                    alert('✨ AI đã tạo mô tả thành công! (Từ cache)');
                                  } else {
                                    alert('✨ AI đã tạo mô tả thành công!');
                                  }
                                } else {
                                  alert(result.message || 'Có lỗi xảy ra khi tạo mô tả');
                                }
                              } catch (error) {
                                console.error('AI generate description error:', error);
                                const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
                                alert(`❌ ${errorMsg}`);
                              } finally {
                                setAiLoading(prev => ({ ...prev, description: false }));
                              }
                            }}
                            >
                              {aiLoading.description ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Đang xử lý...
                                </>
                              ) : (
                                '✨ AI Viết Mô Tả'
                              )}
                              </button>
                              
                              {/* Optimize Existing Description */}
                              {formData.description && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  disabled={aiLoading.description || !formData.propertyType || !formData.city}
                                  onClick={async () => {
                                    if (!formData.propertyType || !formData.city) {
                                      alert('Vui lòng điền đầy đủ: Loại nhà, Tỉnh/Thành phố');
                                      return;
                                    }
                                    try {
                                      setAiLoading(prev => ({ ...prev, description: true }));
                                      
                                      // Build location string
                                      const location = [formData.ward, formData.district, formData.city]
                                        .filter(Boolean)
                                        .join(', ') || formData.address;
                                      
                                      const result = await aiService.optimizeDescription({
                                        raw_description: formData.description,
                                        house_type: formData.propertyType,
                                        location: location,
                                        price: formData.price ? parseInt(formData.price) : null,
                                        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
                                        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null
                                      });
                                      
                                      if (result.success && result.data?.optimized_description) {
                                        setFormData(prev => ({ ...prev, description: result.data.optimized_description }));
                                        
                                        // TASK 2: Handle fallback response with toast
                                        if (result.isFallback) {
                                          toast.warning('⚠️ Hệ thống AI đang bận, đã sử dụng mẫu mô tả có sẵn.');
                                        } else {
                                          toast.success('✨ AI đã tối ưu mô tả thành công!');
                                        }
                                      } else {
                                        toast.error(result.message || 'Có lỗi xảy ra khi tối ưu mô tả');
                                      }
                                    } catch (error) {
                                      console.error('AI optimize description error:', error);
                                      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
                                      alert(`❌ ${errorMsg}`);
                                    } finally {
                                      setAiLoading(prev => ({ ...prev, description: false }));
                                    }
                                  }}
                                >
                                  {aiLoading.description ? '⏳...' : '✨ Tối ưu mô tả'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <textarea
                          className="form-control"
                          name="description"
                          rows="4"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Mô tả chi tiết về bất động sản..."
                        ></textarea>
                      </div>

                      {/* Video Panorama Upload - PREMIUM only */}
                      <PackageFeatureGuard feature="video_panorama" requiredPackages={['PREMIUM']}>
                        <div className="col-md-12 mb-4">
                          <label className="form-label">
                            📹 Video Panorama 360° <span className="badge bg-warning text-dark ms-2">PREMIUM</span>
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            accept="video/*"
                            onChange={(e) => console.log('Panorama video:', e.target.files[0])}
                          />
                          <small className="text-muted">Upload video 360° để tăng tính hấp dẫn</small>
                        </div>
                      </PackageFeatureGuard>

                      {/* Highlight Feature - PRO/PREMIUM */}
                      <PackageFeatureGuard feature="highlight" requiredPackages={['PRO', 'PREMIUM']}>
                        <div className="col-md-12 mb-4">
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="highlightPost" />
                            <label className="form-check-label" htmlFor="highlightPost">
                              ⭐ Làm nổi bật bài viết {isPremiumPlan() && <span className="text-warning">(PREMIUM ưu tiên hiển thị)</span>}
                            </label>
                          </div>
                        </div>
                      </PackageFeatureGuard>

                      {/* IoT Devices Section */}
                      <div className="col-md-12 mb-4">
                        <label className="form-label">
                          <Home className="w-5 h-5 inline mr-2 text-primary" />
                          Thiết bị IoT trong nhà
                        </label>
                        <p className="text-muted small mb-3">Chọn các thiết bị thông minh có trong căn nhà để thu hút người mua</p>
                        
                        {/* Selected Devices */}
                        {formData.iotDevices.length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-success mb-2">
                              <Shield className="w-4 h-4 inline mr-1" />
                              Thiết bị đã chọn ({formData.iotDevices.length})
                            </h6>
                            <div className="row g-2">
                              {formData.iotDevices.map((device) => {
                                const IconComponent = device.icon;
                                return (
                                  <div key={device.id} className="col-md-4 col-sm-6">
                                    <div className="card border-success" style={{ borderRadius: '12px' }}>
                                      <div className="card-body p-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                          <div className="d-flex align-items-center">
                                            <IconComponent className="w-5 h-5 text-success me-2" />
                                            <span className="small fw-medium">{device.name}</span>
                                          </div>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger rounded-circle p-1"
                                            onClick={() => handleRemoveIoTDevice(device.id)}
                                            style={{ width: '24px', height: '24px' }}
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Available Devices */}
                        <div>
                          <h6 className="text-primary mb-2">
                            <Plus className="w-4 h-4 inline mr-1" />
                            Chọn thiết bị có sẵn
                          </h6>
                          <div className="row g-2">
                            {availableIoTDevices
                              .filter(device => !formData.iotDevices.find(d => d.id === device.id))
                              .map((device) => {
                                const IconComponent = device.icon;
                                return (
                                  <div key={device.id} className="col-md-3 col-sm-4 col-6">
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary w-100 p-3 text-start"
                                      style={{ borderRadius: '12px', minHeight: '70px' }}
                                      onClick={() => handleAddIoTDevice(device)}
                                    >
                                      <div className="d-flex align-items-center">
                                        <IconComponent className="w-5 h-5 text-primary me-2 flex-shrink-0" />
                                        <span className="small fw-medium">{device.name}</span>
                                      </div>
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {formData.iotDevices.length === 0 && (
                          <div className="alert alert-info mt-3" role="alert">
                            <Home className="w-4 h-4 inline me-1" />
                            <small>Chưa chọn thiết bị nào. Hãy chọn các thiết bị IoT có trong nhà để tăng sức hấp dẫn cho bài đăng!</small>
                          </div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tên người liên hệ <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleChange}
                          placeholder="Nguyễn Văn A"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Số điện thoại liên hệ <span className="text-danger">*</span></label>
                        <input
                          type="tel"
                          className="form-control"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          placeholder="0901234567"
                          required
                        />
                      </div>

                      <div className="col-md-12 mb-3">
                        <label className="form-label">Hình ảnh</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                        <small className="text-muted">Bạn có thể chọn nhiều hình ảnh</small>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                      <Link to="/posts" className="btn btn-secondary">
                        <i className="fas fa-times me-2"></i>Hủy
                      </Link>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>Tạo bài đăng
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

