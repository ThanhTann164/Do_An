import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffLoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token và role của staff
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
      // Chưa đăng nhập, chuyển về trang login
      navigate('/login');
      return;
    }

    if (user.role === 'staff' || user.role === 'admin') {
      // Là staff hoặc admin, chuyển về dashboard
      navigate('/staff/dashboard');
    } else {
      // Không phải staff, chuyển về trang chủ
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default StaffLoginRedirect;
