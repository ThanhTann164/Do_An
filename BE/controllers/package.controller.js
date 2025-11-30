const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();
const { packages, userpackages, houses } = require('../models/init-models')(sequelize);
const AppError = require('../Utils/AppError');
const { PACKAGE_RULES, getPackageRules } = require('../constants/packages');
const PackageMiddleware = require('../middlewares/packageMiddleware');
const { isSellerRole, extractRole } = require('../Utils/roleUtils');
const { formatPackagePayload } = require('../Utils/packageFormatter');
const { Op } = require('sequelize');

const PACKAGE_FORBIDDEN_MESSAGE = 'Bạn không có quyền sử dụng tính năng package';

function getRequestRole(req) {
  if (!req || !req.user) {
    return null;
  }
  return extractRole(req.user);
}

function ensureSellerOrForbidden(req, res) {
  const role = getRequestRole(req);
  if (!isSellerRole(role)) {
    res.status(403).json({
      success: false,
      message: PACKAGE_FORBIDDEN_MESSAGE
    });
    return false;
  }
  return true;
}

class PackageController {
  // GET /api/packages - Lấy danh sách tất cả gói
  static async getAllPackages(req, res, next) {
    try {
      console.log('📦 Getting all packages');

      const BASE_FIELDS = [
        'id',
        'name',
        'display_name',
        'price',
        'duration_days',
        'priority_level',
        'is_active',
        'description'
      ];

      const OPTIONAL_FIELDS = [
        'max_posts',
        'max_premium_posts',
        'max_images_per_post',
        'ai_tools',
        'boost_features',
        'features',
        'created_at',
        'updated_at'
      ];

      let attributes = [...BASE_FIELDS];

      try {
        const tableDefinition = await sequelize.getQueryInterface().describeTable('packages');
        const existingOptional = OPTIONAL_FIELDS.filter(field => tableDefinition[field]);
        attributes = [...BASE_FIELDS, ...existingOptional];
      } catch (describeError) {
        console.warn('⚠️  Could not describe packages table, using base fields only:', describeError.message);
      }

      console.log('📦 [getAllPackages] Using attributes:', attributes);

      const allPackages = await packages.findAll({
        attributes,
        where: { is_active: true },
        order: [['priority_level', 'ASC'], ['id', 'ASC']]
      });

      // Safely map packages with error handling
      const packagesData = allPackages.map(pkg => {
        try {
          return pkg.toPublicJSON();
        } catch (err) {
          console.error('❌ Error converting package to JSON:', err, pkg.id);
          // Return basic data if toPublicJSON fails
          return {
            id: pkg.id,
            name: pkg.name || 'UNKNOWN',
            display_name: pkg.display_name || 'Unknown Package',
            price: parseFloat(pkg.price) || 0,
            duration_days: pkg.duration_days || 30,
            is_active: pkg.is_active !== undefined ? pkg.is_active : true
          };
        }
      });

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách gói thành công',
        data: {
          packages: packagesData,
          total: packagesData.length
        }
      });

    } catch (error) {
      console.error('❌ Error getting packages:', error);
      next(new AppError('Lỗi khi lấy danh sách gói: ' + error.message, 500));
    }
  }

  // GET /api/packages/my-package - Lấy gói hiện tại của user
  static async getMyPackage(req, res, next) {
    try {
      console.log('[PackageController] Request user object:', {
        hasUser: !!req.user,
        userId: req.user?.userId,
        id: req.user?.id,
        userObject: req.user ? Object.keys(req.user) : 'NO USER'
      });
      
      const userId = req.user.userId || req.user.id;
      if (!userId) {
        console.error('[PackageController] No userId found in req.user');
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const role = getRequestRole(req);
      console.log('[PackageController] GET /api/packages/my-package', { userId, role, userEmail: req.user?.email || req.user?.Email });

      if (!isSellerRole(role)) {
        console.log('[PackageController] Non-seller detected, skip package fetch');
        return res.json({
          packageName: null,
          isFree: false,
          raw: null
        });
      }

      const activePackage = await userpackages.findOne({
        where: {
          user_id: userId,
          status: 'active',
          end_at: { [Op.gt]: new Date() }
        },
        order: [['end_at', 'DESC']]
      });

      if (!activePackage) {
        console.log('[PackageController] Seller has no active package, default FREE');
        return res.json({
          packageName: 'FREE',
          isFree: true,
          raw: null
        });
      }

      const userPackageDetails = await PackageMiddleware.getUserPackage(userId, role);
      console.log('[PackageController] getUserPackage result:', userPackageDetails ? 'NOT NULL' : 'NULL');
      if (userPackageDetails) {
        console.log('[PackageController] Package details:', {
          name: userPackageDetails.name,
          display_name: userPackageDetails.display_name,
          is_free: userPackageDetails.is_free,
          has_rules: !!userPackageDetails.rules,
          ai_tools: userPackageDetails.ai_tools || []
        });
      }
      
      if (!userPackageDetails) {
        console.log('[PackageController] PackageMiddleware returned null, fallback FREE');
        return res.json({
          packageName: 'FREE',
          isFree: true,
          raw: null
        });
      }

      const formatted = formatPackagePayload(userPackageDetails);
      console.log('[PackageController] formatPackagePayload result:', formatted ? 'NOT NULL' : 'NULL');
      if (formatted) {
        console.log('[PackageController] Formatted package:', {
          userPackage_name: formatted.userPackage?.name,
          has_rules: !!formatted.rules,
          has_features: !!formatted.features
        });
      }
      
      const normalizedName = (formatted?.userPackage?.name || formatted?.name || userPackageDetails.name || 'FREE').toUpperCase();
      console.log('[PackageController] Final response:', {
        packageName: normalizedName,
        isFree: normalizedName === 'FREE',
        hasRaw: !!formatted
      });

      return res.json({
        packageName: normalizedName,
        isFree: normalizedName === 'FREE',
        raw: formatted
      });
    } catch (error) {
      console.error('❌ Error getting user package:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // GET /api/packages/:id - Lấy thông tin chi tiết 1 gói
  static async getPackageById(req, res, next) {
    try {
      const { id } = req.params;
      console.log(`📦 Getting package by ID: ${id}`);

      const packageData = await packages.findOne({
        where: { id, is_active: true }
      });

      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy gói dịch vụ'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin gói thành công',
        data: {
          package: packageData.toPublicJSON()
        }
      });

    } catch (error) {
      console.error('❌ Error getting package by ID:', error);
      next(new AppError('Lỗi khi lấy thông tin gói', 500));
    }
  }

  // POST /api/packages/purchase - Mua gói dịch vụ
  static async purchasePackage(req, res, next) {
    try {
      const userId = req.user.userId;
      if (!ensureSellerOrForbidden(req, res)) {
        return;
      }
      const { package_id, payment_method = 'manual', transaction_id = null } = req.body;

      console.log(`💳 User ${userId} purchasing package ${package_id}`);

      // Validate package_id
      if (!package_id) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn gói dịch vụ'
        });
      }

      // Validate payment_method
      const validPaymentMethods = ['momo', 'vnpay', 'banking', 'manual'];
      if (!validPaymentMethods.includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: `Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: ${validPaymentMethods.join(', ')}`
        });
      }

      // Kiểm tra gói có tồn tại không
      const selectedPackage = await packages.findOne({
        where: { id: package_id, is_active: true }
      });

      if (!selectedPackage) {
        return res.status(404).json({
          success: false,
          message: 'Gói dịch vụ không tồn tại hoặc đã bị vô hiệu hóa'
        });
      }

      // Không cho mua gói FREE (nếu có)
      if (selectedPackage.name === 'FREE') {
        return res.status(400).json({
          success: false,
          message: 'Không thể mua gói miễn phí. Gói này được tự động áp dụng.'
        });
      }

      // Kiểm tra user có gói active không
      const existingPackage = await userpackages.findOne({
        where: {
          user_id: userId,
          status: 'active'
        },
        include: [{
          model: packages,
          as: 'Package'
        }]
      });

      // Nếu có gói active, hủy gói cũ
      if (existingPackage) {
        const endAt = new Date(existingPackage.end_at);
        const now = new Date();
        
        // Chỉ cancel nếu gói còn hiệu lực
        if (endAt > now) {
          await existingPackage.update({ status: 'cancelled' });
          console.log(`🔄 Cancelled existing package ${existingPackage.id} for user ${userId}`);
        } else {
          // Tự động set expired nếu đã hết hạn
          await existingPackage.update({ status: 'expired' });
          console.log(`⏰ Set expired for package ${existingPackage.id}`);
        }
      }

      // Tính toán thời gian bắt đầu và kết thúc
      const startAt = new Date();
      const endAt = new Date();
      endAt.setDate(startAt.getDate() + selectedPackage.duration_days);

      // Tạo transaction_id nếu không có
      const finalTransactionId = transaction_id || `${payment_method.toUpperCase()}_${Date.now()}_${userId}`;

      // Tạo user package mới
      const newUserPackage = await userpackages.create({
        user_id: userId,
        package_id: package_id,
        start_at: startAt,
        end_at: endAt,
        purchase_price: selectedPackage.price,
        payment_method: payment_method,
        transaction_id: finalTransactionId,
        status: 'active',
        boost_used_today: 0,
        last_boost_reset: new Date().toISOString().split('T')[0]
      });

      // Load lại với package info
      const userPackageWithDetails = await userpackages.findByPk(newUserPackage.id, {
        include: [{
          model: packages,
          as: 'Package'
        }]
      });

      // Cập nhật tất cả houses của user với quyền mới
      await houses.update({
        priority_level: selectedPackage.priority_level,
        highlight: selectedPackage.highlight,
        top_priority: selectedPackage.top_priority,
        banner_enabled: selectedPackage.banner_enabled,
        verified_seller_badge: selectedPackage.verified_seller_badge,
        max_cover_media: selectedPackage.max_cover_media
      }, {
        where: {
          OwnerID: userId,
          Status: 'available'
        }
      });

      console.log(`✅ Package purchased successfully for user ${userId}`);

      // Format response theo chuẩn
      res.status(201).json({
        success: true,
        message: `Mua gói ${selectedPackage.display_name} thành công`,
        data: {
          user_package: userPackageWithDetails.toPublicJSON(true),
          package: selectedPackage.toPublicJSON(),
          transaction: {
            transaction_id: finalTransactionId,
            payment_method: payment_method,
            purchase_price: selectedPackage.price,
            purchased_at: startAt.toISOString(),
            expires_at: endAt.toISOString()
          }
        }
      });

    } catch (error) {
      console.error('❌ Error purchasing package:', error);
      next(new AppError('Lỗi khi mua gói dịch vụ', 500));
    }
  }


  // GET /api/packages/history - Lịch sử mua gói
  static async getPackageHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      if (!ensureSellerOrForbidden(req, res)) {
        return;
      }
      const { page = 1, limit = 10 } = req.query;

      console.log(`📦 Getting package history for user ${userId}`);

      const offset = (page - 1) * limit;

      const { count, rows } = await userpackages.findAndCountAll({
        where: { user_id: userId },
        include: [{
          model: packages,
          as: 'Package'
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      const history = rows.map(up => up.toPublicJSON(true));

      res.status(200).json({
        success: true,
        message: 'Lấy lịch sử gói dịch vụ thành công',
        data: {
          history: history,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Error getting package history:', error);
      next(new AppError('Lỗi khi lấy lịch sử gói dịch vụ', 500));
    }
  }

  // POST /api/packages/apply-to-house/:houseId - Áp dụng gói cho house cụ thể
  static async applyPackageToHouse(req, res, next) {
    try {
      const userId = req.user.userId;
      if (!ensureSellerOrForbidden(req, res)) {
        return;
      }
      const { houseId } = req.params;

      console.log(`📦 Applying package to house ${houseId} for user ${userId}`);

      // Kiểm tra house có thuộc về user không
      const house = await houses.findOne({
        where: {
          HouseID: houseId,
          OwnerID: userId
        }
      });

      if (!house) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tin đăng hoặc bạn không có quyền'
        });
      }

      // Lấy gói hiện tại của user
      const currentPackage = await userpackages.findOne({
        where: {
          user_id: userId,
          status: 'active'
        },
        include: [{
          model: packages,
          as: 'Package'
        }]
      });

      let packageToApply;
      if (!currentPackage || currentPackage.isExpired()) {
        // Sử dụng gói free
        packageToApply = await packages.findOne({
          where: { name: 'free' }
        });
      } else {
        packageToApply = currentPackage.Package;
      }

      if (!packageToApply) {
        return res.status(500).json({
          success: false,
          message: 'Không thể xác định gói dịch vụ'
        });
      }

      // Cập nhật house với quyền của gói
      await house.update({
        priority_level: packageToApply.priority_level,
        highlight: packageToApply.highlight,
        top_priority: packageToApply.top_priority,
        banner_enabled: packageToApply.banner_enabled,
        verified_seller_badge: packageToApply.verified_seller_badge,
        max_cover_media: packageToApply.max_cover_media
      });

      console.log(`✅ Applied package ${packageToApply.name} to house ${houseId}`);

      res.status(200).json({
        success: true,
        message: 'Áp dụng gói dịch vụ cho tin đăng thành công',
        data: {
          house_id: houseId,
          package: packageToApply.toPublicJSON(),
          applied_features: {
            priority_level: packageToApply.priority_level,
            highlight: packageToApply.highlight,
            top_priority: packageToApply.top_priority,
            banner_enabled: packageToApply.banner_enabled,
            verified_seller_badge: packageToApply.verified_seller_badge,
            max_cover_media: packageToApply.max_cover_media
          }
        }
      });

    } catch (error) {
      console.error('❌ Error applying package to house:', error);
      next(new AppError('Lỗi khi áp dụng gói dịch vụ', 500));
    }
  }
}

module.exports = PackageController;
