import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token') || 
                     document.cookie.split('token=')[1]?.split(';')[0];
        
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch('http://localhost:3001/api/user', {
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.user) {
            const user = {
              userId: data.user.userId || data.user.id,
              role: data.user.role,
              fullName: data.user.display_name || data.user.username
            };
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-0" style={{ overflow: 'visible' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
