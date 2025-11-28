const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Config/jwt.config');

/**
 * Middleware kiểm tra quyền truy cập theo role
 * @param {Array} allowedRoles - Danh sách các role được phép truy cập
 * @returns {Function} Middleware function
 */
function requireRole(allowedRoles) {
    return function(req, res, next) {
        // Kiểm tra token trước
        const authHeader = req.headers['authorization'] || req.get('Authorization');
        let token = null;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Vui lòng đăng nhập để truy cập' 
            });
        }
        
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload;
            
            // Kiểm tra role
            if (!allowedRoles.includes(payload.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Bạn không có quyền truy cập. Cần quyền: ${allowedRoles.join(', ')}`
                });
            }
            
            next();
        } catch (err) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token không hợp lệ hoặc đã hết hạn' 
            });
        }
    };
}

/**
 * Middleware chỉ cho phép Admin
 */
const requireAdmin = requireRole(['Admin']);

/**
 * Middleware chỉ cho phép Seller và Admin
 */
const requireSeller = requireRole(['Seller', 'Admin']);

/**
 * Middleware cho phép tất cả user đã đăng nhập (Buyer, Seller, Admin)
 */
const requireAuth = requireRole(['Buyer', 'Seller', 'Admin']);

/**
 * Middleware chỉ cho phép Buyer và Admin
 */
const requireBuyer = requireRole(['Buyer', 'Admin']);

/**
 * Middleware kiểm tra quyền sở hữu hoặc Admin
 * Dùng để kiểm tra user chỉ có thể truy cập dữ liệu của chính mình
 */
function requireOwnerOrAdmin(req, res, next) {
    const authHeader = req.headers['authorization'] || req.get('Authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Vui lòng đăng nhập để truy cập' 
        });
    }
    
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        
        // Admin có thể truy cập tất cả
        if (payload.role === 'Admin') {
            return next();
        }
        
        // Kiểm tra xem user có phải là chủ sở hữu không
        const targetUserId = req.params.userId || req.body.userId || req.query.userId;
        const tokenUserId = payload.userId || payload.user_id;
        if (targetUserId && tokenUserId && tokenUserId.toString() !== targetUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bạn chỉ có thể truy cập dữ liệu của chính mình'
            });
        }
        
        next();
    } catch (err) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token không hợp lệ hoặc đã hết hạn' 
        });
    }
}

module.exports = {
    requireRole,
    requireAdmin,
    requireSeller,
    requireAuth,
    requireBuyer,
    requireOwnerOrAdmin
};
