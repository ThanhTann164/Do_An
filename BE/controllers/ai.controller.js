const OpenAI = require('openai');
const crypto = require('crypto');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { initModels } = require('../models/init-models');

// Initialize models
const { aicache } = initModels(sequelize);

// Initialize Groq AI (compatible with OpenAI SDK)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

console.log('🔑 [AI Controller] GROQ_API_KEY check:', {
  hasKey: !!GROQ_API_KEY,
  keyLength: GROQ_API_KEY ? GROQ_API_KEY.length : 0,
  keyPrefix: GROQ_API_KEY ? GROQ_API_KEY.substring(0, 10) + '...' : 'N/A',
  fromEnv: {
    GROQ_API_KEY: !!process.env.GROQ_API_KEY
  }
});

if (!GROQ_API_KEY) {
  console.error('❌ [AI Controller] GROQ_API_KEY not found in environment variables');
  console.error('❌ [AI Controller] Available env vars:', Object.keys(process.env).filter(k => k.includes('GROQ')));
}

// Initialize Groq client (using OpenAI SDK, but pointing to Groq API)
const groq = GROQ_API_KEY ? new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1' // Point to Groq API endpoint
}) : null;

// Model configuration - Llama 3.3 70B (powerful and fast)
const GROQ_MODEL = 'llama-3.3-70b-versatile';

console.log('🤖 [AI Controller] Groq initialization:', {
  hasGroq: !!groq,
  modelName: GROQ_MODEL,
  apiKeyConfigured: !!GROQ_API_KEY,
  baseURL: groq ? 'https://api.groq.com/openai/v1' : 'N/A'
});

/**
 * Helper function to clean AI response text
 * Removes markdown code blocks, backticks, and extra whitespace
 * @param {string} text - Raw text from AI
 * @returns {string} - Cleaned text
 */
function cleanAIResponse(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let cleaned = text.trim();
  
  // Remove markdown code blocks (```json, ```, etc.)
  cleaned = cleaned.replace(/```json\n?/gi, '');
  cleaned = cleaned.replace(/```\n?/g, '');
  
  // Remove leading/trailing quotes if wrapped
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Helper function to generate cache key and hash from input data
 * @param {Object} inputData - Input data for AI (propertyType, location, etc.)
 * @param {string} resultType - Type of AI result (description, market_analysis, etc.)
 * @returns {Object} - { cacheKey, inputHash }
 */
function generateCacheKey(inputData, resultType) {
  // Create a normalized string from input data
  const normalizedData = JSON.stringify(inputData, Object.keys(inputData).sort());
  const cacheKey = `${resultType}:${normalizedData}`;
  
  // Generate SHA256 hash
  const inputHash = crypto.createHash('sha256').update(cacheKey).digest('hex');
  
  return { cacheKey, inputHash };
}

/**
 * Helper function to check cache and return cached result if exists
 * @param {string} inputHash - Hash of input data
 * @returns {Object|null} - Cached result or null
 */
async function getCachedResult(inputHash) {
  try {
    const cached = await aicache.findOne({
      where: {
        InputHash: inputHash,
        ExpiresAt: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });
    
    if (cached) {
      console.log('💾 [AI Cache] Serving from cache');
      return JSON.parse(cached.Result);
    }
    
    return null;
  } catch (error) {
    console.error('❌ [AI Cache] Error checking cache:', error);
    return null; // Return null on error, continue with API call
  }
}

/**
 * Helper function to save result to cache
 * @param {string} inputHash - Hash of input data
 * @param {string} cacheKey - Human-readable cache key
 * @param {Object} result - Result to cache
 * @param {string} resultType - Type of AI result
 */
async function saveToCache(inputHash, cacheKey, result, resultType) {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires after 7 days
    
    await aicache.upsert({
      InputHash: inputHash,
      CacheKey: cacheKey.substring(0, 255), // Truncate if too long
      Result: JSON.stringify(result),
      ResultType: resultType,
      ExpiresAt: expiresAt
    });
    
    console.log('💾 [AI Cache] Saved to cache');
  } catch (error) {
    console.error('❌ [AI Cache] Error saving to cache:', error);
    // Don't throw error, just log - cache failure shouldn't break the API
  }
}

/**
 * Helper function to clean JSON response from AI
 * Removes markdown code blocks, backticks, and extra whitespace/newlines
 * @param {string} text - Raw text from AI
 * @returns {string} - Cleaned JSON string
 */
function cleanJSON(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  let cleaned = text.trim();
  
  // Remove markdown code blocks (```json, ```, etc.) using regex
  cleaned = cleaned.replace(/```json\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  
  // Remove any leading/trailing whitespace and newlines
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  cleaned = cleaned.replace(/\n+/g, ' ');
  
  // Try to extract JSON object if wrapped in text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  return cleaned.trim();
}

class AIController {
  /**
   * Generate property description using Groq (Llama 3.3)
   * POST /api/ai/generate-description
   */
  static async generateDescription(req, res) {
    try {
      // Check if Groq is configured
      if (!groq) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GROQ_API_KEY in environment variables.'
        });
      }

      // Get input from request body
      const { propertyType, location, features, area, price } = req.body;

      // Validation
      if (!propertyType || !location) {
        return res.status(400).json({
          success: false,
          message: 'propertyType and location are required'
        });
      }

      console.log('🤖 [AI] Generating description for:', { propertyType, location, area, price });

      // TASK 2: AI Caching - Check cache first
      const inputData = { propertyType, location, features, area, price };
      const { cacheKey, inputHash } = generateCacheKey(inputData, 'description');
      
      const cachedResult = await getCachedResult(inputHash);
      if (cachedResult) {
        return res.json({
          success: true,
          description: cachedResult.description || cachedResult,
          fromCache: true
        });
      }

      // Format features array to string
      const featuresText = Array.isArray(features) && features.length > 0
        ? features.join(', ')
        : 'đầy đủ tiện ích';

      // Format price
      const priceText = price 
        ? price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ VND`
          : `${(price / 1000000).toFixed(0)} triệu VND`
        : 'liên hệ';

      // Build prompt
      const prompt = `Viết một đoạn mô tả bán nhà hấp dẫn, chuyên nghiệp bằng tiếng Việt dựa trên các thông tin sau:

- Loại bất động sản: ${propertyType}
- Vị trí: ${location}
- Diện tích: ${area ? area + ' m²' : 'chưa xác định'}
- Giá: ${priceText}
- Đặc điểm: ${featuresText}

Yêu cầu:
- Độ dài khoảng 150 từ
- Tập trung vào lợi ích và điểm nổi bật
- Ngôn ngữ chuyên nghiệp, hấp dẫn
- Không sử dụng markdown, chỉ trả về đoạn văn thuần túy`;

      // Log input before calling API
      console.log('🔍 [AI] Groq Input:', {
        propertyType,
        location,
        area,
        price: priceText,
        promptLength: prompt.length
      });

      // Call Groq API with proper error handling
      console.log('📡 [AI] Calling Groq API with model:', GROQ_MODEL);
      let completion, description;
      
      try {
        completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: GROQ_MODEL,
          temperature: 0.7,
          max_tokens: 500
        });
        
        description = completion.choices[0].message.content;
      } catch (apiError) {
        console.error('❌ [AI] Groq API call failed:', apiError.message);
        console.error('❌ [AI] API Error details:', {
          status: apiError.status,
          statusText: apiError.statusText,
          name: apiError.name
        });
        throw apiError; // Re-throw to be caught by outer catch
      }
      
      console.log('📝 [AI] Raw response from Groq:', description);
      console.log('📝 [AI] Raw response length:', description.length);
      
      // Clean the response (remove markdown, extra whitespace)
      description = cleanAIResponse(description);

      console.log('✅ [AI] Description generated successfully');
      console.log('📝 [AI] Cleaned description length:', description.length);
      console.log('🔍 [AI] Groq Output:', description.substring(0, 100) + '...');

      // TASK 2: AI Caching - Save to cache
      await saveToCache(inputHash, cacheKey, { description }, 'description');

      // Return response
      return res.json({
        success: true,
        description: description,
        fromCache: false
      });

    } catch (error) {
      // TASK 5: Robust Error Handling - Comprehensive error logging
      console.error('❌ [AI] Error generating description:', error);
      console.error('❌ [AI] Error message:', error.message);
      console.error('❌ [AI] Error name:', error.name);
      console.error('❌ [AI] Error code:', error.code);
      console.error('❌ [AI] Error stack:', error.stack);
      
      // Log API-specific errors
      if (error.status) {
        console.error('❌ [AI] API Status:', error.status);
        console.error('❌ [AI] API Status Text:', error.statusText);
      }
      
      // Try to log raw response if available
      if (error.response) {
        console.error('❌ [AI] Raw response from Groq:', error.response);
      }
      
      // Log more details for debugging
      if (error.cause) {
        console.error('❌ [AI] Error cause:', error.cause);
      }
      
      // TASK 5: Return fallback response instead of 500 error
      // Get input data for fallback
      const { propertyType, location, features, area, price } = req.body || {};
      
      // Format price for fallback
      const priceText = price 
        ? price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ VND`
          : `${(price / 1000000).toFixed(0)} triệu VND`
        : 'liên hệ';
      
      // Format features
      const featuresText = Array.isArray(features) && features.length > 0
        ? features.join(', ')
        : 'đầy đủ tiện ích';
      
      // Generate fallback description
      const fallbackDescription = `Căn ${propertyType || 'bất động sản'} tuyệt đẹp tại ${location || 'vị trí đắc địa'}, ` +
        `${area ? `diện tích ${area}m², ` : ''}` +
        `giá ${priceText}. ` +
        `Vị trí thuận lợi, ${featuresText}, tiềm năng đầu tư cao. ` +
        `Liên hệ ngay để được tư vấn chi tiết!`;
      
      console.log('⚠️ [AI] Using fallback description due to API error');
      
      // Return 200 with fallback (not 500) to prevent frontend crash
      return res.json({
        success: true,
        description: fallbackDescription,
        isFallback: true, // Flag to indicate this is a fallback response
        fromCache: false,
        warning: 'AI service tạm thời không khả dụng. Đã sử dụng mô tả mặc định.'
      });
    }
  }

  /**
   * Analyze market using Groq (Llama 3.3)
   * POST /api/ai/analyze-market
   */
  static async analyzeMarket(req, res) {
    try {
      // Check if Groq is configured
      if (!groq) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GROQ_API_KEY in environment variables.'
        });
      }

      // Get input from request body
      const { location, price, area, propertyType } = req.body;

      // Validation
      if (!location || !propertyType) {
        return res.status(400).json({
          success: false,
          message: 'location and propertyType are required'
        });
      }

      console.log('📊 [AI] Analyzing market for:', { propertyType, location, area, price });

      // TASK 2: AI Caching - Check cache first
      const inputData = { location, price, area, propertyType };
      const { cacheKey, inputHash } = generateCacheKey(inputData, 'market_analysis');
      
      const cachedResult = await getCachedResult(inputHash);
      if (cachedResult) {
        return res.json({
          success: true,
          data: cachedResult,
          fromCache: true
        });
      }

      // Format price
      const priceText = price 
        ? price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ VND`
          : `${(price / 1000000).toFixed(0)} triệu VND`
        : 'chưa xác định';

      // Build prompt
      const prompt = `Đóng vai chuyên gia bất động sản Việt Nam. Phân tích bất động sản ${propertyType} tại ${location}, diện tích ${area || 'chưa xác định'}m2, giá ${priceText}.

Hãy đưa ra:
1. Đánh giá giá (Rẻ/Đắt/Hợp lý)
2. Ưu điểm vị trí (mảng 3-5 điểm)
3. Nhược điểm tiềm năng (mảng 3-5 điểm)

QUAN TRỌNG: Trả về kết quả dưới dạng JSON thuần túy (KHÔNG có markdown, KHÔNG có code block, KHÔNG có backticks), chỉ JSON object thuần túy với cấu trúc:
{
  "valuation": "Rẻ" hoặc "Đắt" hoặc "Hợp lý",
  "pros": ["ưu điểm 1", "ưu điểm 2", ...],
  "cons": ["nhược điểm 1", "nhược điểm 2", ...]
}

Chỉ trả về JSON, không có text nào khác.`;

      // Log input
      console.log('🔍 [AI] Groq Input:', {
        propertyType,
        location,
        area,
        price: priceText,
        promptLength: prompt.length
      });

      // Call Groq API with proper error handling
      console.log('📡 [AI] Calling Groq API with model:', GROQ_MODEL);
      let completion, responseText;
      
      try {
        completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: GROQ_MODEL,
          temperature: 0.7,
          max_tokens: 800
        });
        
        responseText = completion.choices[0].message.content;
      } catch (apiError) {
        console.error('❌ [AI] Groq API call failed:', apiError.message);
        console.error('❌ [AI] API Error details:', {
          status: apiError.status,
          statusText: apiError.statusText,
          name: apiError.name
        });
        throw apiError; // Re-throw to be caught by outer catch
      }

      console.log('📝 [AI] Raw response from Groq:', responseText);
      console.log('📝 [AI] Raw response length:', responseText.length);

      // Clean JSON response using helper function
      const cleanedJSON = cleanJSON(responseText);
      console.log('🧹 [AI] Cleaned JSON:', cleanedJSON);

      // Parse JSON with detailed error logging
      let analysisResult;
      try {
        analysisResult = JSON.parse(cleanedJSON);
        console.log('✅ [AI] JSON parsed successfully');
        console.log('🔍 [AI] Groq Output:', JSON.stringify(analysisResult, null, 2));
      } catch (parseError) {
        console.error('❌ [AI] Failed to parse JSON:', responseText);
        console.error('❌ [AI] Parse error message:', parseError.message);
        console.error('❌ [AI] Cleaned JSON text:', cleanedJSON);
        console.error('❌ [AI] Response text length:', responseText.length);
        
        // Return safe fallback object instead of throwing error
        analysisResult = {
          valuation: 'Chưa xác định',
          pros: ['Lỗi phân tích dữ liệu'],
          cons: ['Vui lòng thử lại']
        };
        console.warn('⚠️ [AI] Using fallback structure due to parse error');
      }

      // Validate structure
      if (!analysisResult.valuation || !Array.isArray(analysisResult.pros) || !Array.isArray(analysisResult.cons)) {
        console.warn('⚠️ [AI] Invalid response structure, using fallback');
        console.warn('⚠️ [AI] Received structure:', {
          hasValuation: !!analysisResult.valuation,
          prosIsArray: Array.isArray(analysisResult.pros),
          consIsArray: Array.isArray(analysisResult.cons),
          actualStructure: Object.keys(analysisResult)
        });
        
        analysisResult = {
          valuation: analysisResult.valuation || 'Chưa xác định',
          pros: Array.isArray(analysisResult.pros) ? analysisResult.pros : [],
          cons: Array.isArray(analysisResult.cons) ? analysisResult.cons : []
        };
      }

      console.log('✅ [AI] Market analysis completed successfully');
      console.log('📊 [AI] Analysis result:', {
        valuation: analysisResult.valuation,
        prosCount: analysisResult.pros.length,
        consCount: analysisResult.cons.length
      });

      // TASK 2: AI Caching - Save to cache
      await saveToCache(inputHash, cacheKey, analysisResult, 'market_analysis');

      // Return clean JSON response
      return res.json({
        success: true,
        data: analysisResult,
        fromCache: false
      });

    } catch (error) {
      // TASK 5: Robust Error Handling - Comprehensive error logging
      console.error('❌ [AI] Error analyzing market:', error);
      console.error('❌ [AI] Error message:', error.message);
      console.error('❌ [AI] Error name:', error.name);
      console.error('❌ [AI] Error code:', error.code);
      console.error('❌ [AI] Error stack:', error.stack);
      
      // Log API-specific errors
      if (error.status) {
        console.error('❌ [AI] API Status:', error.status);
        console.error('❌ [AI] API Status Text:', error.statusText);
      }
      
      // Try to log raw response if available
      if (error.response) {
        console.error('❌ [AI] Raw response from Groq:', error.response);
      }
      
      // Log more details for debugging
      if (error.cause) {
        console.error('❌ [AI] Error cause:', error.cause);
      }
      
      // TASK 5: Return fallback instead of 500 error
      // Get input data for fallback
      const { location, price, area, propertyType } = req.body || {};
      
      // Format price for fallback
      const priceText = price 
        ? price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ VND`
          : `${(price / 1000000).toFixed(0)} triệu VND`
        : 'chưa xác định';
      
      // Generate fallback analysis
      const fallbackAnalysis = {
        valuation: 'Hợp lý',
        pros: [
          `Vị trí ${location || 'thuận lợi'}`,
          `${propertyType || 'Bất động sản'} có tiềm năng`,
          'Giá cả phù hợp thị trường'
        ],
        cons: [
          'Cần kiểm tra thực tế',
          'Nên tham khảo thêm ý kiến chuyên gia'
        ]
      };
      
      console.log('⚠️ [AI] Using fallback analysis due to API error');
      
      // Return 200 with fallback (not 500) to prevent frontend crash
      return res.json({
        success: true,
        data: fallbackAnalysis,
        isFallback: true, // Flag to indicate this is a fallback response
        fromCache: false,
        warning: 'AI service tạm thời không khả dụng. Đã sử dụng phân tích mặc định.'
      });
    }
  }

  /**
   * Optimize title using Groq (Llama 3.3)
   * POST /api/ai/optimize-title
   */
  static async optimizeTitle(req, res) {
    try {
      // Check if Groq is configured
      if (!groq) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GROQ_API_KEY in environment variables.'
        });
      }

      // Get input from request body
      const { title, house_type, price, location } = req.body;

      // Validation
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'title is required'
        });
      }

      console.log('✨ [AI] Optimizing title:', { title, house_type, price, location });

      // Format price if available
      const priceText = price 
        ? price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ VND`
          : `${(price / 1000000).toFixed(0)} triệu VND`
        : '';

      // Build context
      let context = '';
      if (house_type) context += `Loại: ${house_type}. `;
      if (location) context += `Vị trí: ${location}. `;
      if (priceText) context += `Giá: ${priceText}. `;

      // Build prompt
      const prompt = `Đóng vai chuyên gia bất động sản Việt Nam. Tối ưu tiêu đề sau để tăng tỷ lệ click:

Tiêu đề hiện tại: "${title}"
${context ? `Thông tin bổ sung: ${context}` : ''}

Yêu cầu:
- Tối ưu tiêu đề để hấp dẫn, thu hút người mua
- Thêm 1 emoji phù hợp (không quá nhiều)
- Giữ độ dài dưới 100 ký tự
- Ngôn ngữ tiếng Việt, chuyên nghiệp
- Tập trung vào điểm nổi bật

Chỉ trả về tiêu đề đã tối ưu, không có text nào khác.`;

      // Call Groq API with proper error handling
      console.log('📡 [AI] Calling Groq API with model:', GROQ_MODEL);
      let completion, optimizedTitle;
      
      try {
        completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: GROQ_MODEL,
          temperature: 0.8,
          max_tokens: 150
        });
        
        optimizedTitle = completion.choices[0].message.content;
      } catch (apiError) {
        console.error('❌ [AI] Groq API call failed:', apiError.message);
        console.error('❌ [AI] API Error details:', {
          status: apiError.status,
          statusText: apiError.statusText,
          name: apiError.name
        });
        throw apiError; // Re-throw to be caught by outer catch
      }

      console.log('📝 [AI] Raw title response from Groq:', optimizedTitle);

      // Clean response using helper function (handles plain text, not JSON)
      optimizedTitle = cleanAIResponse(optimizedTitle);

      // Ensure it's under 100 chars
      if (optimizedTitle.length > 100) {
        optimizedTitle = optimizedTitle.substring(0, 97) + '...';
      }

      console.log('✅ [AI] Title optimized successfully');
      console.log('📝 [AI] Optimized title length:', optimizedTitle.length);

      // Return response
      return res.json({
        success: true,
        data: {
          optimized_title: optimizedTitle,
          original_title: title
        }
      });

    } catch (error) {
      // TASK 5: Robust Error Handling - Comprehensive error logging
      console.error('❌ [AI] Error optimizing title:', error);
      console.error('❌ [AI] Error message:', error.message);
      console.error('❌ [AI] Error name:', error.name);
      console.error('❌ [AI] Error code:', error.code);
      console.error('❌ [AI] Error stack:', error.stack);
      
      // Log API-specific errors
      if (error.status) {
        console.error('❌ [AI] API Status:', error.status);
        console.error('❌ [AI] API Status Text:', error.statusText);
      }
      
      // Try to log raw response if available
      if (error.response) {
        console.error('❌ [AI] Raw response from Groq:', error.response);
      }
      
      // TASK 5: Return fallback response instead of 500 error
      const { title, house_type, location, price } = req.body || {};
      
      // Generate fallback optimized title
      let fallbackTitle = title || 'Bất động sản';
      if (house_type) fallbackTitle = `${house_type} ${fallbackTitle}`;
      if (location) fallbackTitle += ` tại ${location}`;
      if (price) {
        const priceText = price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ`
          : `${(price / 1000000).toFixed(0)} triệu`;
        fallbackTitle += ` - ${priceText} VND`;
      }
      
      // Ensure it's under 100 chars
      if (fallbackTitle.length > 100) {
        fallbackTitle = fallbackTitle.substring(0, 97) + '...';
      }
      
      console.log('⚠️ [AI] Using fallback title due to API error');
      
      // Log more details for debugging
      if (error.cause) {
        console.error('❌ [AI] Error cause:', error.cause);
      }
      
      // Return 200 with fallback (not 500) to prevent frontend crash
      return res.json({
        success: true,
        data: {
          optimized_title: fallbackTitle,
          original_title: title || 'N/A'
        },
        isFallback: true,
        warning: 'AI service tạm thời không khả dụng. Đã sử dụng tiêu đề mặc định.'
      });
    }
  }

  /**
   * Optimize description using Groq (Llama 3.3)
   * POST /api/ai/optimize-description
   */
  static async optimizeDescription(req, res) {
    try {
      // Check if Groq is configured
      if (!groq) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GROQ_API_KEY in environment variables.'
        });
      }

      // Get input from request body
      const { raw_description, house_type, price, location, bedrooms, bathrooms } = req.body;

      // Validation
      if (!house_type || !location) {
        return res.status(400).json({
          success: false,
          message: 'house_type and location are required'
        });
      }

      console.log('📝 [AI] Optimizing description:', { house_type, price, location, bedrooms, bathrooms });

      // Format price
      const priceText = price 
        ? price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ VND`
          : `${(price / 1000000).toFixed(0)} triệu VND`
        : 'liên hệ';

      // Build prompt
      const prompt = `Viết một mô tả bất động sản chuyên nghiệp bằng tiếng Việt dựa trên thông tin sau:

- Loại bất động sản: ${house_type}
- Vị trí: ${location}
- Giá: ${priceText}
${bedrooms ? `- Số phòng ngủ: ${bedrooms}` : ''}
${bathrooms ? `- Số phòng tắm: ${bathrooms}` : ''}
${raw_description ? `- Mô tả hiện tại (tham khảo): ${raw_description}` : ''}

Yêu cầu:
- Viết mô tả chuyên nghiệp, hấp dẫn
- Độ dài khoảng 200-300 từ
- Tập trung vào điểm nổi bật và lợi ích
- Ngôn ngữ tiếng Việt, tự nhiên
- Không sử dụng markdown, chỉ trả về đoạn văn thuần túy`;

      // Call Groq API with proper error handling
      console.log('📡 [AI] Calling Groq API with model:', GROQ_MODEL);
      let completion, optimizedDescription;
      
      try {
        completion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: GROQ_MODEL,
          temperature: 0.7,
          max_tokens: 600
        });
        
        optimizedDescription = completion.choices[0].message.content;
      } catch (apiError) {
        console.error('❌ [AI] Groq API call failed:', apiError.message);
        console.error('❌ [AI] API Error details:', {
          status: apiError.status,
          statusText: apiError.statusText,
          name: apiError.name
        });
        throw apiError; // Re-throw to be caught by outer catch
      }

      console.log('📝 [AI] Raw description response from Groq:', optimizedDescription);
      console.log('📝 [AI] Raw description length:', optimizedDescription.length);

      // Clean response using helper function (handles plain text, not JSON)
      optimizedDescription = cleanAIResponse(optimizedDescription);

      console.log('✅ [AI] Description optimized successfully');
      console.log('📝 [AI] Optimized description length:', optimizedDescription.length);

      // Return response
      return res.json({
        success: true,
        data: {
          optimized_description: optimizedDescription,
          original_description: raw_description || ''
        }
      });

    } catch (error) {
      // TASK 5: Robust Error Handling - Comprehensive error logging
      console.error('❌ [AI] Error optimizing description:', error);
      console.error('❌ [AI] Error message:', error.message);
      console.error('❌ [AI] Error name:', error.name);
      console.error('❌ [AI] Error code:', error.code);
      console.error('❌ [AI] Error stack:', error.stack);
      
      // Log API-specific errors
      if (error.status) {
        console.error('❌ [AI] API Status:', error.status);
        console.error('❌ [AI] API Status Text:', error.statusText);
      }
      
      // Try to log raw response if available
      if (error.response) {
        console.error('❌ [AI] Raw response from Groq:', error.response);
      }
      
      // Log more details for debugging
      if (error.cause) {
        console.error('❌ [AI] Error cause:', error.cause);
      }
      
      // TASK 5: Return fallback response instead of 500 error
      const { raw_description, house_type, location, price, bedrooms, bathrooms } = req.body || {};
      
      // Format price for fallback
      const priceText = price 
        ? price >= 1000000000 
          ? `${(price / 1000000000).toFixed(1)} tỷ VND`
          : `${(price / 1000000).toFixed(0)} triệu VND`
        : 'liên hệ';
      
      // Generate fallback description
      let fallbackDescription = `Căn ${house_type || 'bất động sản'} tuyệt đẹp tại ${location || 'vị trí đắc địa'}, `;
      if (bedrooms) fallbackDescription += `${bedrooms} phòng ngủ, `;
      if (bathrooms) fallbackDescription += `${bathrooms} phòng tắm, `;
      fallbackDescription += `giá ${priceText}. `;
      fallbackDescription += `Vị trí thuận lợi, tiện ích đầy đủ, tiềm năng đầu tư cao. `;
      if (raw_description) {
        fallbackDescription += raw_description.substring(0, 100) + '...';
      } else {
        fallbackDescription += 'Liên hệ ngay để được tư vấn chi tiết!';
      }
      
      console.log('⚠️ [AI] Using fallback description due to API error');
      
      // Return 200 with fallback (not 500) to prevent frontend crash
      return res.json({
        success: true,
        data: {
          optimized_description: fallbackDescription,
          original_description: raw_description || ''
        },
        isFallback: true,
        warning: 'AI service tạm thời không khả dụng. Đã sử dụng mô tả mặc định.'
      });
    }
  }
}

module.exports = AIController;
