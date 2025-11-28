// Copy và paste code này vào console browser:

localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE4LCJyb2xlIjoiQWRtaW4iLCJlbWFpbCI6ImFkbWluQHNtYXJ0aG9tZS5jb20iLCJmdWxsTmFtZSI6IlN5c3RlbSBBZG1pbiIsInN0YXR1cyI6IkFjdGl2ZSIsImlhdCI6MTc2NDI1NDgxOCwiZXhwIjoxNzY0MzQxMjE4fQ.oTpm4SK8SIxBzD9YF6n_LB0bG2W5hFgA7ZGhEPLF4CQ");

console.log("✅ Token đã được cập nhật!");
console.log("🔄 Hãy refresh trang để áp dụng token mới");

// Kiểm tra token
const token = localStorage.getItem("token");
console.log("🔑 Token hiện tại:", token ? token.substring(0, 50) + "..." : "KHÔNG CÓ");

