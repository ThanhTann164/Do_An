import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import UpgradeButton from '../components/UpgradeButton';
import PackageButton from '../components/PackageButton';
import '../styles/home-animations.css';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [searchParams, setSearchParams] = useState({
    address: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    propertyType: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // Đổi từ 9 thành 6
  const [total, setTotal] = useState(0);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Scroll reveal effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(el => observer.observe(el));

    return () => {
      scrollElements.forEach(el => observer.unobserve(el));
    };
  }, [properties, searchResults]);

  // Load properties khi component mount
  useEffect(() => {
    loadProperties(1, pageSize);
  }, []);

  // Load properties hoặc search results khi page thay đổi
  useEffect(() => {
    console.log(`🔄 Effect triggered - page: ${page}, searchResults: ${searchResults !== null}`);
    if (searchResults !== null) {
      handleSearchPage(page, pageSize);
    } else {
      loadProperties(page, pageSize);
    }
  }, [page]); // Chỉ phụ thuộc vào page, không phụ thuộc pageSize vì nó là constant

  const loadProperties = async (pageArg = 1, pageSizeArg = 6) => {
    setIsLoading(true);
    try {
      const url = `/api/houses?page=${pageArg}&pageSize=${pageSizeArg}`;
      console.log(`📡 Loading properties from: ${url}`);
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 API Response:', result);
        
        if (result.success) {
          // Sử dụng result.total (ở cấp gốc) hoặc result.pagination.total
          const totalCount = result.total || result.pagination?.total || result.data.length;
          setProperties(result.data);
          setTotal(totalCount);
          console.log(`✅ Loaded ${result.data.length} properties, total: ${totalCount}`);
        }
      } else {
        console.error('❌ API Error:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1); // Reset về trang 1 khi tìm kiếm mới
    setIsLoading(true);
    
    try {
      await handleSearchPage(1, pageSize);
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchPage = async (pageArg = 1, pageSizeArg = 6) => {
    try {
      const params = new URLSearchParams();
      if (searchParams.address) params.append('address', searchParams.address);
      if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
      params.append('page', pageArg);
      params.append('pageSize', pageSizeArg);
      
      const url = `/api/houses/search?${params.toString()}`;
      console.log(`🔍 Searching from: ${url}`);
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Search Response:', result);
        
        if (result.success) {
          // Sử dụng result.total (ở cấp gốc) hoặc result.pagination.total
          const totalCount = result.total || result.pagination?.total || result.data.length;
          setSearchResults(result.data);
          setSearchTotal(totalCount);
          console.log(`✅ Found ${result.data.length} results, total: ${totalCount}`);
        }
      } else {
        console.error('❌ Search API Error:', response.status);
      }
    } catch (error) {
      console.error('❌ Error searching:', error);
    }
  };

  const clearSearch = () => {
    setSearchParams({
      address: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      propertyType: ''
    });
    setSearchResults(null);
    setSearchTotal(0);
    setPage(1);
    loadProperties(1, pageSize);
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

  const displayProperties = searchResults !== null ? (searchResults || []) : (properties || []);
  const currentTotal = searchResults !== null ? searchTotal : total;
  const totalPages = Math.ceil(currentTotal / pageSize);

  console.log(`📊 Current state - page: ${page}, totalPages: ${totalPages}, currentTotal: ${currentTotal}, displayProperties: ${displayProperties.length}`);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero_bg_3.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight animate-fade-in-up">
            Easiest way to find your 
            <span className="block bg-gradient-to-r from-[#00a693] to-[#006d5b] bg-clip-text text-transparent animate-typewriter">
              dream home
            </span>
          </h1>
          
          {/* Compact Search Container */}
          <div className="w-[75%] max-w-[900px] mx-auto mt-16 animate-fade-in-up-delay">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white/55 backdrop-blur-xl border border-white/60 rounded-xl h-16 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-white/65 hover:border-white/75 transition-all duration-500">
                <input
                  type="text"
                  className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-700/80 px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:shadow-[0_0_15px_rgba(16,185,129,0.25)] rounded-xl transition-all duration-300 text-base"
                  placeholder="Nhập địa chỉ (thành phố, quận/huyện, đường...)"
                  value={searchParams.address}
                  onChange={(e) => setSearchParams({ ...searchParams, address: e.target.value })}
                />
                <button
                  type="button"
                  className="mx-2 p-3 bg-white/50 hover:bg-white/70 text-gray-700 rounded-lg transition-all duration-300 hover:scale-105 border border-gray-300/50 hover:border-gray-400/70"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  title="Bộ lọc nâng cao"
                >
                  <i className="fas fa-sliders-h text-sm"></i>
                </button>
                <button 
                  type="submit" 
                  className="bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 h-14 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_6px_25px_rgba(0,0,0,0.35)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-white/80 disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tìm...
                    </span>
                  ) : 'Tìm kiếm'}
                </button>
              </div>
            </form>

            {/* Compact Advanced Filters */}
            {showAdvanced && (
              <div className="mt-6 animate-fade-in-down">
                <div className="bg-white/55 backdrop-blur-xl border border-white/60 rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="number"
                      className="bg-white/50 border border-gray-300/50 text-gray-900 placeholder:text-gray-700/80 px-4 py-3 h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all duration-300 font-medium text-sm"
                      placeholder="Giá tối thiểu"
                      value={searchParams.minPrice}
                      onChange={(e) => setSearchParams({ ...searchParams, minPrice: e.target.value })}
                    />
                    <input
                      type="number"
                      className="bg-white/50 border border-gray-300/50 text-gray-900 placeholder:text-gray-700/80 px-4 py-3 h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all duration-300 font-medium text-sm"
                      placeholder="Giá tối đa"
                      value={searchParams.maxPrice}
                      onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                    />
                    <input
                      type="number"
                      className="bg-white/50 border border-gray-300/50 text-gray-900 placeholder:text-gray-700/80 px-4 py-3 h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all duration-300 font-medium text-sm"
                      placeholder="Diện tích tối thiểu (m²)"
                      value={searchParams.minArea || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, minArea: e.target.value })}
                    />
                    <select
                      className="bg-white/50 border border-gray-300/50 text-gray-900 px-4 py-3 h-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-300 font-medium text-sm"
                      value={searchParams.propertyType || ''}
                      onChange={(e) => setSearchParams({ ...searchParams, propertyType: e.target.value })}
                    >
                      <option value="" className="text-gray-800 bg-white">Loại bất động sản</option>
                      <option value="apartment" className="text-gray-800 bg-white">Chung cư</option>
                      <option value="house" className="text-gray-800 bg-white">Nhà riêng</option>
                      <option value="villa" className="text-gray-800 bg-white">Biệt thự</option>
                      <option value="land" className="text-gray-800 bg-white">Đất nền</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Compact Clear Search Button */}
            {searchResults !== null && (
              <div className="mt-6 text-center animate-fade-in">
                <button 
                  onClick={clearSearch}
                  className="bg-white/55 hover:bg-white/65 text-gray-900 border border-white/60 hover:border-white/75 px-6 py-3 h-12 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(0,0,0,0.15)] text-sm"
                >
                  <i className="fas fa-times mr-2"></i>
                  Xóa tìm kiếm
                </button>
              </div>
            )}

            {/* Package Button for Sellers */}
            <PackageButton />
          </div>
        </div>
      </div>

      {/* Compact Popular Properties Section */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#00a693] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#006d5b] rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12 animate-fade-in-up">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 relative">
                {searchResults !== null ? (
                  <>
                    Kết quả tìm kiếm
                    <span className="block text-xl lg:text-2xl text-[#00a693] font-medium">
                      ({searchTotal} kết quả)
                    </span>
                  </>
                ) : (
                  <>
                    Popular Properties
                    <div className="absolute -bottom-2 left-0 lg:left-0 w-20 h-1 bg-gradient-to-r from-[#00a693] to-[#006d5b] rounded-full"></div>
                  </>
                )}
              </h2>
            </div>
            <div>
              <Link 
                to="/properties" 
                className="inline-flex items-center bg-gradient-to-r from-[#00a693] to-[#006d5b] hover:from-[#006d5b] hover:to-[#00a693] text-white px-6 py-3 rounded-full font-medium text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 group"
              >
                View all properties
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#00a693] to-[#006d5b] rounded-full mb-4 animate-spin">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-xl text-gray-600 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {/* Compact Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {displayProperties.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <div className="text-5xl text-gray-300 mb-3">🏠</div>
                    <p className="text-lg text-gray-500">
                      {searchResults !== null ? 'Không tìm thấy nhà phù hợp' : 'Không có nhà nào'}
                    </p>
                  </div>
                ) : (
                  displayProperties.map((property, index) => {
                    const imgObj = property.houseimages?.find(i => i.IsCover) || property.houseimages?.[0];
                    const imageUrl = getDriveViewUrl(imgObj) || '/images/img_1.jpg';
                    const id = property.HouseID || property.id;
                    const packageType = property.packageType || 'FREE';
                    const isPremium = packageType === 'PREMIUM';
                    const isPro = packageType === 'PRO';
                    
                    return (
                      <div 
                        key={id} 
                        className={`group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-400 hover:scale-102 animate-fade-in-up relative ${
                          isPremium 
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 shadow-yellow-200' 
                            : isPro 
                              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-blue-200'
                              : 'bg-white border border-gray-200'
                        }`}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        {/* Premium/Pro Badge */}
                        {isPremium && (
                          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <span>🔥</span>
                            <span>Nổi bật</span>
                          </div>
                        )}
                        {isPro && !isPremium && (
                          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <span>⭐</span>
                            <span>Uy tín</span>
                          </div>
                        )}
                        
                        {/* Compact Property Image */}
                        <Link 
                          to={`/property/${id}`} 
                          className="block relative overflow-hidden aspect-[4/3]"
                        >
                          <img 
                            src={imageUrl} 
                            alt="Property" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = '/images/img_1.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        
                        {/* Compact Property Content */}
                        <div className="p-4">
                          <div className="mb-3">
                            <div className={`text-lg font-bold mb-1 ${
                              isPremium 
                                ? 'text-yellow-700' 
                                : isPro 
                                  ? 'text-blue-700'
                                  : 'text-[#006d5b]'
                            }`}>
                              {formatPrice(property.Price)}
                            </div>
                            <p className="text-xs text-gray-600 mb-1 line-clamp-1">{property.Address}</p>
                            <p className={`text-sm font-semibold line-clamp-1 ${
                              isPremium 
                                ? 'text-gray-900' 
                                : isPro 
                                  ? 'text-gray-900'
                                  : 'text-gray-900'
                            }`}>
                              {property.City}
                            </p>
                          </div>
                          
                          {/* Compact Property Specs */}
                          <div className="flex items-center space-x-4 mb-4 text-gray-600">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-[#00a693]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M7 13h10" />
                              </svg>
                              <span className="text-xs font-medium">{property.Bedrooms || 0}</span>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-[#00a693]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                              <span className="text-xs font-medium">{property.Bathrooms || 0}</span>
                            </div>
                          </div>
                          
                          {/* Compact See Details Button */}
                          <Link 
                            to={`/property/${id}`} 
                            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#00a693] to-[#006d5b] hover:from-[#006d5b] hover:to-[#00a693] text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md group"
                          >
                            See details
                            <svg className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compact Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 animate-fade-in-up">
                  <nav className="flex items-center space-x-1">
                    <button 
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        page === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-[#00a693] hover:text-white shadow-sm hover:shadow-md hover:scale-105'
                      }`}
                      onClick={() => setPage(page - 1)} 
                      disabled={page === 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button 
                          key={pageNum}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-[#00a693] to-[#006d5b] text-white shadow-md scale-105'
                              : 'bg-white text-gray-700 hover:bg-[#00a693] hover:text-white shadow-sm hover:shadow-md hover:scale-105'
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button 
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        page === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-[#00a693] hover:text-white shadow-sm hover:shadow-md hover:scale-105'
                      }`}
                      onClick={() => setPage(page + 1)} 
                      disabled={page === totalPages}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-[#006d5b]/5 to-[#00a693]/5 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23006d5b' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🏠",
                title: "Our Properties",
                description: "Khám phá bộ sưu tập bất động sản đa dạng và chất lượng cao của chúng tôi.",
                delay: "0ms"
              },
              {
                icon: "🏢",
                title: "Property for Sale",
                description: "Tìm kiếm và sở hữu ngôi nhà mơ ước với giá cả hợp lý nhất.",
                delay: "100ms"
              },
              {
                icon: "👨‍💼",
                title: "Real Estate Agent",
                description: "Đội ngũ chuyên viên tư vấn giàu kinh nghiệm sẵn sàng hỗ trợ bạn.",
                delay: "200ms"
              },
              {
                icon: "🏡",
                title: "House for Sale",
                description: "Các căn nhà được tuyển chọn kỹ lưỡng với vị trí đắc địa.",
                delay: "300ms"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 text-center animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#006d5b] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-[#00a693] hover:text-[#006d5b] font-semibold transition-all duration-300 group-hover:translate-x-1"
                >
                  Learn More
                  <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}