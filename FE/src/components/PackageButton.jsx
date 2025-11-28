import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PackageButton() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  // Chỉ hiển thị khi user là seller
  if (!user || user.role !== 'Seller') return null;

  return (
    <div className="flex justify-center mt-4">
      <button 
        onClick={() => window.location.href = '/package/payment'}
        className="package-cta inline-flex items-center gap-2 text-white font-semibold transition-all duration-300 border-0 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #b36bff, #9b5cff)',
          color: 'white',
          padding: '0.6rem 1.2rem',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(155, 92, 255, 0.35)',
          transition: 'transform 0.22s, box-shadow 0.22s',
          fontSize: '15px',
          fontWeight: '600'
        }}
      >
        <i className="fas fa-crown text-yellow-300"></i>
        <span>Xem gói đăng tin</span>
      </button>
    </div>
  );
}
