import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function SellerProperties() {
  const { sellerId } = useParams();
  const [properties, setProperties] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellerProperties();
  }, [sellerId]);

  const loadSellerProperties = async () => {
    setLoading(true);
    try {
      // Load tất cả properties và filter theo OwnerID
      const response = await fetch('/api/houses', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const allProperties = Array.isArray(data) ? data : (data.data || []);
        const sellerProperties = allProperties.filter(p => p.OwnerID == sellerId);
        setProperties(sellerProperties);
        
        // Lấy thông tin seller từ property đầu tiên
        if (sellerProperties.length > 0 && sellerProperties[0].Owner) {
          setSeller(sellerProperties[0].Owner);
        }
      }
    } catch (error) {
      console.error('Error loading seller properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDriveViewUrl = (img) => {
    if (!img) return null;
    if (img.DriveFileID) return `https://drive.google.com/thumbnail?id=${img.DriveFileID}&sz=w1000`;
    if (img.CloudPath) {
      try {
        const u = new URL(img.CloudPath);
        const id = u.searchParams.get('id');
        if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
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

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_1.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center mt-5">
              <h1 className="heading" data-aos="fade-up">
                Nhà của {seller?.FullName || 'Seller'}
              </h1>
              <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="200">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                  <li className="breadcrumb-item"><Link to="/properties">Nhà</Link></li>
                  <li className="breadcrumb-item active">Seller</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="section section-properties">
        <div className="container">
          {seller && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="seller-avatar bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3" 
                           style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                        {(seller.FullName || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <h5 className="mb-1">{seller.FullName}</h5>
                        <p className="mb-0 text-muted">
                          <i className="fas fa-envelope me-2"></i>{maskEmail(seller.Email)}
                          {seller.PhoneNumber && (
                            <span className="ms-3">
                              <i className="fas fa-phone me-2"></i>{maskPhone(seller.PhoneNumber)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Đang tải danh sách nhà...</p>
            </div>
          ) : (
            <div className="row">
              {properties.length === 0 ? (
                <div className="col-12 text-center text-muted py-5">
                  Seller này chưa có nhà nào
                </div>
              ) : (
                properties.map((property) => {
                  const imgObj = property.houseimages?.find(i => i.IsCover) || property.houseimages?.[0];
                  const imageUrl = getDriveViewUrl(imgObj) || '/images/img_1.jpg';
                  const id = property.HouseID || property.id;

                  return (
                    <div key={id} className="col-xs-12 col-sm-6 col-md-6 col-lg-4">
                      <div className="property-item mb-30">
                        <Link to={`/property/${id}`} className="img">
                          <img src={imageUrl} alt="Image" className="img-fluid" />
                        </Link>

                        <div className="property-content">
                          <div className="price mb-2">
                            <span>{formatPrice(property.Price)}</span>
                          </div>
                          <div>
                            <span className="d-block mb-2 text-black-50">{property.Address}</span>
                            <span className="city d-block mb-3">{property.HouseType}</span>

                            <div className="specs d-flex mb-4">
                              <span className="d-block d-flex align-items-center me-3">
                                <span className="icon-bed me-2"></span>
                                <span className="caption">{property.Bedrooms || 0} phòng ngủ</span>
                              </span>
                              <span className="d-block d-flex align-items-center">
                                <span className="icon-bath me-2"></span>
                                <span className="caption">{property.Bathrooms || 0} phòng tắm</span>
                              </span>
                            </div>

                            <Link
                              to={`/property/${id}`}
                              className="btn btn-primary py-2 px-3"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
