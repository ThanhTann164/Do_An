import React from "react";
import ReactDOM from "react-dom/client";

const TestApp = () => {
  return (
    <div style={{ padding: '50px', background: 'red', color: 'white', fontSize: '24px' }}>
      <h1>🔥 REACT TEST WORKING!</h1>
      <p>Nếu bạn thấy text này, React đã hoạt động!</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<TestApp />);




