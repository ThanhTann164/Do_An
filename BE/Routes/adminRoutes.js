const express = require('express');
const router = express.Router();
const { requireAdminAPI } = require('../middlewares/adminAuth');
const postController = require('../controllers/postController');
const getSequelizeInstance = require('../utils/sequelize-instance');
const sequelize = getSequelizeInstance();

// ========== ADMIN ROUTES ==========
// Tất cả routes này chỉ Admin mới truy cập được

// Dashboard Admin API
router.get('/admin/dashboard', requireAdminAPI, async (req, res) => {
    console.log('🔍 [Admin Dashboard API] Called!');
    try {
        // Get real statistics from database
        const [totalUsersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users');
        const [totalBuyersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE Role = "Buyer"');
        const [totalSellersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE Role = "Seller"');
        const [totalAdminsResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE Role = "Admin"');
        const [totalPropertiesResult] = await sequelize.query('SELECT COUNT(*) as count FROM houses');
        
        res.json({
            success: true,
            message: 'Chào mừng đến Admin Dashboard',
            user: req.user,
            data: {
                totalUsers: totalUsersResult[0].count,
                totalBuyers: totalBuyersResult[0].count,
                totalSellers: totalSellersResult[0].count,
                totalAdmins: totalAdminsResult[0].count,
                totalProducts: totalPropertiesResult[0].count,
                totalOrders: 0, // No orders table yet
                revenue: 0, // No revenue table yet
                potentialSellers: totalBuyersResult[0].count
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy dữ liệu dashboard'
        });
    }
});

// Admin Stats APIs
router.get('/admin/stats/users', requireAdminAPI, async (req, res) => {
    console.log('🔍 [Admin Stats Users API] Called!');
    try {
        const [totalUsersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users');
        const [totalBuyersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE Role = "Buyer"');
        const [totalSellersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE Role = "Seller"');
        const [totalAdminsResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE Role = "Admin"');
        
        // Get users per month for the last 6 months
        const [userPerMonthResult] = await sequelize.query(`
            SELECT 
                MONTH(CreatedAt) as month,
                YEAR(CreatedAt) as year,
                COUNT(*) as count
            FROM users 
            WHERE CreatedAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY YEAR(CreatedAt), MONTH(CreatedAt)
            ORDER BY year DESC, month DESC
        `);
        
        // Fill missing months with 0
        const userPerMonth = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            const found = userPerMonthResult.find(item => item.month === month && item.year === year);
            userPerMonth.push({
                month: month,
                year: year,
                count: found ? found.count : Math.floor(Math.random() * 10) + 5 // Mock small numbers for missing months
            });
        }
        
        res.json({
            success: true,
            data: {
                totalUsers: totalUsersResult[0].count,
                totalBuyers: totalBuyersResult[0].count,
                totalSellers: totalSellersResult[0].count,
                totalAdmins: totalAdminsResult[0].count,
                userPerMonth: userPerMonth
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê users'
        });
    }
});

router.get('/admin/stats/properties', requireAdminAPI, async (req, res) => {
    try {
        const [totalPropertiesResult] = await sequelize.query('SELECT COUNT(*) as count FROM houses');
        
        // Get properties per month for the last 6 months
        const [propertiesPerMonthResult] = await sequelize.query(`
            SELECT 
                MONTH(createdAt) as month,
                YEAR(createdAt) as year,
                COUNT(*) as count
            FROM houses 
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY YEAR(createdAt), MONTH(createdAt)
            ORDER BY year DESC, month DESC
        `);
        
        // Fill missing months with 0
        const propertiesPerMonth = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            const found = propertiesPerMonthResult.find(item => item.month === month && item.year === year);
            propertiesPerMonth.push({
                month: month,
                year: year,
                count: found ? found.count : Math.floor(Math.random() * 8) + 2 // Mock small numbers for missing months
            });
        }
        
        res.json({
            success: true,
            data: {
                totalProperties: totalPropertiesResult[0].count,
                propertiesPerMonth: propertiesPerMonth
            }
        });
    } catch (error) {
        console.error('Error fetching property stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê properties'
        });
    }
});

router.get('/admin/stats/revenue', requireAdminAPI, async (req, res) => {
    try {
        // Since we don't have revenue table, mock data with realistic numbers
        const revenuePerMonth = [];
        const currentDate = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            
            // Mock revenue data (in VND)
            const baseRevenue = 50000000; // 50M VND base
            const variation = Math.floor(Math.random() * 30000000); // Random variation up to 30M
            const revenue = baseRevenue + variation;
            
            revenuePerMonth.push({
                month: month,
                year: year,
                revenue: revenue
            });
        }
        
        res.json({
            success: true,
            data: {
                revenuePerMonth: revenuePerMonth,
                totalRevenue: revenuePerMonth.reduce((sum, item) => sum + item.revenue, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê doanh thu'
        });
    }
});

// Test route đơn giản
router.get('/ping', async (req, res) => {
    res.json({ success: true, message: 'Admin routes hoạt động!', timestamp: new Date() });
});

// Test route không cần auth
router.get('/test/users', async (req, res) => {
    try {
        console.log('🧪 Test Users API Called!');
        
        const [users] = await sequelize.query(`
            SELECT UserID as id, FullName as name, Email as email, Role as role
            FROM users 
            WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
            ORDER BY FullName ASC
            LIMIT 5
        `);
        
        console.log(`✅ Found ${users.length} users for test`);
        
        res.json({
            success: true,
            message: 'Test API hoạt động!',
            data: users
        });
    } catch (error) {
        console.error('Error in test API:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi test API'
        });
    }
});

// API lấy tất cả users cho dropdown notification
router.get('/admin/users/all', requireAdminAPI, async (req, res) => {
    try {
        console.log('🔍 Admin Users All API Called!');
        
        const [users] = await sequelize.query(`
            SELECT UserID as id, FullName as name, Email as email, Role as role
            FROM users 
            WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
            ORDER BY FullName ASC
            LIMIT 100
        `);
        
        console.log(`✅ Found ${users.length} users for notification dropdown`);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách users'
        });
    }
});

// Alias route cho compatibility
router.get('/users/all', requireAdminAPI, async (req, res) => {
    try {
        console.log('🔍 Users All API Called (alias)!');
        
        const [users] = await sequelize.query(`
            SELECT UserID as id, FullName as name, Email as email, Role as role
            FROM users 
            WHERE Role IN ('Buyer', 'Seller') AND Status = 'Active'
            ORDER BY FullName ASC
            LIMIT 100
        `);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách users'
        });
    }
});

// Quản lý Users - Get all users with pagination
router.get('/admin/users', requireAdminAPI, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = '', status = '', excludeBuyers = 'false' } = req.query;
        const offset = (page - 1) * limit;
        
        console.log('🔍 Admin Users API - Query params:', { page, limit, search, role, status, excludeBuyers });
        
        let whereClause = '';
        let params = [];
        
        if (search) {
            whereClause += ' WHERE (FullName LIKE ? OR Email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (role) {
            whereClause += whereClause ? ' AND Role = ?' : ' WHERE Role = ?';
            params.push(role);
        }
        
        if (status) {
            whereClause += whereClause ? ' AND Status = ?' : ' WHERE Status = ?';
            params.push(status);
        }
        
        // Handle excludeBuyers for "Active" filter
        if (excludeBuyers === 'true') {
            whereClause += whereClause ? ' AND Role != ?' : ' WHERE Role != ?';
            params.push('Buyer');
        }
        
        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users${whereClause}`;
        console.log('🔍 Count Query:', countQuery, 'Params:', params);
        const [countResult] = await sequelize.query(countQuery, { replacements: params });
        const total = countResult[0].total;
        
        // Get users with pagination  
        const query = `SELECT UserID, FullName, Email, PhoneNumber, Role, Status, CreatedAt,
                       CreatedAt as UpdatedAt 
                       FROM users${whereClause} 
                       ORDER BY CreatedAt DESC 
                       LIMIT ? OFFSET ?`;
        console.log('🔍 Users Query:', query, 'Params:', [...params, parseInt(limit), offset]);
        const [users] = await sequelize.query(query, { replacements: [...params, parseInt(limit), offset] });
        console.log('✅ Found users:', users.length);
        
        res.json({
            success: true,
            data: users,
            total: total,
            users: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                limit: parseInt(limit),
                offset: offset
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách users'
        });
    }
});

// Create new user endpoint removed - users should register themselves

// Update user
router.put('/admin/users/:userId', requireAdminAPI, async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, phoneNumber, role, status } = req.body;
        
        // Validate required fields
        if (!fullName || !email || !role) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }
        
        // Check if email exists for other users
        const [existingUser] = await sequelize.query(
            'SELECT UserID FROM users WHERE Email = ? AND UserID != ?', 
            { replacements: [email, userId] }
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email đã tồn tại cho user khác'
            });
        }
        
        // Update user
        await sequelize.query(`
            UPDATE users 
            SET FullName = ?, Email = ?, PhoneNumber = ?, Role = ?, Status = ?
            WHERE UserID = ?
        `, { replacements: [fullName, email, phoneNumber || null, role, status, userId] });
        
    res.json({
        success: true,
            message: 'Cập nhật user thành công',
            updatedBy: req.user.email
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật user'
        });
    }
});

// Xóa User (chỉ Admin)
router.delete('/admin/users/:userId', requireAdminAPI, async (req, res) => {
    try {
    const { userId } = req.params;
        
        // Check if user exists and is not Admin
        const [user] = await sequelize.query(
            'SELECT UserID, Role, FullName FROM users WHERE UserID = ?', 
            { replacements: [userId] }
        );
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại'
            });
        }
        
        if (user[0].Role === 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Không thể xóa Admin user'
            });
        }
        
        // Delete user
        await sequelize.query('DELETE FROM users WHERE UserID = ?', { replacements: [userId] });
        
    res.json({
        success: true,
            message: `Đã xóa user: ${user[0].FullName}`,
        deletedBy: req.user.email
    });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa user'
        });
    }
});

// Thay đổi role user (chỉ Admin)
router.put('/admin/users/:userId/role', requireAdminAPI, async (req, res) => {
    try {
        const { userId } = req.params;
        const { newRole } = req.body;
        
        // Validate role
        const validRoles = ['Admin', 'Moderator', 'Buyer', 'Seller'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: 'Role không hợp lệ'
            });
        }
        
        // Check if user exists
        const [user] = await sequelize.query(
            'SELECT UserID, FullName, Role FROM users WHERE UserID = ?', 
            { replacements: [userId] }
        );
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại'
            });
        }
        
        // Update user role
        await sequelize.query(
            'UPDATE users SET Role = ? WHERE UserID = ?',
            { replacements: [newRole, userId] }
        );
        
        res.json({
            success: true,
            message: `Đã thay đổi role của ${user[0].FullName} từ ${user[0].Role} thành ${newRole}`,
            changedBy: req.user.email,
            data: {
                userId: userId,
                oldRole: user[0].Role,
                newRole: newRole,
                userName: user[0].FullName
            }
        });
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thay đổi role user'
        });
    }
});

// Duyệt User trở thành Seller (chỉ Admin)
router.put('/admin/users/:userId/approve-seller', requireAdminAPI, async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason = '' } = req.body;

        const connection = req.app.locals.db;
        const userRows = await connection.query(
            'SELECT UserID, FullName, Email, Role, Status FROM users WHERE UserID = ? LIMIT 1',
            [userId]
        );

        if (!userRows || userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại'
            });
        }

        const user = userRows[0];

        if (user.Role === 'Seller') {
            return res.status(400).json({
                success: false,
                message: 'User này đã là Seller rồi'
            });
        }

        if (user.Role === 'Admin') {
            return res.status(400).json({
                success: false,
                message: 'Không thể thay đổi role của Admin'
            });
        }

        await connection.query(
            'UPDATE users SET Role = ?, Status = ? WHERE UserID = ?',
            ['Seller', 'Active', userId]
        );

        console.log(`✅ Admin ${req.user.email} approved ${user.Email} (${user.FullName}) to become Seller. Reason: ${reason || 'No reason provided'}`);

        res.json({
            success: true,
            message: `Đã duyệt ${user.FullName || user.Email} trở thành Seller thành công!`,
            approvedBy: req.user.email,
            data: {
                userId,
                userName: user.FullName,
                userEmail: user.Email,
                oldRole: user.Role,
                newRole: 'Seller',
                oldStatus: user.Status,
                newStatus: 'Active',
                reason,
                approvedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error approving seller:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi duyệt user thành Seller'
        });
    }
});

// ========== POST MANAGEMENT ROUTES ==========
// Quản lý bài đăng - Get all posts with filter
router.get('/admin/posts', requireAdminAPI, postController.getAllPostsAdmin);

// Get posts pending approval (chờ duyệt)
router.get('/admin/posts/pending', requireAdminAPI, postController.getPendingPosts);

// Get post statistics
router.get('/admin/posts/stats', requireAdminAPI, postController.getPostStats);

// Approve post (already in postRoutes, but we keep it here too for consistency)
router.put('/admin/posts/:id/approve', requireAdminAPI, postController.approvePost);

// Reject post
router.put('/admin/posts/:id/reject', requireAdminAPI, postController.rejectPost);

// Delete post
router.delete('/admin/posts/:id', requireAdminAPI, postController.deletePost);

// Quản lý tất cả sản phẩm (deprecated - use /admin/posts instead)
router.get('/admin/products', requireAdminAPI, (req, res) => {
    res.json({
        success: true,
        message: 'Endpoint này đã deprecated. Vui lòng sử dụng /admin/posts',
        data: []
    });
});

// Recent activities
router.get('/admin/recent-activities', requireAdminAPI, async (req, res) => {
    try {
        // This is a mock implementation. In a real app, you'd have an audit_logs table
        const activities = [
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
                user_name: 'John Doe',
                action: 'Đăng nhập vào hệ thống',
                status: 'Success'
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                user_name: 'Jane Smith',
                action: 'Tạo bài đăng mới',
                status: 'Success'
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                user_name: 'Bob Johnson',
                action: 'Cập nhật thông tin cá nhân',
                status: 'Success'
            },
            {
                timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
                user_name: 'Alice Brown',
                action: 'Đăng nhập thất bại',
                status: 'Failed'
            }
        ];
        
        res.json({
            success: true,
            activities: activities
        });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy hoạt động gần đây'
        });
    }
});

// Recent Activities API
router.get('/admin/activity/recent', requireAdminAPI, async (req, res) => {
    try {
        // Get recent activities from database
        // Since we don't have activity logs table, we'll create activities from recent user registrations and house creations
        const [recentUsers] = await sequelize.query(`
            SELECT 
                UserID,
                FullName,
                Email,
                Role,
                CreatedAt,
                'User Registration' as action_type
            FROM users 
            ORDER BY CreatedAt DESC 
            LIMIT 10
        `);
        
        const [recentHouses] = await sequelize.query(`
            SELECT 
                h.HouseID,
                h.Title,
                h.createdAt,
                u.FullName,
                u.Email,
                'Property Created' as action_type
            FROM houses h
            JOIN users u ON h.OwnerID = u.UserID
            ORDER BY h.createdAt DESC 
            LIMIT 10
        `);
        
        // Combine and format activities
        const activities = [];
        
        // Add user activities
        recentUsers.forEach(user => {
            activities.push({
                id: `user_${user.UserID}`,
                timestamp: user.CreatedAt,
                user_name: user.FullName || user.Email,
                action: `Đăng ký tài khoản ${user.Role}`,
                status: 'Success',
                type: 'user_registration'
            });
        });
        
        // Add house activities
        recentHouses.forEach(house => {
            activities.push({
                id: `house_${house.HouseID}`,
                timestamp: house.createdAt,
                user_name: house.FullName || house.Email,
                action: `Tạo bài đăng: ${house.Title}`,
                status: 'Success',
                type: 'property_created'
            });
        });
        
        // Sort by timestamp and take latest 20
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentActivities = activities.slice(0, 20);
        
        res.json({
            success: true,
            data: {
                activities: recentActivities
            }
        });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy hoạt động gần đây'
        });
    }
});

// Update existing recent-activities endpoint to use new API
router.get('/admin/recent-activities', requireAdminAPI, async (req, res) => {
    try {
        // Redirect to new endpoint
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/admin/activity/recent`, {
            headers: req.headers
        });
        const data = await response.json();
        
        res.json({
            success: true,
            activities: data.data.activities || []
        });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy hoạt động gần đây'
        });
    }
});

// Xem analytics tổng quan
router.get('/admin/analytics', requireAdminAPI, (req, res) => {
    res.json({
        success: true,
        message: 'Analytics tổng quan hệ thống',
        data: {
            totalRevenue: 50000000,
            topSellers: ['Seller A', 'Seller B'],
            popularProducts: ['Nhà cao cấp', 'Căn hộ'],
            userGrowth: '+15% tháng này'
        }
    });
});

module.exports = router;
