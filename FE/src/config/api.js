// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
};

// Export for backward compatibility
export const API_URL = API_CONFIG.API_URL;
export default API_CONFIG;


