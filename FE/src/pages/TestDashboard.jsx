import React from 'react';

const TestDashboard = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1>🎉 SMART DASHBOARD TEST</h1>
        <p style={{fontSize: '18px', marginTop: '20px'}}>
          Frontend đã hoạt động bình thường!
        </p>
        <p style={{fontSize: '16px', opacity: '0.8'}}>
          Port: 5173 | Vite: ✅ | Hot Reload: ✅
        </p>
      </div>
    </div>
  );
};

export default TestDashboard;




