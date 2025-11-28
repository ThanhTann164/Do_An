import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Tạo axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Interceptor để thêm token vào request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || document.cookie.split('token=')[1]?.split(';')[0];
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const chatAPI = {
    // Lấy danh sách conversations
    getConversations: async () => {
        try {
            const response = await api.get('/api/chat/conversations');
            return response.data;
        } catch (error) {
            console.error('API Error - getConversations:', error.response?.data || error.message);
            throw error;
        }
    },

    // Bắt đầu conversation mới
    startConversation: async (targetUserId) => {
        try {
            console.log('API: Starting conversation with user:', targetUserId);
            const response = await api.post('/api/chat/conversations', { targetUserId });
            console.log('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('API Error - startConversation:', error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy messages trong conversation
    getMessages: async (conversationId, limit = 50, offset = 0) => {
        try {
            console.log('API: Getting messages for conversation:', conversationId);
            const response = await api.get(`/api/chat/messages/${conversationId}`, {
                params: { limit, offset }
            });
            console.log('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('API Error - getMessages:', error.response?.data || error.message);
            throw error;
        }
    },

    // Gửi message
    sendMessage: async (conversationId, messageText, messageType = 'text', metadata = null) => {
        try {
            console.log('API: Sending message:', { conversationId, messageText, messageType, metadata });
            const response = await api.post('/api/chat/messages', {
                conversationId,
                messageText,
                messageType,
                metadata
            });
            console.log('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('API Error - sendMessage:', error.response?.data || error.message);
            throw error;
        }
    },

    // Upload ảnh
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await api.post('/api/chat/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('API Error - uploadImage:', error.response?.data || error.message);
            throw error;
        }
    },

    // Đánh dấu đã đọc
    markAsRead: async (conversationId) => {
        try {
            const response = await api.put('/api/chat/mark-read', { conversationId });
            return response.data;
        } catch (error) {
            console.error('API Error - markAsRead:', error.response?.data || error.message);
            // Không throw error vì đây không phải critical
            return { success: false };
        }
    },

    // Lấy số tin chưa đọc
    getUnreadCount: async () => {
        try {
            const response = await api.get('/api/chat/unread-count');
            return response.data;
        } catch (error) {
            console.error('API Error - getUnreadCount:', error.response?.data || error.message);
            throw error;
        }
    },

    // Lấy danh sách users có thể chat
    getAvailableUsers: async () => {
        try {
            const response = await api.get('/api/chat/available-users');
            return response.data;
        } catch (error) {
            console.error('API Error - getAvailableUsers:', error.response?.data || error.message);
            throw error;
        }
    }
};


