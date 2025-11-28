import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      console.log('🔍 ProtectedRoute: Fetching user info...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ ProtectedRoute: No token found');
        setLoading(false);
        return;
      }

      console.log('✅ ProtectedRoute: Token found, making API call...');
      const response = await fetch('http://localhost:3001/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      console.log('📊 ProtectedRoute: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 ProtectedRoute: Response data:', data);
        
        // Flexible data parsing
        const userData = data.user || data.data || data;
        if (userData && userData.email) {
          console.log('✅ ProtectedRoute: User authenticated:', userData);
          setUser(userData);
        } else {
          console.log('❌ ProtectedRoute: Invalid user data format');
        }
      } else {
        console.log('❌ ProtectedRoute: API error:', response.status);
      }
    } catch (error) {
      console.error('❌ ProtectedRoute: Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if requiredRole is specified
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Admin has access to everything
    if (user.role !== 'Admin' && !allowedRoles.includes(user.role)) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow text-center p-5">
                <i className="fas fa-ban text-danger" style={{ fontSize: '4rem' }}></i>
                <h3 className="mt-3">Không có quyền truy cập</h3>
                <p className="text-muted">
                  Bạn không có quyền truy cập trang này. 
                  Tính năng này chỉ dành cho {allowedRoles.join(' hoặc ')}.
                </p>
                <p className="text-muted">
                  Vai trò hiện tại của bạn: <strong>{user.role}</strong>
                </p>
                <button 
                  onClick={() => window.history.back()} 
                  className="btn btn-primary mt-3"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required role
  return children;
}

