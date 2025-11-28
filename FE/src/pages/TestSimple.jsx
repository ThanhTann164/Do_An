import React from 'react';

const TestSimple = () => {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>🔥 TEST REACT WORKING!</h1>
      <p>Nếu bạn thấy text này, React đã hoạt động!</p>
      <div style={{ background: 'blue', color: 'white', padding: '10px', margin: '10px 0' }}>
        Frontend Vite đang chạy trên port 5175
      </div>
      <div style={{ background: 'green', color: 'white', padding: '10px' }}>
        Backend Express đang chạy trên port 3001
      </div>
    </div>
  );
};

export default TestSimple;


