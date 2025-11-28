import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import provincesData from '../../data/vietnam-provinces.json';

// Component ảnh tối ưu - giữ nguyên
const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  style, 
  fallback = '/images/img_1.jpg'
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setImgSrc(fallback);
      setLoading(false);
      return;
    }

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setLoading(false);
    };
    
    img.onerror = () => {
      setImgSrc(fallback);
      setLoading(false);
    };
  }, [src, fallback]);

  return (
    <div className="position-relative">
      {loading && (
        <div 
          className="position-absolute top-50 start-50 translate-middle"
          style={{ zIndex: 1 }}
        >
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        style={{ 
          ...style, 
          opacity: loading ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        loading="lazy"
      />
    </div>
  );
};

// Hàm xử lý URL ảnh - giữ nguyên
const getDriveViewUrl = (img) => {
  if (!img) return null;
  
  if (img.DriveFileID) {
    return `https://drive.google.com/thumbnail?id=${img.DriveFileID}&sz=w800`;
  }
  
  if (img.CloudPath) {
    try {
      const patterns = [
        /\/d\/([^\/]+)/,
        /id=([^&]+)/,
        /\/file\/d\/([^\/]+)/
      ];
      
      for (const pattern of patterns) {
        const match = img.CloudPath.match(pattern);
        if (match && match[1]) {
          return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
        }
      }
      return img.CloudPath;
    } catch(e) {
      return img.CloudPath;
    }
  }
  
  return img.ImageUrl || null;
};

export default function MyHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State phân trang - THÊM VÀO
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // 6 nhà mỗi trang
  const [total, setTotal] = useState(0);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // State cho địa chỉ - giữ nguyên
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // State cho search
  const [searchParams, setSearchParams] = useState({
    address: '',
    minPrice: '',
    maxPrice: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [allHouses, setAllHouses] = useState([]); // Lưu tất cả nhà để search

  // Load dữ liệu địa chỉ từ JSON - giữ nguyên
  useEffect(() => {
    console.log('📊 [MyHome] Loaded provinces data:', provincesData);
    setProvinces(provincesData);
  }, []);

  // Các useEffect cho địa chỉ - giữ nguyên
  useEffect(() => {
    if (editFormData.city) {
      const selectedProvince = provinces.find(p => p.name === editFormData.city);
      console.log('🏙️ [MyHome] Selected province:', selectedProvince);
      
      if (selectedProvince && selectedProvince.districts) {
        setDistricts(selectedProvince.districts);
      } else {
        setDistricts([]);
      }
      setEditFormData(prev => ({
        ...prev,
        district: '',
        ward: ''
      }));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [editFormData.city, provinces]);

  useEffect(() => {
    if (editFormData.district && districts.length > 0) {
      const selectedDistrict = districts.find(d => d.name === editFormData.district);
      console.log('🏘️ [MyHome] Selected district:', selectedDistrict);
      
      if (selectedDistrict && selectedDistrict.wards) {
        setWards(selectedDistrict.wards);
      } else {
        setWards([]);
      }
      setEditFormData(prev => ({
        ...prev,
        ward: ''
      }));
    } else {
      setWards([]);
    }
  }, [editFormData.district, districts]);

  // Hàm parse địa chỉ - giữ nguyên
  const parseAddress = (addressString) => {
    if (!addressString) return { address: '', ward: '', district: '', city: '' };
    
    const parts = addressString.split(', ').map(part => part.trim());
    
    if (parts.length >= 4) {
      return {
        address: parts[0],
        ward: parts[1],
        district: parts[2],
        city: parts[3]
      };
    } else if (parts.length === 3) {
      return {
        address: parts[0],
        ward: parts[1],
        district: parts[2],
        city: ''
      };
    } else if (parts.length === 2) {
      return {
        address: parts[0],
        ward: parts[1],
        district: '',
        city: ''
      };
    } else if (parts.length === 1) {
      return {
        address: parts[0],
        ward: '',
        district: '',
        city: ''
      };
    }
    
    return { address: '', ward: '', district: '', city: '' };
  };

  // Fetch user data - giữ nguyên
  const fetchUserData = async () => {
    try {
      // Thử lấy từ localStorage trước (fallback)
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        try {
          const parsedUser = JSON.parse(userFromStorage);
          setUser(parsedUser);
          console.log('👤 [MyHome] User from localStorage:', parsedUser);
        } catch (e) {
          console.warn('Failed to parse user from localStorage:', e);
        }
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/user', {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data.data || data.user;
        setUser(userData);
        console.log('👤 [MyHome] User from API:', userData);
        // Cập nhật localStorage
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // SỬA LẠI: Fetch houses với phân trang
  const fetchMyHouses = async (pageArg = 1, pageSizeArg = 6) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = `/api/houses/my?page=${pageArg}&pageSize=${pageSizeArg}`;
      console.log(`📡 [MyHome] Fetching houses from: ${url}`);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Không thể tải danh sách nhà');
      }

      const result = await response.json();
      console.log('📦 [MyHome] API Response:', result);
      
      let housesData = [];
      let totalCount = 0;
      
      if (result.success) {
        // Xử lý cả hai trường hợp: result.data và result.pagination
        housesData = result.data || [];
        totalCount = result.total || result.pagination?.total || housesData.length;
      } else if (Array.isArray(result)) {
        // Fallback nếu API trả về trực tiếp mảng
        housesData = result;
        totalCount = result.length;
      }
      
      console.log(`✅ [MyHome] Loaded ${housesData.length} houses, total: ${totalCount}`);
      setHouses(housesData);
      setAllHouses(housesData); // Lưu tất cả nhà để search
      setTotal(totalCount);
      
    } catch (error) {
      console.error('❌ [MyHome] Error fetching houses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tất cả nhà để search (không phân trang)
  const fetchAllHouses = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `/api/houses/my?page=1&pageSize=1000`; // Lấy tất cả
      const response = await fetch(url, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const allHousesData = result.data || [];
          setAllHouses(allHousesData);
        }
      }
    } catch (error) {
      console.error('Error fetching all houses:', error);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchUserData();
    fetchMyHouses(1, pageSize);
    fetchAllHouses(); // Fetch tất cả nhà để search
  }, []);

  // Load lại dữ liệu khi page thay đổi (chỉ khi không đang search)
  useEffect(() => {
    if (!isSearching) {
      console.log(`🔄 [MyHome] Page changed to: ${page}`);
      fetchMyHouses(page, pageSize);
    }
  }, [page, isSearching]);

  // Refresh khi có state từ navigation - giữ nguyên
  useEffect(() => {
    if (location.state?.refresh) {
      console.log('🔄 [MyHome] Refreshing data after create/edit');
      fetchMyHouses(page, pageSize);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Hàm lấy ảnh - giữ nguyên
  const getDriveImageUrl = (house, index = 0) => {
    if (!house) return null;
    
    if (house.houseimages && house.houseimages.length > 0) {
      if (index === 0) {
        const coverImage = house.houseimages.find(img => img.IsCover);
        if (coverImage) {
          const url = getDriveViewUrl(coverImage);
          if (url) return url;
        }
      }
      
      if (house.houseimages.length > index) {
        const img = house.houseimages[index];
        const url = getDriveViewUrl(img);
        if (url) return url;
      }
    }
    
    if (house.driveImages && house.driveImages.length > index) {
      const driveImg = house.driveImages[index];
      if (driveImg && driveImg.id) {
        return `https://drive.google.com/thumbnail?id=${driveImg.id}&sz=w800`;
      }
    }
    
    return null;
  };

  // Các hàm xử lý - giữ nguyên
  const handleDelete = async (houseId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhà này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/houses/${houseId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Không thể xóa nhà');
      }

      alert('Xóa nhà thành công!');
      // Load lại trang hiện tại sau khi xóa
      fetchMyHouses(page, pageSize);
    } catch (error) {
      console.error('Error deleting house:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const handleEdit = (house) => {
    setSelectedHouse(house);
    const addressParts = parseAddress(house.Address);
    
    setEditFormData({
      title: house.Title || '',
      description: house.Description || '',
      price: house.Price || '',
      propertyType: house.HouseType || '',
      area: house.Area || '',
      address: addressParts.address || '',
      ward: addressParts.ward || '',
      district: addressParts.district || '',
      city: addressParts.city || house.City || '',
      bedrooms: house.Bedrooms || '',
      bathrooms: house.Bathrooms || '',
      contactName: house.ContactName || '',
      contactPhone: house.ContactPhone || ''
    });
    
    setEditImages([]);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} vượt quá 5MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} không phải là ảnh`);
        return false;
      }
      return true;
    });
    setEditImages(validFiles);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('Title', editFormData.title);
      formData.append('Description', editFormData.description);
      formData.append('Price', editFormData.price);
      formData.append('HouseType', editFormData.propertyType);
      formData.append('Area', editFormData.area);
      
      const fullAddress = [
        editFormData.address,
        editFormData.ward,
        editFormData.district,
        editFormData.city
      ].filter(Boolean).join(', ');
      formData.append('Address', fullAddress);
      
      formData.append('Bedrooms', editFormData.bedrooms);
      formData.append('Bathrooms', editFormData.bathrooms);
      formData.append('ContactName', editFormData.contactName);
      formData.append('ContactPhone', editFormData.contactPhone);

      editImages.forEach((image) => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/houses/${selectedHouse.HouseID}`, {
        method: 'PUT',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật nhà');
      }

      const result = await response.json();
      console.log('✅ [MyHome] Update success:', result);
      
      alert('Cập nhật nhà thành công!');
      setShowEditModal(false);
      // Load lại trang hiện tại sau khi edit
      fetchMyHouses(page, pageSize);
    } catch (error) {
      console.error('Error updating house:', error);
      alert('Lỗi: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Các hàm xử lý ảnh - giữ nguyên
  const handleSetCover = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/houses/images/${imageId}/cover`, {
        method: 'PUT',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Không thể đặt ảnh bìa');
      }

      setSelectedHouse(prev => ({
        ...prev,
        houseimages: prev.houseimages.map(img => ({
          ...img,
          IsCover: img.ImageID === imageId
        }))
      }));

      await fetchMyHouses(page, pageSize);
      alert('Đặt ảnh bìa thành công!');
    } catch (error) {
      console.error('Error setting cover:', error);
      alert('Lỗi: ' + error.message);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/houses/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Không thể xóa ảnh');
      }

      setSelectedHouse(prev => ({
        ...prev,
        houseimages: prev.houseimages.filter(img => img.ImageID !== imageId)
      }));

      await fetchMyHouses(page, pageSize);
      alert('Xóa ảnh thành công!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Lỗi: ' + error.message);
    }
  };

 const formatPrice = (price) => {
  if (!price && price !== 0) return '';
  
  // Chuyển đổi sang số để đảm bảo xử lý đúng
  const numberPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Format với dấu chấy phân cách hàng nghìn
  return numberPrice.toLocaleString('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + ' ₫';
};

  // Hàm filter nhà
  const filterHouses = (housesList) => {
    let filtered = [...housesList];
    
    // Filter theo địa chỉ
    if (searchParams.address) {
      const addressLower = searchParams.address.toLowerCase();
      filtered = filtered.filter(house => {
        const houseAddress = (house.Address || '').toLowerCase();
        const houseCity = (house.City || '').toLowerCase();
        return houseAddress.includes(addressLower) || houseCity.includes(addressLower);
      });
    }
    
    // Filter theo giá
    if (searchParams.minPrice) {
      const minPrice = parseFloat(searchParams.minPrice);
      filtered = filtered.filter(house => {
        const price = parseFloat(house.Price) || 0;
        return price >= minPrice;
      });
    }
    
    if (searchParams.maxPrice) {
      const maxPrice = parseFloat(searchParams.maxPrice);
      filtered = filtered.filter(house => {
        const price = parseFloat(house.Price) || 0;
        return price <= maxPrice;
      });
    }
    
    return filtered;
  };

  // Hàm search
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setPage(1);
    
    const filteredHouses = filterHouses(allHouses);
    
    // Phân trang kết quả search
    const startIndex = (1 - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedHouses = filteredHouses.slice(startIndex, endIndex);
    
    setHouses(paginatedHouses);
    setTotal(filteredHouses.length);
  };

  // Cập nhật houses khi page thay đổi và đang search
  useEffect(() => {
    if (isSearching && allHouses.length > 0) {
      const filteredHouses = filterHouses(allHouses);
      
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedHouses = filteredHouses.slice(startIndex, endIndex);
      
      setHouses(paginatedHouses);
      setTotal(filteredHouses.length);
    }
  }, [page, isSearching, searchParams, allHouses]);

  const clearSearch = () => {
    setSearchParams({
      address: '',
      minPrice: '',
      maxPrice: ''
    });
    setIsSearching(false);
    setPage(1);
    fetchMyHouses(1, pageSize);
    fetchAllHouses();
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Layout>
      {/* Hero Section với Search Bar */}
      <div className="hero" style={{ 
        minHeight: '500px', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: '#00204a'
      }}>
        <div className="hero-slide" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          <div className="img overlay" style={{ 
            backgroundImage: "url('/images/hero_bg_3.jpg')",
            height: '100%',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1
            }}></div>
          </div>
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center">
              <h1 className="heading" data-aos="fade-up" style={{
                color: '#fff',
                fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)',
                marginBottom: '30px',
                fontWeight: 600
              }}>
                Quản lý nhà của tôi
              </h1>
              
              <form
                onSubmit={handleSearch}
                className="narrow-w form-search d-flex align-items-stretch mb-2"
                data-aos="fade-up"
                data-aos-delay="200"
                style={{ maxWidth: '600px', margin: '0 auto' }}
              >
                <input
                  type="text"
                  className="form-control px-4"
                  placeholder="Nhập địa chỉ (thành phố, quận/huyện, đường...)"
                  value={searchParams.address}
                  onChange={(e) => setSearchParams({ ...searchParams, address: e.target.value })}
                  style={{ 
                    flex: 1, 
                    minWidth: '280px',
                    height: '52px',
                    border: 'none',
                    borderRadius: '30px',
                    paddingLeft: '20px',
                    paddingRight: '20px'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-dark d-inline-flex align-items-center justify-content-center ms-2"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{ 
                    borderRadius: '50%', 
                    width: '48px', 
                    height: '48px',
                    flexShrink: 0,
                    border: 'none'
                  }}
                >
                  <i className="fas fa-sliders-h"></i>
                </button>
                <button 
                  type="submit" 
                  className="btn ms-2"
                  style={{ 
                    flexShrink: 0,
                    backgroundColor: '#005555',
                    color: '#fff',
                    paddingLeft: '30px',
                    paddingRight: '30px',
                    border: 'none',
                    borderRadius: '30px'
                  }}
                >
                  Tìm kiếm
                </button>
              </form>

              {showAdvanced && (
                <div className="container" data-aos="fade-down" style={{ marginTop: '20px' }}>
                  <div className="row g-2 justify-content-center">
                    <div className="col-12 col-md-4">
                      <input
                        type="number"
                        className="form-control px-4"
                        placeholder="Giá tối thiểu"
                        value={searchParams.minPrice}
                        onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                        style={{
                          height: '52px',
                          borderRadius: '30px'
                        }}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <input
                        type="number"
                        className="form-control px-4"
                        placeholder="Giá tối đa"
                        value={searchParams.maxPrice}
                        onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                        style={{
                          height: '52px',
                          borderRadius: '30px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {isSearching && (
                <div className="mt-3" data-aos="fade-down">
                  <button 
                    onClick={clearSearch}
                    className="btn btn-outline-light"
                    style={{ borderRadius: '30px' }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Xóa tìm kiếm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section" style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <div className="container">
          {/* Header - THÊM THÔNG TIN PHÂN TRANG */}
          <div className="row mb-5">
            <div className="col-lg-12">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                  <h2 className="h3 font-weight-bold text-primary mb-2">
                    {isSearching ? `Kết quả tìm kiếm (${total} kết quả)` : 'Danh sách nhà của tôi'}
                  </h2>
                  <p className="text-muted mb-0">
                    {total > 0 ? `Hiển thị ${houses.length} trên tổng số ${total} nhà - Trang ${page}/${totalPages}` : 'Quản lý và chỉnh sửa thông tin các bất động sản của bạn'}
                  </p>
                </div>                
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="text-muted mt-3">Đang tải danh sách nhà...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="icon-alert-circle me-2"></i>
              <div>{error}</div>
              <button 
                className="btn btn-sm btn-outline-danger ms-auto"
                onClick={() => fetchMyHouses(page, pageSize)}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && houses.length === 0 && (
            <div className="text-center py-5">
              <div className="empty-state">
                <i className="icon-home display-1 text-muted mb-4"></i>
                {(() => {
                  // Lấy user role từ nhiều nguồn (fallback)
                  let userRole = user?.role || user?.Role;
                  
                  // Fallback: Lấy từ localStorage nếu user state chưa có
                  if (!userRole) {
                    try {
                      const userFromStorage = localStorage.getItem('user');
                      if (userFromStorage) {
                        const parsedUser = JSON.parse(userFromStorage);
                        userRole = parsedUser.role || parsedUser.Role;
                      }
                    } catch (e) {
                      console.warn('Failed to parse user from localStorage:', e);
                    }
                  }
                  
                  // Debug: Log user info
                  console.log('🔍 [MyHome] Empty state - User state:', user);
                  console.log('🔍 [MyHome] Empty state - User role:', userRole);
                  console.log('🔍 [MyHome] Empty state - Houses count:', houses.length);
                  
                  if (userRole === 'Seller') {
                    return (
                      <>
                        <h4 className="text-muted mb-3">Chưa có nhà nào được đăng</h4>
                        <p className="text-muted mb-4">
                          Bắt đầu bằng cách đăng bất động sản đầu tiên của bạn. 
                          Tạo nhà mới để bắt đầu bán trên sàn!
                        </p>
                        <Link to="/house/create" className="btn btn-primary btn-lg">
                          <i className="icon-plus me-2"></i>
                          Đăng nhà đầu tiên
                        </Link>
                      </>
                    );
                  } else if (userRole === 'Buyer') {
                    return (
                      <>
                        <h4 className="text-muted mb-3">Chưa mua nhà nào</h4>
                        <p className="text-muted mb-4">
                          Bạn chưa mua nhà nào. Hãy xem các nhà đang bán trên sàn 
                          và tìm căn nhà phù hợp với bạn!
                        </p>
                        <Link to="/properties" className="btn btn-primary btn-lg">
                          <i className="icon-search me-2"></i>
                          Xem nhà đang bán
                        </Link>                       
                      </>
                    );
                  } else {
                    return (
                      <>
                        <h4 className="text-muted mb-3">Chưa có nhà nào</h4>
                        <p className="text-muted mb-4">
                          Bạn chưa có nhà nào trong danh sách này.
                        </p>
                        <Link to="/properties" className="btn btn-primary btn-lg">
                          <i className="icon-search me-2"></i>
                          Xem nhà đang bán
                        </Link>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Houses Grid với phân trang */}
          {!loading && !error && houses.length > 0 && (
            <>
              <div className="row">
                {houses.map((house) => {
                  const coverImageUrl = getDriveImageUrl(house, 0);
                  
                  return (
                    <div key={house.HouseID} className="col-md-6 col-lg-4 mb-4">
                      <div className="card property-card h-100 shadow-sm border-0 hover-shadow">
                        {/* Image */}
                        <div className="position-relative overflow-hidden">
                          {coverImageUrl ? (
                            <OptimizedImage
                              src={coverImageUrl}
                              alt={house.Title}
                              className="card-img-top"
                              style={{ 
                                height: '250px', 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          ) : (
                            <div
                              className="bg-light d-flex align-items-center justify-content-center"
                              style={{ height: '250px' }}
                            >
                              <i className="icon-home display-3 text-muted"></i>
                            </div>
                          )}
                          <div className="position-absolute top-0 end-0 p-3">
                            <span className="badge bg-primary bg-opacity-90">{house.HouseType}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title text-truncate mb-2">{house.Title}</h5>
                          <p className="text-primary fw-bold fs-5 mb-3">
                            {formatPrice(house.Price)}
                          </p>
                          <p className="card-text text-muted small mb-3 flex-grow-1">
                            <i className="icon-map-marker me-1 text-primary"></i>
                            {house.Address}
                          </p>
                          <div className="d-flex justify-content-between text-muted small mb-3">
                            <span>
                              <i className="icon-expand me-1"></i>
                              {house.Area}m²
                            </span>
                            <span>
                              <i className="icon-bed me-1"></i>
                              {house.Bedrooms} PN
                            </span>
                            <span>
                              <i className="icon-bath me-1"></i>
                              {house.Bathrooms} WC
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="card-footer bg-transparent border-top-0 pt-0">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm flex-fill"
                              onClick={() => handleEdit(house)}
                            >
                              <i className="icon-edit me-1"></i>
                              Sửa
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm flex-fill"
                              onClick={() => handleDelete(house.HouseID)}
                            >
                              <i className="icon-trash me-1"></i>
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination UI - THÊM VÀO */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setPage(page - 1)} 
                          disabled={page === 1}
                        >
                          &laquo;
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i + 1} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setPage(page + 1)} 
                          disabled={page === totalPages}
                        >
                          &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal - GIỮ NGUYÊN */}
      {showEditModal && selectedHouse && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onClick={() => setShowEditModal(false)}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-scrollable" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="icon-edit me-2"></i>
                  Chỉnh sửa: {selectedHouse.Title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditModal(false)}
                  disabled={uploading}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  <div className="row">
                    {/* Title */}
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Tiêu đề *</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        name="title"
                        value={editFormData.title}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                      />
                    </div>

                    {/* Property Type */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Loại hình *</label>
                      <select
                        className="form-select"
                        name="propertyType"
                        value={editFormData.propertyType}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                      >
                        <option value="">Chọn loại hình</option>
                        <option value="Apartment">Căn hộ</option>
                        <option value="Townhouse">Nhà phố</option>
                        <option value="Villa">Biệt thự</option>
                        <option value="Land">Đất nền</option>
                        <option value="Other">Khác</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Giá (VND) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                      />
                    </div>

                    {/* Area */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Diện tích (m²) *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="area"
                        value={editFormData.area}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                      />
                    </div>

                    {/* Bedrooms */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Phòng ngủ *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="bedrooms"
                        value={editFormData.bedrooms}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                      />
                    </div>

                    {/* Bathrooms */}
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">Phòng tắm *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="bathrooms"
                        value={editFormData.bathrooms}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                      />
                    </div>

                    {/* Address Fields */}
                    <div className="col-12">
                      <h6 className="border-bottom pb-2 mb-3">Thông tin địa chỉ</h6>
                    </div>

                    {/* Tỉnh/Thành phố */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Tỉnh/Thành phố *</label>
                      <select
                        className="form-select"
                        name="city"
                        value={editFormData.city}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map(province => (
                          <option key={province.code} value={province.name}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quận/Huyện */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Quận/Huyện *</label>
                      <select
                        className="form-select"
                        name="district"
                        value={editFormData.district}
                        onChange={handleEditChange}
                        required
                        disabled={uploading || !editFormData.city}
                      >
                        <option value="">{districts.length > 0 ? 'Chọn quận/huyện' : 'Chọn tỉnh/thành phố trước'}</option>
                        {districts.map(district => (
                          <option key={district.code} value={district.name}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phường/Xã */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Phường/Xã *</label>
                      <select
                        className="form-select"
                        name="ward"
                        value={editFormData.ward}
                        onChange={handleEditChange}
                        required
                        disabled={uploading || !editFormData.district}
                      >
                        <option value="">{wards.length > 0 ? 'Chọn phường/xã' : 'Chọn quận/huyện trước'}</option>
                        {wards.map(ward => (
                          <option key={ward.code} value={ward.name}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Địa chỉ chi tiết */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Địa chỉ chi tiết *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="address"
                        value={editFormData.address}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="col-12">
                      <h6 className="border-bottom pb-2 mb-3">Thông tin liên hệ</h6>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Tên liên hệ</label>
                      <input
                        type="text"
                        className="form-control"
                        name="contactName"
                        value={editFormData.contactName}
                        onChange={handleEditChange}
                        disabled={uploading}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Số điện thoại</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="contactPhone"
                        value={editFormData.contactPhone}
                        onChange={handleEditChange}
                        disabled={uploading}
                      />
                    </div>

                    {/* Description */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-semibold">Mô tả chi tiết *</label>
                      <textarea
                        className="form-control"
                        name="description"
                        rows="4"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        required
                        disabled={uploading}
                        placeholder="Mô tả chi tiết về bất động sản..."
                      ></textarea>
                    </div>

                    {/* Current Images */}
                    {selectedHouse.houseimages && selectedHouse.houseimages.length > 0 && (
                      <div className="col-12 mb-4">
                        <label className="form-label fw-semibold">
                          Ảnh hiện tại ({selectedHouse.houseimages.length} ảnh)
                        </label>
                        <div className="alert alert-info d-flex align-items-center">
                          <i className="icon-info me-2"></i>
                          <small>
                            Drive File IDs: {selectedHouse.houseimages.map(img => img.DriveFileID).join(', ')}
                          </small>
                        </div>
                        <div className="row g-3">
                          {selectedHouse.houseimages.map((img) => {
                            const imageUrl = getDriveViewUrl(img, 'w800');
                            console.log(`🖼️ [MyHome] Modal image ${img.ImageID}:`, imageUrl);
                            
                            return (
                              <div key={img.ImageID} className="col-md-4 col-sm-6">
                                <div className="card border-0 shadow-sm h-100">
                                  <div className="position-relative">
                                    {imageUrl ? (
                                      <OptimizedImage
                                        src={imageUrl}
                                        alt="House"
                                        className="card-img-top"
                                        style={{ height: '150px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div
                                        className="bg-light d-flex align-items-center justify-content-center"
                                        style={{ height: '150px' }}
                                      >
                                        <i className="icon-image text-muted"></i>
                                        </div>
                                    )}
                                    {img.IsCover && (
                                      <span className="badge bg-success position-absolute top-0 start-0 m-2">
                                        Ảnh bìa
                                      </span>
                                    )}
                                  </div>
                                  <div className="card-body p-2 text-center">
                                    <div className="d-flex justify-content-center gap-2">
                                      {!img.IsCover && (
                                        <button
                                          type="button"
                                          className="btn btn-outline-success btn-sm"
                                          onClick={() => handleSetCover(img.ImageID)}
                                          disabled={uploading}
                                        >
                                          <i className="icon-star me-1"></i>
                                          Đặt bìa
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDeleteImage(img.ImageID)}
                                        disabled={uploading}
                                      >
                                        <i className="icon-trash me-1"></i>
                                        Xóa
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

                    {/* Upload New Images */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-semibold">Thêm ảnh mới</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*"
                        onChange={handleEditImageChange}
                        disabled={uploading}
                      />
                      <small className="text-muted">
                        Chọn nhiều ảnh (tối đa 5MB mỗi ảnh)
                      </small>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-end">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <i className="icon-save me-2"></i>
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
