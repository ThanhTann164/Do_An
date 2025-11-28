const express = require('express');
const router = express.Router();
const { requireBuyer, requireAuth, requireOwnerOrAdmin } = require('../middlewares/roleAuth');

// ========== BUYER ROUTES ==========
// Buyer và Admin có thể truy cập

// Dashboard Buyer
router.get('/buyer/dashboard', requireAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Chào mừng đến Buyer Dashboard',
        user: req.user,
        data: {
            favoriteProducts: 8,
            myOrders: 5,
            totalSpent: 8500000,
            savedProperties: 12
        }
    });
});

// Xem danh sách sản phẩm (tất cả user có thể xem)
router.get('/buyer/products', requireAuth, (req, res) => {
    const { category, minPrice, maxPrice, location } = req.query;
    
    res.json({
        success: true,
        message: 'Danh sách sản phẩm bất động sản',
        filters: { category, minPrice, maxPrice, location },
        data: [
            {
                id: 1,
                name: 'Nhà phố 3 tầng',
                price: 2500000,
                location: 'Quận 1, TP.HCM',
                seller: 'Công ty ABC',
                images: ['image1.jpg', 'image2.jpg'],
                status: 'Available'
            },
            {
                id: 2,
                name: 'Căn hộ cao cấp 2PN',
                price: 1800000,
                location: 'Quận 7, TP.HCM',
                seller: 'Công ty XYZ',
                images: ['image3.jpg'],
                status: 'Available'
            }
        ]
    });
});

// Xem chi tiết sản phẩm
router.get('/buyer/products/:productId', requireAuth, (req, res) => {
    const { productId } = req.params;
    
    res.json({
        success: true,
        message: 'Chi tiết sản phẩm',
        data: {
            id: productId,
            name: 'Nhà phố 3 tầng',
            price: 2500000,
            description: 'Nhà phố đẹp, vị trí thuận lợi...',
            location: 'Quận 1, TP.HCM',
            area: '120m²',
            bedrooms: 3,
            bathrooms: 2,
            seller: {
                name: 'Công ty ABC',
                phone: '0123456789',
                email: 'abc@company.com'
            },
            images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
            amenities: ['Gần trường học', 'Gần bệnh viện', 'Giao thông thuận lợi']
        }
    });
});

// Tạo đơn hàng mới
router.post('/buyer/orders', requireAuth, (req, res) => {
    const { productId, message, contactInfo } = req.body;
    
    res.json({
        success: true,
        message: 'Đã tạo yêu cầu mua. Seller sẽ liên hệ với bạn sớm.',
        data: {
            orderId: Date.now(), // Mock ID
            productId,
            buyerId: req.user.user_id,
            buyerName: req.user.full_name,
            status: 'Pending',
            message,
            contactInfo,
            createdAt: new Date().toISOString()
        }
    });
});

// Xem đơn hàng của mình
router.get('/buyer/orders', requireAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Danh sách đơn hàng của bạn',
        data: [
            {
                orderId: 1,
                productName: 'Nhà phố 3 tầng',
                sellerName: 'Công ty ABC',
                price: 2500000,
                status: 'Pending',
                orderDate: '2024-01-15',
                message: 'Tôi quan tâm đến bất động sản này'
            },
            {
                orderId: 2,
                productName: 'Căn hộ 2PN',
                sellerName: 'Công ty XYZ',
                price: 1800000,
                status: 'Contacted',
                orderDate: '2024-01-10',
                message: 'Có thể xem nhà vào cuối tuần không?'
            }
        ]
    });
});

// Cập nhật thông tin đơn hàng (buyer chỉ có thể hủy)
router.put('/buyer/orders/:orderId', requireAuth, (req, res) => {
    const { orderId } = req.params;
    const { action } = req.body; // 'cancel' hoặc 'update_contact'
    
    // TODO: Kiểm tra orderId có thuộc về buyer này không
    
    if (action === 'cancel') {
        res.json({
            success: true,
            message: `Đã hủy đơn hàng ${orderId}`,
            cancelledBy: req.user.email
        });
    } else {
        res.json({
            success: true,
            message: `Đã cập nhật đơn hàng ${orderId}`,
            updatedBy: req.user.email
        });
    }
});

// Lưu sản phẩm yêu thích
router.post('/buyer/favorites', requireAuth, (req, res) => {
    const { productId } = req.body;
    
    res.json({
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        data: {
            productId,
            userId: req.user.user_id,
            addedAt: new Date().toISOString()
        }
    });
});

// Xem danh sách yêu thích
router.get('/buyer/favorites', requireAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Danh sách sản phẩm yêu thích',
        data: [
            {
                id: 1,
                name: 'Nhà phố 3 tầng',
                price: 2500000,
                location: 'Quận 1, TP.HCM',
                addedAt: '2024-01-15'
            },
            {
                id: 3,
                name: 'Biệt thự vườn',
                price: 5000000,
                location: 'Quận 2, TP.HCM',
                addedAt: '2024-01-12'
            }
        ]
    });
});

// Xóa khỏi danh sách yêu thích
router.delete('/buyer/favorites/:productId', requireAuth, (req, res) => {
    const { productId } = req.params;
    
    res.json({
        success: true,
        message: `Đã xóa sản phẩm ${productId} khỏi danh sách yêu thích`
    });
});

module.exports = router;
