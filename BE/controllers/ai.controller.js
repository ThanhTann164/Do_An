const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { userpackages, packages } = require('../models/init-models')(sequelize);
const AppError = require('../Utils/AppError');
const PackageMiddleware = require('../middlewares/packageMiddleware');
const { hasAITool } = require('../constants/packages');
const { isSellerRole, extractRole } = require('../Utils/roleUtils');

const PACKAGE_FORBIDDEN_MESSAGE = 'Bạn không có quyền sử dụng tính năng package';

class AIController {
  // Kiểm tra quyền sử dụng AI tools (Updated to use new middleware)
  static async checkAIPermission(userId, role = null) {
    if (!isSellerRole(role)) {
      return { hasPermission: false, package: null, ai_tools: [] };
    }

    const userPackage = await PackageMiddleware.getUserPackage(userId, role);
    
    if (!userPackage) {
      return { hasPermission: false, package: null, ai_tools: [] };
    }

    const aiTools = userPackage.ai_tools || [];
    const hasAITools = !userPackage.is_free && aiTools.length > 0;

    return {
      hasPermission: hasAITools,
      package: userPackage,
      ai_tools: aiTools
    };
  }

  // POST /api/ai/optimize-title - Tối ưu tiêu đề
  static async optimizeTitle(req, res, next) {
    try {
      const userId = req.user.userId;
      const role = extractRole(req.user);
      if (!isSellerRole(role)) {
        return res.status(403).json({
          success: false,
          message: PACKAGE_FORBIDDEN_MESSAGE
        });
      }
      const { title, raw_title, house_type, price, location } = req.body;
      const titleToOptimize = title || raw_title;

      console.log(`🤖 AI title optimization request from user ${userId}`);

      if (!titleToOptimize) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp tiêu đề cần tối ưu'
        });
      }

      // Kiểm tra quyền AI
      const userPackage = await PackageMiddleware.getUserPackage(userId, role);
      if (!userPackage) {
        return res.status(500).json({
          success: false,
          message: 'Không thể kiểm tra gói dịch vụ'
        });
      }

      if (!hasAITool(userPackage.package_name, 'title_optimization')) {
        return res.status(403).json({
          success: false,
          message: 'Gói của bạn không hỗ trợ AI, vui lòng nâng cấp',
          data: {
            required_packages: ['PRO', 'PREMIUM'],
            current_package: userPackage.package_name,
            feature: 'title_optimization'
          }
        });
      }

      // Simulate AI optimization (trong thực tế sẽ call API AI thật)
      const optimizedTitle = await AIController.simulateAITitleOptimization({
        raw_title: titleToOptimize,
        house_type,
        price,
        location
      });

      console.log(`✅ AI title optimization completed for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Tối ưu tiêu đề thành công',
        data: {
          original_title: titleToOptimize,
          optimized_title: optimizedTitle,
          improvements: [
            'Thêm từ khóa hấp dẫn',
            'Tối ưu độ dài tiêu đề',
            'Thêm thông tin giá trị'
          ],
          ai_confidence: 0.92,
          package_used: userPackage.package_name
        }
      });

    } catch (error) {
      console.error('❌ Error in AI title optimization:', error);
      next(new AppError('Lỗi khi tối ưu tiêu đề', 500));
    }
  }

  // POST /api/ai/optimize-description - Tối ưu mô tả
  static async optimizeDescription(req, res, next) {
    try {
      const userId = req.user.userId;
      const role = extractRole(req.user);
      if (!isSellerRole(role)) {
        return res.status(403).json({
          success: false,
          message: PACKAGE_FORBIDDEN_MESSAGE
        });
      }
      const { raw_description, house_type, price, location, bedrooms, bathrooms } = req.body;

      console.log(`🤖 AI description optimization request from user ${userId}`);

      if (!raw_description) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp mô tả cần tối ưu'
        });
      }

      // Kiểm tra quyền AI
      const userPackage = await PackageMiddleware.getUserPackage(userId, role);
      if (!userPackage) {
        return res.status(500).json({
          success: false,
          message: 'Không thể kiểm tra gói dịch vụ'
        });
      }

      if (!hasAITool(userPackage.package_name, 'description_generation')) {
        return res.status(403).json({
          success: false,
          message: 'Gói của bạn không hỗ trợ AI, vui lòng nâng cấp',
          data: {
            required_packages: ['PRO', 'PREMIUM'],
            current_package: userPackage.package_name,
            feature: 'description_generation'
          }
        });
      }

      // Simulate AI optimization
      const optimizedDescription = await AIController.simulateAIDescriptionOptimization({
        raw_description,
        house_type,
        price,
        location,
        bedrooms,
        bathrooms
      });

      console.log(`✅ AI description optimization completed for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Tối ưu mô tả thành công',
        data: {
          original_description: raw_description,
          optimized_description: optimizedDescription,
          improvements: [
            'Cải thiện cấu trúc câu',
            'Thêm từ khóa SEO',
            'Làm nổi bật điểm mạnh',
            'Tối ưu độ dài nội dung'
          ],
          ai_confidence: 0.89,
          word_count: {
            original: raw_description.split(' ').length,
            optimized: optimizedDescription.split(' ').length
          }
        }
      });

    } catch (error) {
      console.error('❌ Error in AI description optimization:', error);
      next(new AppError('Lỗi khi tối ưu mô tả', 500));
    }
  }

  // GET /api/ai/my-usage - Thống kê sử dụng AI
  static async getMyAIUsage(req, res, next) {
    try {
      const userId = req.user.userId;
      const role = extractRole(req.user);
      if (!isSellerRole(role)) {
        return res.status(403).json({
          success: false,
          message: PACKAGE_FORBIDDEN_MESSAGE
        });
      }
      const { days = 30 } = req.query;

      console.log(`📊 Getting AI usage stats for user ${userId}`);

      // Kiểm tra quyền AI
      const aiPermission = await AIController.checkAIPermission(userId, role);

      // Simulate usage stats (trong thực tế sẽ track từ database)
      const usageStats = {
        title_optimizations: Math.floor(Math.random() * 20),
        description_optimizations: Math.floor(Math.random() * 15),
        total_requests: 0,
        success_rate: 0.95,
        average_improvement_score: 0.87
      };

      usageStats.total_requests = usageStats.title_optimizations + usageStats.description_optimizations;

      res.status(200).json({
        success: true,
        message: 'Lấy thống kê AI thành công',
        data: {
          usage_stats: usageStats,
          ai_permission: aiPermission,
          period_days: parseInt(days),
          available_tools: aiPermission.ai_tools || []
        }
      });

    } catch (error) {
      console.error('❌ Error getting AI usage stats:', error);
      next(new AppError('Lỗi khi lấy thống kê AI', 500));
    }
  }

  // Simulate AI title optimization (replace with real AI API)
  static async simulateAITitleOptimization({ raw_title, house_type, price, location }) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // AI logic: Tạo tiêu đề tối ưu dựa trên thông tin thực tế
    let optimizedTitle = raw_title;
    
    // Thêm emoji và loại nhà nếu chưa có
    if (!optimizedTitle.includes('🏠') && !optimizedTitle.includes('🏡')) {
      optimizedTitle = '🏠 ' + optimizedTitle;
    }
    
    // Thêm loại nhà nếu chưa có
    if (house_type && !optimizedTitle.toLowerCase().includes(house_type.toLowerCase())) {
      optimizedTitle = optimizedTitle.replace('🏠 ', `🏠 ${house_type} `);
    }
    
    // Thêm vị trí nếu có và chưa có trong tiêu đề
    if (location && !optimizedTitle.toLowerCase().includes(location.toLowerCase())) {
      optimizedTitle += ` tại ${location}`;
    }
    
    // Thêm thông tin giá nếu có
    if (price && price > 0) {
      const priceText = price >= 1000000000 ? 
        `${(price / 1000000000).toFixed(1)} tỷ` : 
        `${(price / 1000000).toFixed(0)} triệu`;
      
      if (!optimizedTitle.toLowerCase().includes('giá') && !optimizedTitle.includes('tỷ') && !optimizedTitle.includes('triệu')) {
        optimizedTitle += ` - Giá ${priceText}`;
      }
    }
    
    // Thêm call-to-action ngẫu nhiên
    const callToActions = [
      ' - Cơ hội đầu tư tuyệt vời!',
      ' - Sẵn sàng bàn giao!',
      ' - Giá tốt nhất thị trường!',
      ' - Liên hệ ngay!',
      ' - Đầu tư sinh lời cao!'
    ];
    
    const randomCTA = callToActions[Math.floor(Math.random() * callToActions.length)];
    if (!optimizedTitle.includes('!')) {
      optimizedTitle += randomCTA;
    }

    return optimizedTitle;
  }

  // Simulate AI description optimization (replace with real AI API)
  static async simulateAIDescriptionOptimization({ raw_description, house_type, price, location, bedrooms, bathrooms }) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AI logic: Tạo mô tả tối ưu dựa trên thông tin thực tế
    let optimizedDescription = raw_description;
    
    // Cải thiện mô tả gốc
    if (optimizedDescription.length < 50) {
      optimizedDescription = `${house_type || 'Căn nhà'} ${optimizedDescription.toLowerCase()}`;
    }

    // Tạo các điểm nổi bật dựa trên thông tin thực tế
    const highlights = [];
    
    // Thông tin về loại nhà
    if (house_type) {
      const houseDescriptions = {
        'Nhà phố': 'thiết kế hiện đại, mặt tiền rộng',
        'Căn hộ': 'cao cấp với view đẹp, tiện ích đầy đủ',
        'Villa': 'sang trọng với không gian rộng rãi',
        'Biệt thự': 'đẳng cấp với kiến trúc độc đáo'
      };
      highlights.push(`🏡 ${house_type} ${houseDescriptions[house_type] || 'chất lượng cao'}`);
    }
    
    // Thông tin phòng ngủ và phòng tắm
    if (bedrooms && bedrooms > 0) {
      highlights.push(`🛏️ ${bedrooms} phòng ngủ rộng rãi, thoáng mát, ánh sáng tự nhiên`);
    }
    
    if (bathrooms && bathrooms > 0) {
      highlights.push(`🚿 ${bathrooms} phòng tắm hiện đại, thiết bị cao cấp`);
    }
    
    // Thông tin vị trí cụ thể
    if (location) {
      highlights.push(`📍 Vị trí đắc địa tại ${location}, giao thông thuận lợi`);
      
      // Thêm thông tin chi tiết về khu vực (dựa trên location)
      if (location.toLowerCase().includes('quận 1') || location.toLowerCase().includes('q1')) {
        highlights.push('🏪 Trung tâm thành phố, gần các trung tâm thương mại');
      } else if (location.toLowerCase().includes('quận 7') || location.toLowerCase().includes('q7')) {
        highlights.push('🌆 Khu đô thị hiện đại, môi trường sống xanh');
      } else if (location.toLowerCase().includes('thủ đức')) {
        highlights.push('🎓 Gần các trường đại học, khu công nghệ cao');
      } else if (location.toLowerCase().includes('bình thạnh')) {
        highlights.push('🚇 Gần tuyến metro, kết nối giao thông tốt');
      } else {
        highlights.push('🚗 Kết nối giao thông thuận lợi, tiện ích xung quanh đầy đủ');
      }
    }
    
    // Thông tin giá cả
    if (price && price > 0) {
      const priceInBillion = price / 1000000000;
      if (priceInBillion < 3) {
        highlights.push(`💰 Giá ${priceInBillion.toFixed(1)} tỷ - Cơ hội đầu tư tốt cho gia đình trẻ`);
      } else if (priceInBillion < 10) {
        highlights.push(`💎 Giá ${priceInBillion.toFixed(1)} tỷ - Phù hợp đầu tư cho thuê hoặc ở`);
      } else {
        highlights.push(`👑 Giá ${priceInBillion.toFixed(1)} tỷ - Bất động sản cao cấp, đầu tư sinh lời`);
      }
    }
    
    // Thêm các điểm nổi bật chung
    const generalHighlights = [
      '📋 Pháp lý rõ ràng, sổ hồng chính chủ',
      '🔒 An ninh 24/7, môi trường an toàn',
      '🏥 Gần bệnh viện, trường học, chợ, siêu thị',
      '🚗 Có chỗ để xe ô tô, xe máy tiện lợi'
    ];
    
    // Thêm 2-3 điểm nổi bật chung ngẫu nhiên
    const shuffledGeneral = generalHighlights.sort(() => 0.5 - Math.random());
    highlights.push(...shuffledGeneral.slice(0, 2));
    
    // Thêm call to action
    highlights.push('📞 Liên hệ ngay để được tư vấn chi tiết và xem nhà!');

    const finalDescription = `${optimizedDescription}\n\n✨ ĐIỂM NỔI BẬT:\n${highlights.map(h => `• ${h}`).join('\n')}`;

    return finalDescription;
  }
}

module.exports = AIController;
