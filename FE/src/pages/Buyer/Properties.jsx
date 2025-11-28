import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import '../../styles/properties-premium.css';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    direction: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    city: ''
  });

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allProperties]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/houses', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const propertiesData = Array.isArray(data) ? data : (data.data || []);
        setAllProperties(propertiesData);
        setProperties(propertiesData);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProperties];

    if (filters.direction) {
      filtered = filtered.filter(p => p.Orientation === filters.direction);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.Price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.Price <= parseFloat(filters.maxPrice));
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(p => p.Bedrooms >= parseInt(filters.bedrooms));
    }

    if (filters.city) {
      filtered = filtered.filter(p => 
        p.Address?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    setProperties(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      direction: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      city: ''
    });
  };

  const getDriveViewUrl = (img) => {
    if (!img) return null;
    if (img.DriveFileID) return `https://drive.google.com/uc?export=view&id=${img.DriveFileID}`;
    if (img.CloudPath) {
      try {
        const u = new URL(img.CloudPath);
        const id = u.searchParams.get('id');
        if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
      } catch(error) {
        console.log("Đã có lỗi xảy ra:", error.message);
      }
      return img.CloudPath;
    }
    return img.ImageUrl || null;
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  // Loading Skeleton Component
  const PropertySkeleton = () => (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Hero Section */}
      <div className="properties-hero" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="properties-hero-content">
          <h1 className="page-title">Danh sách bất động sản</h1>
          <p className="text-white/80 text-lg mt-2">Khám phá những căn nhà tuyệt vời</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-gray-50/50">
        <div className="properties-container">
          {/* Premium Filter Bar */}
          <div className="filter-bar">
            <h2 className="filter-title">Bộ lọc tìm kiếm</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Direction Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hướng nhà</label>
                <select 
                  className="filter-select w-full"
                  value={filters.direction}
                  onChange={(e) => handleFilterChange('direction', e.target.value)}
                >
                  <option value="">Tất cả hướng</option>
                  <option value="Đông">Đông</option>
                  <option value="Tây">Tây</option>
                  <option value="Nam">Nam</option>
                  <option value="Bắc">Bắc</option>
                  <option value="Đông Bắc">Đông Bắc</option>
                  <option value="Đông Nam">Đông Nam</option>
                  <option value="Tây Bắc">Tây Bắc</option>
                  <option value="Tây Nam">Tây Nam</option>
                </select>
              </div>

              {/* Min Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá từ</label>
                <input
                  type="number"
                  className="filter-input w-full"
                  placeholder="0 VNĐ"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              {/* Max Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá đến</label>
                <input
                  type="number"
                  className="filter-input w-full"
                  placeholder="Không giới hạn"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              {/* Bedrooms Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phòng ngủ</label>
                <select 
                  className="filter-select w-full"
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="1">1+ phòng</option>
                  <option value="2">2+ phòng</option>
                  <option value="3">3+ phòng</option>
                  <option value="4">4+ phòng</option>
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <input
                  type="text"
                  className="filter-input w-full"
                  placeholder="Tìm theo địa chỉ..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
            </div>

            {/* Results Count & Reset */}
            <div className="flex items-center justify-between">
              <p className="results-count">
                Tìm thấy <span className="font-semibold text-gray-900">{properties.length}</span> kết quả
              </p>
              <button 
                className="reset-button"
                onClick={resetFilters}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="properties-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertySkeleton key={index} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy bất động sản</h3>
              <p className="text-gray-600 mb-4">Thử điều chỉnh bộ lọc để xem thêm kết quả</p>
              <button 
                className="reset-button text-base"
                onClick={resetFilters}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="properties-grid">
              {properties.map((property, index) => {
                const imgObj = property.houseimages?.find(i => i.IsCover) || property.houseimages?.[0];
                const imageUrl = getDriveViewUrl(imgObj) || '/images/img_1.jpg';
                const id = property.HouseID || property.id;

                return (
                  <div key={id} className="property-card-premium" style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Property Image */}
                    <Link to={`/property/${id}`} className="property-image-container block">
                      <img 
                        src={imageUrl} 
                        alt={property.HouseType || 'Property'} 
                        className="property-image"
                        onError={(e) => {
                          e.target.src = '/images/img_1.jpg';
                        }}
                      />
                      <div className="property-image-overlay"></div>
                    </Link>

                    {/* Property Content */}
                    <div className="property-content">
                      {/* Price */}
                      <div className="property-price">
                        {formatPrice(property.Price)}
                      </div>

                      {/* Location */}
                      <div className="property-location">
                        {property.Address}
                      </div>

                      {/* Title */}
                      <h3 className="property-title">
                        {property.HouseType || 'Bất động sản'}
                      </h3>

                      {/* Property Info */}
                      <div className="property-info-row">
                        <div className="property-info-item">
                          <svg className="property-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M7 13h10" />
                          </svg>
                          <span>{property.Bedrooms || 0} phòng ngủ</span>
                        </div>
                        <div className="property-info-item">
                          <svg className="property-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                          <span>{property.Bathrooms || 0} phòng tắm</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link
                        to={`/property/${id}`}
                        className="property-cta-button"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}