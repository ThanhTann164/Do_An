import api from './api';

/**
 * Service để gọi các API AI
 */
export const aiService = {
  /**
   * Tối ưu tiêu đề bằng AI
   * @param {Object} data - { title, raw_title, house_type, price, location }
   * @returns {Promise} Response từ API
   */
  optimizeTitle: async (data) => {
    try {
      const response = await api.post('/ai/optimize-title', data);
      return response.data;
    } catch (error) {
      console.error('Error optimizing title:', error);
      throw error;
    }
  },

  /**
   * Tạo mô tả bằng AI
   * @param {Object} data - { raw_description, house_type, price, location, bedrooms, bathrooms }
   * @returns {Promise} Response từ API
   */
  optimizeDescription: async (data) => {
    try {
      const response = await api.post('/ai/optimize-description', data);
      return response.data;
    } catch (error) {
      console.error('Error optimizing description:', error);
      throw error;
    }
  },

  /**
   * Lấy thống kê sử dụng AI
   * @param {number} days - Số ngày để lấy thống kê (mặc định 30)
   * @returns {Promise} Response từ API
   */
  getMyAIUsage: async (days = 30) => {
    try {
      const response = await api.get('/ai/my-usage', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting AI usage:', error);
      throw error;
    }
  },

  /**
   * Phân tích thị trường (Market Analysis) - PREMIUM only
   * @param {Object} data - { location, house_type, area, current_price, bedrooms, bathrooms, analysis_type, time_range }
   * @returns {Promise} Response từ API
   */
  analyzeMarket: async (data) => {
    try {
      const response = await api.post('/ai/analyze-market', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    }
  },

  /**
   * Generate property description using Google Gemini (New API)
   * @param {Object} data - { propertyType, location, features, area, price }
   * @returns {Promise} Response từ API
   */
  generateDescription: async (data) => {
    try {
      const response = await api.post('/ai/generate-description', data);
      return response.data;
    } catch (error) {
      console.error('Error generating description:', error);
      throw error;
    }
  },

  /**
   * Analyze market using Google Gemini (New API)
   * @param {Object} data - { location, price, area, propertyType }
   * @returns {Promise} Response từ API
   */
  analyzeMarketNew: async (data) => {
    try {
      const response = await api.post('/ai/analyze-market', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    }
  }
};

export default aiService;



