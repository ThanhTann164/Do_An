const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Config/jwt.config');

/**
 * Middleware kiểm tra quyền Admin cho các trang UI
 * Redirect về login nếu không có quyền thay vì trả về JSON
 */
function requireAdminPage(req, res, next) {
    // Kiểm tra token từ cookie
    const token = req.cookies && req.cookies.token;
    
    if (!token) {
        return res.redirect('/login?message=Vui lòng đăng nhập để truy cập trang Admin');
    }
    
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        
        // Kiểm tra quyền Admin
        if (payload.role !== 'Admin') {
            return res.redirect('/?message=Bạn không có quyền truy cập trang Admin');
        }
        
        // Nếu JWT có field status và không Active thì chặn
        if (typeof payload.status !== 'undefined' && payload.status !== 'Active') {
            return res.redirect('/login?message=Tài khoản của bạn đã bị khóa');
        }
        
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        return res.redirect('/login?message=Token không hợp lệ, vui lòng đăng nhập lại');
    }
}

/**
 * Middleware kiểm tra quyền Admin cho API
 * Trả về JSON response
 */
function requireAdminAPI(req, res, next) {
    // Kiểm tra token từ header hoặc cookie
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
            message: 'Vui lòng đăng nhập để truy cập API Admin' 
        });
    }
    
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        
        // Kiểm tra quyền Admin
        if (payload.role !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập API Admin'
            });
        }
        
        // Nếu JWT có field status và không Active thì chặn
        if (typeof payload.status !== 'undefined' && payload.status !== 'Active') {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản của bạn đã bị khóa'
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
    requireAdminPage,
    requireAdminAPI
};
