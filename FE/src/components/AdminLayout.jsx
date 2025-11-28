import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load admin CSS dynamically
    const adminCssLink = document.createElement('link');
    adminCssLink.rel = 'stylesheet';
    adminCssLink.href = '/css/admin.css';
    adminCssLink.id = 'admin-css';
    document.head.appendChild(adminCssLink);

    // Load enhanced admin CSS
    const enhancedCssLink = document.createElement('link');
    enhancedCssLink.rel = 'stylesheet';
    enhancedCssLink.href = '/css/admin-enhanced.css';
    enhancedCssLink.id = 'admin-enhanced-css';
    document.head.appendChild(enhancedCssLink);

    // Cleanup: Remove admin CSS when component unmounts
    return () => {
      const cssLink = document.getElementById('admin-css');
      const enhancedCssLink = document.getElementById('admin-enhanced-css');
      if (cssLink) {
        cssLink.remove();
      }
      if (enhancedCssLink) {
        enhancedCssLink.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Lấy thông tin user từ API
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token') || 
                     document.cookie.split('token=')[1]?.split(';')[0];
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setCurrentUser({
              userId: data.user.userId || data.user.id,
              role: data.user.role,
              fullName: data.user.display_name || data.user.username
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

