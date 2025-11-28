const express = require('express');
const router = express.Router();
const { requireSeller, requireOwnerOrAdmin } = require('../middlewares/roleAuth');

// ========== SELLER ROUTES ==========
// Seller và Admin có thể truy cập

// Dashboard Seller
router.get('/seller/dashboard', requireSeller, (req, res) => {
    res.json({
        success: true,
        message: 'Chào mừng đến Seller Dashboard',
        user: req.user,
        data: {
            myProducts: 12,
            myOrders: 34,
            monthlyRevenue: 15000000,
            pendingOrders: 5
        }
    });
});

// Quản lý sản phẩm của mình
router.get('/seller/products', requireSeller, (req, res) => {
    res.json({
        success: true,
        message: 'Danh sách sản phẩm của bạn',
        data: [
            { 
                id: 1, 
                name: 'Nhà phố 3 tầng', 
                price: 2500000, 
                status: 'Active',
                sellerId: req.user.user_id 
            },
            { 
                id: 2, 
                name: 'Căn hộ 2PN', 
                price: 1800000, 
                status: 'Pending',
                sellerId: req.user.user_id 
            }
        ]
    });
});

// Thêm sản phẩm mới
router.post('/seller/products', requireSeller, (req, res) => {
    const { name, price, description } = req.body;
    
    res.json({
        success: true,
        message: 'Đã thêm sản phẩm mới',
        data: {
            id: Date.now(), // Mock ID
            name,
            price,
            description,
            sellerId: req.user.user_id,
            sellerName: req.user.full_name,
            status: 'Pending' // Cần admin duyệt
        }
    });
});

// Cập nhật sản phẩm của mình
router.put('/seller/products/:productId', requireSeller, (req, res) => {
    const { productId } = req.params;
    const { name, price, description } = req.body;
    
    // TODO: Kiểm tra productId có thuộc về seller này không
    
    res.json({
        success: true,
        message: `Đã cập nhật sản phẩm ID: ${productId}`,
        data: { productId, name, price, description }
    });
});

// Xóa sản phẩm của mình
router.delete('/seller/products/:productId', requireSeller, (req, res) => {
    const { productId } = req.params;
    
    // TODO: Kiểm tra productId có thuộc về seller này không
    
    res.json({
        success: true,
        message: `Đã xóa sản phẩm ID: ${productId}`,
        deletedBy: req.user.email
    });
});

// Xem đơn hàng của sản phẩm mình
router.get('/seller/orders', requireSeller, (req, res) => {
    res.json({
        success: true,
        message: 'Danh sách đơn hàng sản phẩm của bạn',
        data: [
            {
                orderId: 1,
                productName: 'Nhà phố 3 tầng',
                buyerName: 'Nguyễn Văn A',
                price: 2500000,
                status: 'Pending',
                orderDate: '2024-01-15'
            },
            {
                orderId: 2,
                productName: 'Căn hộ 2PN',
                buyerName: 'Trần Thị B',
                price: 1800000,
                status: 'Completed',
                orderDate: '2024-01-10'
            }
        ]
    });
});

// Cập nhật trạng thái đơn hàng
router.put('/seller/orders/:orderId/status', requireSeller, (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // TODO: Kiểm tra order có thuộc về sản phẩm của seller này không
    
    res.json({
        success: true,
        message: `Đã cập nhật trạng thái đơn hàng ${orderId} thành ${status}`,
        updatedBy: req.user.email
    });
});

// Analytics của seller
router.get('/seller/analytics', requireSeller, (req, res) => {
    res.json({
        success: true,
        message: 'Thống kê bán hàng của bạn',
        data: {
            totalRevenue: 15000000,
            totalOrders: 34,
            averageOrderValue: 441176,
            topProducts: ['Nhà phố 3 tầng', 'Căn hộ 2PN'],
            monthlyGrowth: '+8%'
        }
    });
});

module.exports = router;
