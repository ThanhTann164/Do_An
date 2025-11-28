const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../Config/jwt.config');
const getSequelizeInstance = require('../utils/sequelize-instance');
const { normalizeRole, extractRole } = require('../Utils/roleUtils');
const sequelize = getSequelizeInstance();

/**
 * Sign JWT token
 * @param {Object} payload - Data to encode in token (userId, email, roles)
 * @returns {String} JWT token
 */
function sign(payload) {
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Basic JWT verification middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
async function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "No token provided" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, roles, iat, exp }
    const resolvedRole = extractRole(req.user);
    req.user.role = resolvedRole;
    req.user.roleNormalized = normalizeRole(resolvedRole);
    
    // Check package expiry and auto-downgrade to FREE if expired
    await checkAndUpdateExpiredPackage(decoded.userId);
    
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
}

/**
 * Middleware kiểm tra quyền truy cập theo role
 * @param {Array} allowedRoles - Danh sách các role được phép truy cập (optional)
 * @returns {Function} Middleware function
 */
function authMiddleware(allowedRoles = []) {
  return function(req, res, next) {
    console.log(`\n🔐 ========== AUTH MIDDLEWARE ==========`);
    console.log(`📍 URL: ${req.method} ${req.url}`);
    console.log(`🎭 Allowed roles:`, allowedRoles);
    
    // Kiểm tra token từ header hoặc cookie
    const authHeader = req.headers['authorization'] || req.get('Authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log(`✅ Token found in Authorization header`);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log(`✅ Token found in cookies`);
    }
    
    if (!token) {
      console.error(`❌ No token found!`);
      return res.status(401).json({ 
        success: false, 
        message: 'Vui lòng đăng nhập để truy cập' 
      });
    }
    
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      const resolvedRole = extractRole(payload);
      req.user.role = resolvedRole;
      req.user.roleNormalized = normalizeRole(resolvedRole);
      
      console.log(`✅ [authMiddleware] Token verified. User:`, { userId: payload.userId, email: payload.email, role: resolvedRole || payload.roles });
      
      // Đảm bảo req.user.id được set (một số code có thể dùng req.user.id thay vì req.user.userId)
      if (!req.user.id && req.user.userId) {
        req.user.id = req.user.userId;
      }
      
      // Kiểm tra role nếu có yêu cầu
      if (allowedRoles.length > 0) {
        // Check if user has any of the allowed roles
        const userRoles = payload.roles || [payload.role];
        const hasPermission = userRoles.some(role => allowedRoles.includes(role));
        
        console.log(`🔍 Checking permission... User roles: ${userRoles}, Allowed: ${allowedRoles}, Has permission: ${hasPermission}`);
        
        if (!hasPermission) {
          console.error(`❌ Permission denied!`);
          return res.status(403).json({
            success: false,
            message: `Bạn không có quyền truy cập. Cần quyền: ${allowedRoles.join(', ')}`
          });
        }
      }
      
      console.log(`✅ Auth middleware passed, calling next()...`);
      next();
    } catch (err) {
      console.error('JWT verification error:', err.message);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Token received:', token ? `${token.substring(0, 20)}...` : 'null');
        console.error('JWT_SECRET defined:', !!process.env.JWT_SECRET);
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ hoặc đã hết hạn',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  };
}

/**
 * Check and update expired packages to FREE
 * @param {Number} userId - User ID
 */
async function checkAndUpdateExpiredPackage(userId) {
  try {
    const [result] = await sequelize.query(`
      UPDATE user_packages 
      SET status = 'expired' 
      WHERE user_id = ? 
        AND status = 'active' 
        AND end_at < NOW()
    `, { replacements: [userId] });
    
    if (result.affectedRows > 0) {
      console.log(`📦 Package expired for user ${userId}, auto-downgraded to FREE`);
    }
  } catch (error) {
    console.error('❌ Error checking package expiry:', error);
    // Don't block the request if package check fails
  }
}

module.exports = { 
  sign,           // Export sign function
  verifyJWT, 
  authMiddleware,
  checkAndUpdateExpiredPackage
};