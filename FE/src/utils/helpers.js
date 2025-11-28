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

