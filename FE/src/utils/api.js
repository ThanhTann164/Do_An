// API base URL
const API_BASE_URL = '/api';

// Generic fetch wrapper
const apiFetch = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok && response.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      return null;
    }

    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// User API
export const userAPI = {
  getCurrentUser: async () => {
    const response = await apiFetch('/user');
    return response?.ok ? await response.json() : null;
  },

  login: async (email, password) => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    return response?.ok ? await response.json() : null;
  },

  register: async (userData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    return response?.ok ? await response.json() : null;
  },

  logout: async () => {
    const response = await apiFetch('/logout', { method: 'POST' });
    return response?.ok;
  }
};

// Houses API
export const housesAPI = {
  getAll: async () => {
    const response = await apiFetch('/houses');
    return response?.ok ? await response.json() : null;
  },

  getById: async (id) => {
    const response = await apiFetch(`/houses/${id}`);
    return response?.ok ? await response.json() : null;
  },

  search: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiFetch(`/houses/search?${queryString}`);
    return response?.ok ? await response.json() : null;
  },

  create: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/posts/create`, {
      method: 'POST',
      body: formData, // FormData for file uploads
      credentials: 'include'
    });
    return response?.ok ? await response.json() : null;
  },

  delete: async (id) => {
    const response = await apiFetch(`/posts/${id}`, { method: 'DELETE' });
    return response?.ok;
  }
};

// Devices API
export const devicesAPI = {
  getAll: async () => {
    const response = await apiFetch('/devices');
    return response?.ok ? await response.json() : null;
  },

  getById: async (id) => {
    const response = await apiFetch(`/devices/${id}`);
    return response?.ok ? await response.json() : null;
  },

  control: async (id, action) => {
    const response = await apiFetch(`/devices/${id}/control`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    return response?.ok ? await response.json() : null;
  }
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const response = await apiFetch('/admin/dashboard');
    return response?.ok ? await response.json() : null;
  },

  getUsers: async () => {
    const response = await apiFetch('/admin/users');
    return response?.ok ? await response.json() : null;
  },

  deleteUser: async (id) => {
    const response = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    return response?.ok;
  },

  getPosts: async () => {
    const response = await apiFetch('/admin/posts');
    return response?.ok ? await response.json() : null;
  },

  approvePost: async (id) => {
    const response = await apiFetch(`/admin/posts/${id}/approve`, { method: 'PUT' });
    return response?.ok;
  },

  rejectPost: async (id, reason) => {
    const response = await apiFetch(`/admin/posts/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
    return response?.ok;
  },

  deletePost: async (id) => {
    const response = await apiFetch(`/admin/posts/${id}`, { method: 'DELETE' });
    return response?.ok;
  }
};

