const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️  Warning: GEMINI_API_KEY or GOOGLE_AI_API_KEY not found in environment variables');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

class AIController {
  /**
   * Generate property description using Google Gemini
   * POST /api/ai/generate-description
   */
  static async generateDescription(req, res) {
    try {
      // Check if Gemini is configured
      if (!model) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GEMINI_API_KEY in environment variables.'
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

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const description = response.text().trim();

      console.log('✅ [AI] Description generated successfully');

      // Return response
      return res.json({
        success: true,
        description: description
      });

    } catch (error) {
      console.error('❌ [AI] Error generating description:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo mô tả. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Analyze market using Google Gemini
   * POST /api/ai/analyze-market
   */
  static async analyzeMarket(req, res) {
    try {
      // Check if Gemini is configured
      if (!model) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GEMINI_API_KEY in environment variables.'
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

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      console.log('📝 [AI] Raw response:', responseText);

      // Clean response - remove markdown code blocks if any
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to extract JSON if wrapped in text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseText = jsonMatch[0];
      }

      // Parse JSON
      let analysisResult;
      try {
        analysisResult = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ [AI] JSON parse error:', parseError);
        console.error('❌ [AI] Response text:', responseText);
        // Fallback: create a structured response from text
        analysisResult = {
          valuation: 'Hợp lý',
          pros: ['Vị trí thuận lợi', 'Giá cả phù hợp', 'Tiềm năng phát triển'],
          cons: ['Cần kiểm tra pháp lý', 'Xem xét giao thông', 'Đánh giá môi trường xung quanh']
        };
      }

      // Validate structure
      if (!analysisResult.valuation || !Array.isArray(analysisResult.pros) || !Array.isArray(analysisResult.cons)) {
        console.warn('⚠️ [AI] Invalid response structure, using fallback');
        analysisResult = {
          valuation: analysisResult.valuation || 'Hợp lý',
          pros: Array.isArray(analysisResult.pros) ? analysisResult.pros : ['Vị trí thuận lợi'],
          cons: Array.isArray(analysisResult.cons) ? analysisResult.cons : ['Cần kiểm tra thêm']
        };
      }

      console.log('✅ [AI] Market analysis completed successfully');

      // Return clean JSON response
      return res.json({
        success: true,
        data: analysisResult
      });

    } catch (error) {
      console.error('❌ [AI] Error analyzing market:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi phân tích thị trường. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Optimize title using Google Gemini
   * POST /api/ai/optimize-title
   */
  static async optimizeTitle(req, res) {
    try {
      // Check if Gemini is configured
      if (!model) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GEMINI_API_KEY in environment variables.'
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

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let optimizedTitle = response.text().trim();

      // Clean up response - remove quotes if wrapped
      optimizedTitle = optimizedTitle.replace(/^["']|["']$/g, '').trim();

      // Ensure it's under 100 chars
      if (optimizedTitle.length > 100) {
        optimizedTitle = optimizedTitle.substring(0, 97) + '...';
      }

      console.log('✅ [AI] Title optimized successfully');

      // Return response
      return res.json({
        success: true,
        data: {
          optimized_title: optimizedTitle,
          original_title: title
        }
      });

    } catch (error) {
      console.error('❌ [AI] Error optimizing title:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tối ưu tiêu đề. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Optimize description using Google Gemini
   * POST /api/ai/optimize-description
   */
  static async optimizeDescription(req, res) {
    try {
      // Check if Gemini is configured
      if (!model) {
        return res.status(500).json({
          success: false,
          message: 'AI service is not configured. Please set GEMINI_API_KEY in environment variables.'
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

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const optimizedDescription = response.text().trim();

      console.log('✅ [AI] Description optimized successfully');

      // Return response
      return res.json({
        success: true,
        data: {
          optimized_description: optimizedDescription,
          original_description: raw_description || ''
        }
      });

    } catch (error) {
      console.error('❌ [AI] Error optimizing description:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tối ưu mô tả. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AIController;
