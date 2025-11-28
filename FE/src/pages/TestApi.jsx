import { useState } from 'react';

export default function TestApi() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      // Test login
      const loginRes = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      const loginData = await loginRes.json();
      console.log('Login response:', loginData);
      setResult(prev => ({ ...prev, login: loginData }));

      if (loginData.token) {
        // Test /api/user
        const userRes = await fetch('http://localhost:3001/api/user', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });
        const userData = await userRes.json();
        console.log('User response:', userData);
        setResult(prev => ({ ...prev, user: userData }));
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testToken = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);
      
      if (!token) {
        setResult({ error: 'No token in localStorage' });
        return;
      }

      const userRes = await fetch('http://localhost:3001/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const userData = await userRes.json();
      console.log('User response:', userData);
      setResult({ user: userData });
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>API Test</h1>
      <button onClick={testLogin} disabled={loading}>
        Test Login
      </button>
      <button onClick={testToken} disabled={loading} style={{ marginLeft: '10px' }}>
        Test Token from localStorage
      </button>
      <pre style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
