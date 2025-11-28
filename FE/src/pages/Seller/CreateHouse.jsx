import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import provincesData from '../../data/vietnam-provinces.json';

export default function CreateHouse() {
  const navigate = useNavigate();
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
    contactPhone: ''
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Dropdown data ---
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // State để lưu giá trị hiển thị (đã format)
  const [displayPrice, setDisplayPrice] = useState('');

  useEffect(() => {
    setCities(provincesData);
  }, []);

  // Hàm format số tiền theo VND
  const formatVND = (value) => {
    if (!value) return '';
    
    // Xóa tất cả ký tự không phải số
    const numericValue = value.toString().replace(/\D/g, '');
    
    // Format với dấu chấm phân cách
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Hàm chuyển từ chuỗi đã format về số nguyên
  const parseVND = (formattedValue) => {
    return formattedValue.replace(/\./g, '');
  };

  // Xử lý khi nhập giá
  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    
    // Format giá trị nhập vào
    const formattedValue = formatVND(inputValue);
    
    // Cập nhật giá trị hiển thị (có dấu chấm)
    setDisplayPrice(formattedValue);
    
    // Cập nhật giá trị thực (không dấu chấm) vào formData
    const numericValue = parseVND(formattedValue);
    setFormData(prev => ({
      ...prev,
      price: numericValue
    }));
  };

  const handleCityChange = (e) => {
    const cityCode = parseInt(e.target.value);
    const selectedCity = provincesData.find(p => p.code === cityCode);
    setFormData(prev => ({
      ...prev,
      city: selectedCity ? selectedCity.name : '',
      district: '',
      ward: ''
    }));
    setDistricts(selectedCity ? selectedCity.districts : []);
    setWards([]);
  };

  const handleDistrictChange = (e) => {
    const districtCode = parseInt(e.target.value);
    const selectedDistrict = districts.find(d => d.code === districtCode);
    setFormData(prev => ({
      ...prev,
      district: selectedDistrict ? selectedDistrict.name : '',
      ward: ''
    }));
    setWards(selectedDistrict ? selectedDistrict.wards : []);
  };

  const handleWardChange = (e) => {
    const wardCode = parseInt(e.target.value);
    const selectedWard = wards.find(w => w.code === wardCode);
    setFormData(prev => ({
      ...prev,
      ward: selectedWard ? selectedWard.name : ''
    }));
  };

  // --- Input change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  // --- Submit form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const houseFormData = new FormData();
      houseFormData.append('Title', formData.title);
      houseFormData.append('Description', formData.description);
      houseFormData.append('Price', formData.price); // Đã là số nguyên không dấu chấm
      houseFormData.append('HouseType', formData.propertyType);
      houseFormData.append('Area', formData.area);
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      houseFormData.append('Address', fullAddress);
      houseFormData.append('Bedrooms', formData.bedrooms);
      houseFormData.append('Bathrooms', formData.bathrooms);
      houseFormData.append('ContactName', formData.contactName);
      houseFormData.append('ContactPhone', formData.contactPhone);
      images.forEach((image) => {
        houseFormData.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('/api/houses', {
        method: 'POST',
        body: houseFormData,
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (response.ok) {
        alert('✅ Tạo nhà thành công!');
        navigate('/myhome', { replace: true, state: { refresh: true } });
      } else {
        const error = await response.json();
        alert(`❌ Có lỗi xảy ra: ${error.message || 'Vui lòng thử lại'}`);
      }
    } catch (error) {
      console.error('Error creating house:', error);
      alert('❌ Có lỗi xảy ra khi tạo nhà');
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
                <i className="icon-home me-3"></i>Thêm nhà mới
              </h1>
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
                  <h4 className="mb-0">Thông tin nhà</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">

                      {/* Title */}
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Tiêu đề <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Ví dụ: Nhà 3 tầng đẹp, giá tốt"
                          required
                        />
                      </div>

                      {/* Property Type */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Loại hình <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Chọn loại hình</option>
                          <option value="Apartment">Căn hộ</option>
                          <option value="Townhouse">Nhà phố</option>
                          <option value="Villa">Biệt thự</option>
                          <option value="Land">Đất nền</option>
                          <option value="Other">Khác</option>
                        </select>
                      </div>

                      {/* Price - ĐÃ SỬA ĐỂ AUTO-FORMAT */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Giá (VND) <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="price"
                          value={displayPrice}
                          onChange={handlePriceChange}
                          placeholder="Ví dụ: 5.000.000.000"
                          required
                        />
                        <small className="text-muted">
                          Giá sẽ tự động định dạng với dấu chấm phân cách
                        </small>
                      </div>

                      {/* Area */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Diện tích (m²) <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          placeholder="Ví dụ: 100"
                          required
                        />
                      </div>

                      {/* Bedrooms */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Phòng ngủ <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleChange}
                          placeholder="Ví dụ: 3"
                          required
                        />
                      </div>

                      {/* Bathrooms */}
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Phòng tắm <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleChange}
                          placeholder="Ví dụ: 2"
                          required
                        />
                      </div>

                      {/* City Dropdown */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tỉnh/Thành phố <span className="text-danger">*</span></label>
                        <select className="form-select" onChange={handleCityChange} required>
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {cities.map(city => (
                            <option key={city.code} value={city.code}>{city.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* District Dropdown */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Quận/Huyện <span className="text-danger">*</span></label>
                        <select className="form-select" onChange={handleDistrictChange} disabled={!districts.length} required>
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map(d => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Ward Dropdown */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phường/Xã <span className="text-danger">*</span></label>
                        <select className="form-select" onChange={handleWardChange} disabled={!wards.length} required>
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map(w => (
                            <option key={w.code} value={w.code}>{w.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Address */}
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Số nhà / Đường <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Ví dụ: 123 Đường ABC"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div className="col-12 mb-3">
                        <label className="form-label">Mô tả <span className="text-danger">*</span></label>
                        <textarea
                          className="form-control"
                          name="description"
                          rows="5"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Mô tả chi tiết về nhà..."
                          required
                        ></textarea>
                      </div>

                      {/* Images */}
                      <div className="col-12 mb-3">
                        <label className="form-label">Hình ảnh <span className="text-danger">*</span></label>
                        <input
                          type="file"
                          className="form-control"
                          multiple
                          accept="image/jpeg,image/png"
                          onChange={handleImageChange}
                          required
                        />
                        <small className="text-muted">
                          Chọn nhiều ảnh. Chỉ chấp nhận JPG và PNG, tối đa 5MB mỗi ảnh.
                        </small>
                        {images.length > 0 && (
                          <div className="mt-2">
                            <span className="badge bg-info">{images.length} ảnh đã chọn</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="d-flex gap-2 justify-content-end">
                      <Link to="/myhome" className="btn btn-secondary">
                        <i className="icon-close me-2"></i>Hủy
                      </Link>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="icon-check me-2"></i>Tạo nhà
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