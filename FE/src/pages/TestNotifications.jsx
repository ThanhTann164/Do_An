import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function TestNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔍 TestNotifications component mounted');
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('🔍 fetchNotifications called');
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log('🔍 Token:', token ? 'exists' : 'not found');

      if (!token) {
        setError('No token found');
        setLoading(false);
        return;
      }

      console.log('🔍 Making API call to /api/notifications/my');
      const response = await fetch('http://localhost:3001/api/notifications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Response data:', data);
        setNotifications(data.notifications || []);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        setError(errorData.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  console.log('🔍 Render - loading:', loading, 'error:', error, 'notifications:', notifications.length);

  return (
    <Layout>
      <div className="hero page-inner overlay" style={{ backgroundImage: "url('/images/hero_bg_3.jpg')" }}>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-lg-9 text-center">
              <h1 className="heading text-white">Test Notifications</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <h2>Test Notifications Page</h2>
              
              {loading && (
                <div className="alert alert-info">
                  Loading notifications...
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  Error: {error}
                </div>
              )}

              {!loading && !error && (
                <div>
                  <p>Found {notifications.length} notifications</p>
                  {notifications.map((notif, index) => (
                    <div key={index} className="alert alert-secondary">
                      <h5>{notif.title || notif.Title}</h5>
                      <p>{notif.message || notif.Message}</p>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={fetchNotifications} className="btn btn-primary">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
