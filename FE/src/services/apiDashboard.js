// API Services for Seller Dashboard - NO MOCK DATA
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Common headers for API requests
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Dashboard API Services - Real API calls only
export const dashboardAPI = {
  // Get seller info from /api/user
  getSellerInfo: async () => {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching seller info:', error);
      throw error;
    }
  },

  // Get seller posts statistics
  getSellerStats: async () => {
    try {
      // Try multiple possible endpoints for seller stats
      const endpoints = [
        `${API_URL}/api/posts/my-posts/stats`,
        `${API_URL}/api/seller/stats`,
        `${API_URL}/api/posts/statistics`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: getHeaders()
          });
          if (response.ok) {
            return handleResponse(response);
          }
        } catch (err) {
          continue;
        }
      }
      
      throw new Error('No stats API available');
    } catch (error) {
      console.error('Error fetching seller stats:', error);
      throw error;
    }
  },

  // Get seller properties from /api/posts/my-posts
  getSellerProperties: async (limit = 5) => {
    try {
      const endpoints = [
        `${API_URL}/api/posts/my-posts?limit=${limit}`,
        `${API_URL}/api/property/seller?limit=${limit}`,
        `${API_URL}/api/posts?seller=true&limit=${limit}`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: getHeaders()
          });
          if (response.ok) {
            return handleResponse(response);
          }
        } catch (err) {
          continue;
        }
      }
      
      throw new Error('No properties API available');
    } catch (error) {
      console.error('Error fetching seller properties:', error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (limit = 5) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications?limit=${limit}`, {
        headers: getHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get viewing requests
  getViewingRequests: async (limit = 5) => {
    try {
      const endpoints = [
        `${API_URL}/api/viewings/seller?limit=${limit}`,
        `${API_URL}/api/viewings?seller=true&limit=${limit}`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: getHeaders()
          });
          if (response.ok) {
            return handleResponse(response);
          }
        } catch (err) {
          continue;
        }
      }
      
      throw new Error('No viewings API available');
    } catch (error) {
      console.error('Error fetching viewing requests:', error);
      throw error;
    }
  }
};

export default dashboardAPI;
