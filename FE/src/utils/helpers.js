// Format currency to VND
export const formatCurrency = (amount) => {
  if (!amount) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date to Vietnamese locale
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

// Format datetime to Vietnamese locale
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
};

// Get Drive view URL from image object
export const getDriveViewUrl = (img) => {
  if (!img) return null;
  if (img.DriveFileID) return `https://drive.google.com/uc?export=view&id=${img.DriveFileID}`;
  if (img.CloudPath) {
    try {
      const u = new URL(img.CloudPath);
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
    } catch(_) {}
    return img.CloudPath;
  }
  return img.ImageUrl || null;
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'available':
    case 'active':
    case 'on':
      return 'bg-success';
    case 'pending':
      return 'bg-warning';
    case 'rejected':
    case 'inactive':
    case 'off':
      return 'bg-danger';
    case 'sold':
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

// Get role badge class
export const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'Admin': return 'bg-danger';
    case 'Seller': return 'bg-success';
    case 'Buyer': return 'bg-primary';
    default: return 'bg-secondary';
  }
};

/**
 * Lấy package name hiện tại của user
 * Hỗ trợ nhiều cấu trúc response từ backend:
 * 1. user.currentPackage (từ API response mới)
 * 2. user.UserPackages[] (nếu eager load)
 * 3. user.userpackages[] (nếu eager load với alias)
 * 
 * @param {Object} user - User object từ API
 * @returns {string} Package name ('FREE', 'PRO', 'PREMIUM') hoặc 'FREE' nếu không tìm thấy
 */
export const getCurrentPackage = (user) => {
  if (!user) {
    return 'FREE';
  }

  const now = new Date();

  // 1. Kiểm tra currentPackage từ API response (ưu tiên cao nhất)
  if (user.currentPackage) {
    const currentPkg = user.currentPackage;
    // Nếu có expiresAt, kiểm tra xem còn hạn không
    if (currentPkg.expiresAt) {
      const expiresAt = new Date(currentPkg.expiresAt);
      if (expiresAt > now) {
        return (currentPkg.name || currentPkg.packageName || 'FREE').toUpperCase();
      }
      // Đã hết hạn, fallback về FREE
      return 'FREE';
    }
    // Không có expiresAt hoặc isFree = true
    if (currentPkg.isFree === false && currentPkg.name) {
      return (currentPkg.name || currentPkg.packageName || 'FREE').toUpperCase();
    }
    // isFree = true hoặc không có name
    return 'FREE';
  }

  // 2. Kiểm tra UserPackages array (nếu eager load từ Sequelize)
  const userPackages = user.UserPackages || user.userpackages || user.UserPackage || [];
  
  if (Array.isArray(userPackages) && userPackages.length > 0) {
    // Tìm package active với end_at > now và status = 'active'
    const activePackage = userPackages.find(pkg => {
      const status = pkg.status || pkg.Status;
      const endAt = pkg.end_at || pkg.endAt || pkg.endAtDate;
      
      if (status?.toLowerCase() !== 'active') {
        return false;
      }
      
      if (endAt) {
        const endDate = new Date(endAt);
        return endDate > now;
      }
      
      // Nếu không có end_at, coi như không hết hạn
      return true;
    });

    if (activePackage) {
      // Lấy package name từ Package relation hoặc trực tiếp
      const packageName = activePackage.Package?.name || 
                         activePackage.package?.name ||
                         activePackage.package_name ||
                         activePackage.PackageName ||
                         activePackage.name;
      
      if (packageName) {
        return packageName.toUpperCase();
      }
    }
  }

  // 3. Kiểm tra package field trực tiếp (fallback)
  if (user.package) {
    const pkg = user.package;
    const packageName = pkg.name || pkg.packageName || pkg.PackageName;
    if (packageName) {
      return packageName.toUpperCase();
    }
  }

  // 4. Không tìm thấy active package, return FREE
  return 'FREE';
};

